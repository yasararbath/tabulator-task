import React, { useState, useRef, useEffect } from "react";
import { ReactTabulator } from "react-tabulator";
import "tabulator-tables/dist/css/tabulator.min.css";
import "react-tabulator/lib/styles.css";
import "./EditableTable.css";
import { tableData } from "./constants";

const defaultData = tableData;

const EditableTable = () => {
  const [data, setData] = useState(defaultData);
  const [selectedRows, setSelectedRows] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const tableRef = useRef(null);
  const [headerChecked, setHeaderChecked] = useState(false);
  const [undoData, setUndoData] = useState([]);
  const [editedData, setEditedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const editCheck = function (cell) {
    var data = cell.getRow().getData();
    return data.editable;
  };

  const columns = [
    {
      formatter: (cell) => {
        const rowData = cell.getRow().getData();
        const isChecked = rowData.checkbox ? "checked" : "";
        return `<input type="checkbox" ${isChecked} />`;
      },
      field: "checkbox",
      headerVisible: false,
      titleFormatter: function () {
        return `<input
            type="checkbox"
            id="header-check" class="header-checkbox"
           ${headerChecked ? "checked" : ""}
            />`;
      },
      hozAlign: "center",
      headerSort: false,
      headerClick: function (e, column) {
        const headerCheckbox = document.getElementById("header-check");
        setHeaderChecked(headerCheckbox.checked);
        const alteredData = data.map((rowData) => {
          rowData.checkbox = headerCheckbox.checked;
          return rowData;
        });
        setData(alteredData);
      },
      headerHozAlign: "center",
    },
    {
      title: "Name",
      field: "name",
      headerFilter: "input",
      editor: "input",
      editable: editCheck,
    },
    {
      title: "Age",
      field: "age",
      headerFilter: "input",
      editor: "input",
      editable: editCheck,
    },
    {
      title: "Gender",
      field: "gender",
      headerFilter: "select",
      headerFilterParams: { values: ["", "Male", "Female"] },
      editor: "select",
      editable: editCheck,
      editorParams: { values: ["Male", "Female"] },
      headerFilterFunc: "=",
    },
    {
      title: "Rating",
      field: "rating",
      headerFilter: "input",
      editor: "input",
      editable: editCheck,
    },
  ];

  const handleRowSelection = (selectData, rows = null) => {
    setEditMode(false);
    const selectedIds = selectData
      .filter((data) => data.checkbox)
      .map((t) => t.id);
    setSelectedRows([...selectedIds]);
  };

  const handleEdit = () => {
    setData((prevData) => {
      return prevData.map((row) => {
        if (selectedRows.includes(row.id)) {
          setEditedData((prevEditedData) => {
            if (!prevEditedData.find((data) => data.id === row.id)) {
              return [...prevEditedData, row];
            }
            return prevEditedData;
          });
          return { ...row, editable: true };
        }
        return { ...row, disabled: true };
      });
    });
  };

  const handleSave = () => {
    setEditMode(false);
    setData((prevData) => {
      setUndoData([...editedData]);
      setEditedData([]);
      return prevData.map((row) => ({ ...row, editable: false }));
    });
  };

  const handleUndo = () => {
    setEditMode(false);
    setData((prevData) => {
      return prevData.map((row) => {
        const data = undoData.find((data) => data.id === row.id);
        if (data) {
          return { ...data, editable: row.editable, checkbox: row.checkbox };
        }
        return row;
      });
    });
    setUndoData([]);
  };

  const events = {
    rowClick: (e, row) => {
      const checkboxCell = row.getCell("checkbox");
      const checkboxInput = checkboxCell
        .getElement()
        .querySelector('input[type="checkbox"]');
      const res = row.getData();
      if (e.target === checkboxInput) {
        const alteredData = data.map((rowData) => {
          if (res.id == rowData.id) {
            rowData.checkbox = !rowData.checkbox;
            rowData.editable = !rowData.editable;
            rowData.disabled = !rowData.disabled;
          }
          const editedData1 = editedData.find((data) => data.id === rowData.id);
          if (editedData1) {
            return {
              ...editedData1,
              checkbox: rowData.checkbox,
              editable: rowData.editable,
            };
          }
          return rowData;
        });
        setData(alteredData);
      }
    },
    rowSelectionChanged: (data) => {
      handleRowSelection(data);
    },
  };

  const rowFormatter = (row) => {
    const data = row.getData();
    if (!data.editable && data.disabled) {
      row.getElement().classList.add(editedData?.length ? "disable" : "enable");
    } else {
      row
        .getElement()
        .classList.remove(editedData?.length ? "disable" : "enable");
    }
  };

  useEffect(() => {
    handleRowSelection(data);
  }, [data]);

  useEffect(() => {
    if (selectedRows.length === 0) {
      setData((prevData) => {
        return prevData.map((row) => ({
          ...row,
          disabled: false,
          editable: false,
        }));
      });
      setEditedData([]);
    }
  }, [selectedRows.length]);

  return (
    <div className="container">
      <h1>Tabulator</h1>
      {selectedRows.length > 0 && (
        <div className="action-buttons">
          <button
            className="btn edit-btn"
            id="edit-button"
            onClick={handleEdit}
            disabled={editedData?.length}
          >
            {selectedRows.length > 1 ? "Multi Edit" : "Edit"}
          </button>
          <button
            className="btn save-btn"
            id="save-button"
            onClick={handleSave}
            disabled={!editedData?.length}
          >
            Save
          </button>
          <button
            className="btn undo-btn"
            id="undo-button"
            onClick={handleUndo}
            disabled={!undoData.length}
          >
            Undo
          </button>
        </div>
      )}
      <ReactTabulator
        ref={tableRef}
        columns={columns}
        data={data}
        layout="fitColumns"
        selectable={false}
        events={events}
        rowFormatter={rowFormatter}
        options={{
          headerFilterPlaceholder: "Filter...",
          headerSortTristate: true,
          movableRows: true,
          pagination: "local",
          paginationSize: 5,
          paginationInitialPage: currentPage,
          paginationCounter: function (pageSize, currentRow, currentPage) {
            setCurrentPage(currentPage);
          },
        }}
      />
    </div>
  );
};

export default EditableTable;

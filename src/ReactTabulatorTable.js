import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { ReactTabulator } from 'react-tabulator';
import 'react-tabulator/lib/styles.css'; // default theme
import 'react-tabulator/css/tabulator.min.css'; // default theme

const ForwardRefTabulator = forwardRef((props, ref) => {

  const tabulatorRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getTableInstance: () => tabulatorRef.current.getTableInstance(), // Access the Tabulator instance
  }));

  return <ReactTabulator {...props} ref={tabulatorRef} />;
});

export default ForwardRefTabulator;
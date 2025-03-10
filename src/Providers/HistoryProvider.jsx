import { createContext, useContext, useEffect, useRef, useState } from "react";

const HistoryContext = createContext(null);

export function HistoryProvider({ children }) {
  const history = useRef([]);
  const historyIndex = useRef(0);
  const initialized = useRef(false);
  const [, forceUpdate] = useState({});
  
  useEffect(() => {
    if (!initialized.current && history.current.length === 0) {
      initialized.current = true;
    }
  }, []);


  function addToHistory(newShapes) {
    if (!initialized.current) return
    //deletes alternative branches on the history
    if (historyIndex.current < history.current.length - 1) {
      history.current = history.current.slice(0, historyIndex.current + 1);
    }

    history.current.push(newShapes);
    historyIndex.current = history.current.length - 1;

    //limit history size
    if (history.current.length > 100) {
      history.current.shift();
      historyIndex.current--;
    }
    forceUpdate({})
  }

  function undo() {
    if (historyIndex.current > 0) {
      historyIndex.current--;
      return history.current[historyIndex.current];
    }
    return history.current[historyIndex.current];
  }

  function redo() {
    if (historyIndex.current < history.current.length - 1) {
      historyIndex.current++;
      return history.current[historyIndex.current];
    }
    return history.current[historyIndex.current];
  }

  function canUndo() {
    if (history.current.length === 0) return false
    if (historyIndex.current === 0) return false;
    return true;
  }

  function canRedo() {
    if (history.current.length === 0) return false
    if (historyIndex.current === history.current.length - 1) return false;
    return true;
  }

  return (
    <HistoryContext.Provider
      value={{
        history,
        historyIndex,
        addToHistory,
        undo,
        redo,
        canUndo,
        canRedo,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (context === null) {
    throw new Error("useHistory must be inside a HistoryProvider");
  }
  return context;
}

import { createContext, useContext, useEffect, useRef } from "react";

const HistoryContext = createContext(null);

export function HistoryProvider({ children }) {
  const history = useRef([]);
  const historyIndex = useRef(0);
  const initialized = useRef(false);

  useEffect(() => {
    try {
      if (!initialized) {
        const savedShapes = JSON.parse(localStorage.getItem("shapes") || []);
        history.current = [savedShapes];
        initialized.current = true;
      }
    } catch (error) {
      console.error('error initializing history', error)
      history.current = [[]]
    }
  });

  function addToHistory(newShapes) {
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
    if (historyIndex.current === 0) return false;
    return true;
  }

  function canRedo() {
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

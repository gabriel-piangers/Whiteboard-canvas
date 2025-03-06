export let history = [JSON.parse(localStorage.getItem("shapes"))];
export let currentHistoryIndex = 0;

export function addToHistory(newShapes) {
  //deletes alternative branches on the history
  if (currentHistoryIndex < history.length - 1) {
    history = history.slice(0, currentHistoryIndex + 1);
  }

  history.push(newShapes);
  currentHistoryIndex = history.length - 1;

  //limit history size
  if (history.length > 100) {
    history.shift()
    currentHistoryIndex--;
  } 
}

export function undo() {
  if (currentHistoryIndex > 0) {
    currentHistoryIndex--;
    return history[currentHistoryIndex];
  }
  return history[currentHistoryIndex];
}

export function redo() {
  if (currentHistoryIndex < history.length - 1) {
    currentHistoryIndex++;
    return history[currentHistoryIndex];
  }
  return history[currentHistoryIndex];
}

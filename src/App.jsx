import { useEffect, useReducer, useRef } from "react";
import { ToolBar } from "./components/ToolBar";
import { Canvas } from "./components/Canvas";
import { shapesReducer } from "./scripts/shapes";
import { ToolsProvider } from "./components/ToolsContext";
import { addToHistory } from "./scripts/history";
import { undo, redo } from "./scripts/history";

export function App() {
  const lastAction = useRef(null);
  const [shapes, dispatchShapes] = useReducer(
    shapesReducer,
    JSON.parse(localStorage.getItem("shapes")) || []
  );

  useEffect(() => {
    localStorage.setItem("shapes", JSON.stringify(shapes));

    const updateHistory = ["add", "clear"];
    if (updateHistory.includes(lastAction.current)) {
      addToHistory([...shapes]);
    }

    lastAction.current = null;
  }, [shapes]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "z") {
        event.preventDefault();
        const newShapes = undo();
        dispatchShapes({ type: "set", shapes: newShapes });
      } else if ((event.ctrlKey || event.metaKey) && event.key === "y") {
        event.preventDefault();
        const newShapes = redo();
        dispatchShapes({ type: "set", shapes: newShapes });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="canvas-container">
      <ToolsProvider>
        <div className="tools-bar-container">
        <ToolBar dispatchShapes={dispatchShapes} lastAction={lastAction} />
        </div>

        <Canvas
          shapes={shapes}
          dispatchShapes={dispatchShapes}
          lastAction={lastAction}
        />
      </ToolsProvider>
    </div>
  );
}

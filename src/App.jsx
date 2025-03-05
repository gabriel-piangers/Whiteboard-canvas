import { useReducer } from "react";
import { ToolBar } from "./components/ToolBar";
import { Canvas } from "./components/Canvas";
import { shapesReducer } from "./utils/shapes";
import { ToolsProvider } from "./components/ToolsContext";

export function App() {
  const [shapes, dispatchShapes] = useReducer(
    shapesReducer,
    JSON.parse(localStorage.getItem("shapes")) || []
  );

  return (
    <div className="canvas-container">
      <ToolsProvider>
        <ToolBar dispatchShapes={dispatchShapes} />

        <Canvas shapes={shapes} dispatchShapes={dispatchShapes} />
      </ToolsProvider>
    </div>
  );
}

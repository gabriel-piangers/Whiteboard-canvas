import { useRef } from "react";
import { ToolBar } from "./components/ToolBar";
import { Canvas } from "./components/Canvas";
import { ShapeProvider } from "./Providers/ShapeProvider";
import { ToolsProvider } from "./Providers/ToolsProvider";
import { HistoryProvider } from "./Providers/HistoryProvider";
import { TransformProvider } from "./Providers/TransformProvider";

export function App() {
  const lastAction = useRef(null);

  return (
    <div className="canvas-container">
      <ShapeProvider>
        <HistoryProvider>
          <ToolsProvider>
            <div className="tools-bar-container">
              <ToolBar lastAction={lastAction} />
            </div>

            <TransformProvider>
              <Canvas lastAction={lastAction} />
            </TransformProvider>
          </ToolsProvider>
        </HistoryProvider>
      </ShapeProvider>
    </div>
  );
}

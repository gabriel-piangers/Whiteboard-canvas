import { useRef } from "react";
import { ToolBar } from "./components/ToolBar";
import { Canvas } from "./components/Canvas";
import { ShapeProvider } from "./Providers/ShapeProvider";
import { ToolsProvider } from "./Providers/ToolsProvider";
import { HistoryProvider } from "./Providers/HistoryProvider";

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

            <Canvas lastAction={lastAction} />
          </ToolsProvider>
        </HistoryProvider>
      </ShapeProvider>
    </div>
  );
}

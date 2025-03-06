import { useRef, useEffect, useState } from "react";
import { getShapeFunctions } from "../scripts/shapeFunctions";
import { getRedrawFunctions } from "../scripts/redrawFunctions";
import { useToolsContext } from "./ToolsContext";

export function Canvas({ shapes, dispatchShapes, lastAction }) {
  const [currentShape, setCurrentShape] = useState(null);

  const { startShape, textInsertion, updateShape, finishShape } =
    getShapeFunctions(dispatchShapes, currentShape, setCurrentShape, lastAction);

  const { redrawBaseCanvas, redrawTempCanvas } = getRedrawFunctions(
    shapes,
    currentShape
  );

  const baseCanvasRef = useRef(null);
  const tempCanvasRef = useRef(null);

  const { selectedTool, selectedColor, selectedWidth } = useToolsContext();

  useEffect(() => {
    redrawBaseCanvas(baseCanvasRef);
  }, [shapes, currentShape, redrawBaseCanvas]);

  useEffect(() => {
    redrawTempCanvas(tempCanvasRef);
  }, [currentShape, redrawTempCanvas]);

  return (
    <div>
      <canvas
        ref={baseCanvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        className="canvas base-canvas"
        style={{ position: "absolute", zIndex: 1 }}
      />

      <canvas
        ref={tempCanvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        className="canvas temp-canvas"
        style={{ position: "absolute", zIndex: 2 }}
        onMouseDown={(event) => {
          const canvas = baseCanvasRef.current;
          const rect = canvas.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;
          startShape(x, y, selectedColor, selectedWidth, selectedTool);
        }}
        onMouseMove={(event) => {
          if (selectedTool !== "text") {
            const canvas = baseCanvasRef.current;
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            updateShape(x, y);
          }
        }}
        onMouseUp={() => {
          if (selectedTool !== "text") {
            finishShape();
          }
        }}
        onClick={(event) => {
          if (selectedTool === "text") {
            textInsertion(event.clientX, event.clientY);
          }
        }}
      />
    </div>
  );
}

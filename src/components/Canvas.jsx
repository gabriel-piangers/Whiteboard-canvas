import { useRef, useEffect, useState, useCallback } from "react";
import { getShapeFunctions } from "../scripts/shapeFunctions";
import { getRedrawFunctions } from "../scripts/redrawFunctions";
import { useToolsContext } from "./ToolsContext";

export function Canvas({ shapes, dispatchShapes, lastAction }) {
  const [currentShape, setCurrentShape] = useState(null);
  const [screenSize, setScreenSize] = useState({
    x: window.innerWidth,
    y: window.innerHeight,
  });
  const scaleRef = useRef(1);
  const offsetXRef = useRef(0);
  const offsetYRef = useRef(0);

  const { startShape, textInsertion, updateShape, finishShape } =
    getShapeFunctions(
      dispatchShapes,
      currentShape,
      setCurrentShape,
      lastAction
    );

  const { redrawBaseCanvas, redrawTempCanvas } = getRedrawFunctions(
    shapes,
    currentShape
  );

  const baseCanvasRef = useRef(null);
  const tempCanvasRef = useRef(null);

  const { selectedTool, selectedColor, selectedWidth } = useToolsContext();

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({ x: window.innerWidth, y: window.innerHeight });
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const applyTransform = useCallback(() => {
    const baseCanvas = baseCanvasRef.current;
    const tempCanvas = tempCanvasRef.current;

    if (!baseCanvas || !tempCanvas) return;

    const baseCtx = baseCanvasRef.current.getContext("2d");
    const tempCtx = tempCanvasRef.current.getContext("2d");

    baseCtx.setTransform(1, 0, 0, 1, 0, 0); // Resets the transform
    baseCtx.clearRect(0, 0, baseCanvas.width, baseCanvas.height);
    baseCtx.translate(offsetXRef.current, offsetYRef.current);
    baseCtx.scale(scaleRef.current, scaleRef.current);

    tempCtx.setTransform(1, 0, 0, 1, 0, 0); // Resets the transform
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.translate(offsetXRef.current, offsetYRef.current);
    tempCtx.scale(scaleRef.current, scaleRef.current);

    redrawTempCanvas(tempCanvasRef);
    redrawBaseCanvas(baseCanvasRef);
  }, [shapes, currentShape, redrawBaseCanvas, redrawTempCanvas]);

  useEffect(() => {
    const handleZoom = (event) => {
      event.preventDefault();

      if (!baseCanvasRef.current) return;

      const rect = baseCanvasRef.current.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      //converts mouse coords to the canvas coords
      const canvasX = (mouseX - offsetXRef.current) / scaleRef.current;
      const canvasY = (mouseY - offsetYRef.current) / scaleRef.current;

      const zoom = event.deltaY < 0 ? 1.1 : 0.9;
      scaleRef.current *= zoom;

      //adjust offset to centralize the mouse position
      offsetXRef.current = mouseX - canvasX * scaleRef.current;
      offsetYRef.current = mouseY - canvasY * scaleRef.current;

      applyTransform();
    };

    window.addEventListener("wheel", handleZoom, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleZoom);
    };
  });

  useEffect(() => {
    redrawBaseCanvas(baseCanvasRef);
  }, [shapes, currentShape, redrawBaseCanvas]);

  useEffect(() => {
    redrawTempCanvas(tempCanvasRef);
  }, [currentShape, redrawTempCanvas, scaleRef]);

  function getMouseCoords(event) {
    const canvas = baseCanvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    return [mouseX, mouseY];
  }

  function getCanvasCoords(event) {
    const [mouseX, mouseY] = getMouseCoords(event);

    const canvasX = (mouseX - offsetXRef.current) / scaleRef.current;
    const canvasY = (mouseY - offsetYRef.current) / scaleRef.current;

    return [canvasX, canvasY];
  }

  let panning = null;

  return (
    <div>
      <canvas
        ref={baseCanvasRef}
        width={screenSize.x}
        height={screenSize.y}
        className="canvas base-canvas"
        style={{ position: "absolute", zIndex: 1 }}
      />

      <canvas
        ref={tempCanvasRef}
        width={screenSize.x}
        height={screenSize.y}
        className="canvas temp-canvas"
        style={{ position: "absolute", zIndex: 2 }}
        onMouseDown={(event) => {
          const [canvasX, canvasY] = getCanvasCoords(event);
          if (event.button === 0) {
            startShape(
              canvasX,
              canvasY,
              selectedColor,
              selectedWidth,
              selectedTool
            );
          } else if (event.button === 2) {
            panning = {
              startX: canvasX * scaleRef.current,
              startY: canvasY * scaleRef.current,
            };
          }
        }}
        onMouseMove={(event) => {
          if (panning) {
            const [mouseX, mouseY] = getMouseCoords(event);
            offsetXRef.current = mouseX - panning.startX;
            offsetYRef.current = mouseY - panning.startY;

            applyTransform();
          } else {
            const [canvasX, canvasY] = getCanvasCoords(event);
            if (selectedTool !== "text") {
              updateShape(canvasX, canvasY);
            }
          }
        }}
        onMouseUp={() => {
          if (panning) {
            panning = null;
          } else if (selectedTool !== "text") {
            finishShape();
          }
        }}
        onClick={(event) => {
          if (selectedTool === "text") {
            const [canvasX, canvasY] = getCanvasCoords(event);
            textInsertion(canvasX, canvasY);
          }
        }}
        onContextMenu={(event) => {
          event.preventDefault();
          return false;
        }}
      />
    </div>
  );
}

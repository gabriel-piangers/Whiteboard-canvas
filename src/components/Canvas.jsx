import { useRef, useEffect, useState } from "react";
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
  const maxZoom = 10;
  const minZoom = 0.1;

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
      if (
        (zoom > 1 && scaleRef.current < maxZoom) ||
        (zoom < 1 && scaleRef.current > minZoom)
      ) {
        scaleRef.current *= zoom;

        //adjust offset to centralize the mouse position
        offsetXRef.current = mouseX - canvasX * scaleRef.current;
        offsetYRef.current = mouseY - canvasY * scaleRef.current;

        redrawBaseCanvas(baseCanvasRef, offsetXRef, offsetYRef, scaleRef);
      }
    };

    window.addEventListener("wheel", handleZoom, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleZoom);
    };
  });

  useEffect(() => {
    redrawBaseCanvas(baseCanvasRef, offsetXRef, offsetYRef, scaleRef);
  }, [shapes, currentShape, redrawBaseCanvas]);

  useEffect(() => {
    redrawTempCanvas(tempCanvasRef, offsetXRef, offsetYRef, scaleRef);
  }, [currentShape, redrawTempCanvas]);

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

            redrawBaseCanvas(baseCanvasRef, offsetXRef, offsetYRef, scaleRef);
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
          const [canvasX, canvasY] = getCanvasCoords(event);
          if (selectedTool === "text") {
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

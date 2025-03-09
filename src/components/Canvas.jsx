import { useRef, useEffect, useState } from "react";
import { getShapeFunctions } from "../scripts/shapeFunctions";
import { getRedrawFunctions } from "../scripts/redrawFunctions";
import { useToolsContext } from "./ToolsContext";
import { ZoomBar } from "./ZoomBar";

export function Canvas({ shapes, dispatchShapes, lastAction }) {
  const [currentShape, setCurrentShape] = useState(null);
  const [screenSize, setScreenSize] = useState({
    x: window.innerWidth,
    y: window.innerHeight,
  });

  const [scale, setScale] = useState(1);
  const offsetXRef = useRef(0);
  const offsetYRef = useRef(0);
  const maxZoom = 5;
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
      if (currentShape) return
      event.preventDefault();
      const zoom = event.deltaY < 0 ? 1.1 : 0.9;
      let newScale = scale * zoom;

      if (newScale < minZoom) newScale = minZoom;
      if (newScale > maxZoom) newScale = maxZoom;
      setScale(newScale);

      const [mouseX, mouseY] = getMouseCoords(event);
      const [canvasX, canvasY] = getCanvasCoords(event);

      //adjust offset to centralize the mouse position
      offsetXRef.current = mouseX - canvasX * newScale;
      offsetYRef.current = mouseY - canvasY * newScale;
    };

    window.addEventListener("wheel", handleZoom, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleZoom);
    };
  });

  useEffect(() => {
    redrawBaseCanvas(baseCanvasRef, offsetXRef, offsetYRef, scale);
  }, [shapes, currentShape, redrawBaseCanvas, scale]);

  useEffect(() => {
    redrawTempCanvas(tempCanvasRef, offsetXRef, offsetYRef, scale);
  }, [currentShape, redrawTempCanvas, scale]);

  function getMouseCoords(event) {
    const canvas = baseCanvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    return [mouseX, mouseY];
  }

  function getCanvasCoords(event) {
    const [mouseX, mouseY] = getMouseCoords(event);

    const canvasX = (mouseX - offsetXRef.current) / scale;
    const canvasY = (mouseY - offsetYRef.current) / scale;

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
          if (event.button === 0  && selectedTool !== 'text') {
            startShape(
              canvasX,
              canvasY,
              selectedColor,
              selectedWidth,
              selectedTool
            );
          } else if (event.button === 2) {
            panning = {
              startX: canvasX * scale,
              startY: canvasY * scale,
            };
          }
        }}
        onMouseMove={(event) => {
          if (panning) {
            const [mouseX, mouseY] = getMouseCoords(event);
            offsetXRef.current = mouseX - panning.startX;
            offsetYRef.current = mouseY - panning.startY;

            redrawBaseCanvas(baseCanvasRef, offsetXRef, offsetYRef, scale);
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
          const [mouseX, mouseY] = getMouseCoords(event);
          const [canvasX, canvasY] = getCanvasCoords(event);
          if (selectedTool === "text") {
            textInsertion(mouseX, mouseY, canvasX, canvasY, selectedColor, scale);
          }
        }}
        onContextMenu={(event) => {
          event.preventDefault();
          return false;
        }}
      />

      <ZoomBar scale={scale} setScale={setScale}/>
    </div>
  );
}

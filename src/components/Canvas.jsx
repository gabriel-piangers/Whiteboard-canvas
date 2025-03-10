import { useRef, useEffect, useState } from "react";
import { getShapeFunctions } from "../scripts/shapeFunctions";
import { getRedrawFunctions } from "../scripts/redrawFunctions";
import { useToolsContext } from "../Providers/ToolsProvider";
import { ZoomBar } from "./ZoomBar";
import { TextOptions } from "./TextOptions";
import { TextInput } from "./TextInput";
import { useShapes } from "../Providers/ShapeProvider";
import { useHistory } from "../Providers/HistoryProvider";

export function Canvas({ lastAction }) {
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

  const { shapes, dispatchShapes } = useShapes();
  const { addToHistory, undo, redo } = useHistory();

  const { startShape, startText, updateShape, finishShape } = getShapeFunctions(
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

  const defaultTextOptions = {
    active: false,
    x: 222,
    y: 222,
    font: "Arial",
    size: 16,
    color: "black",
    align: "left",
    bold: false,
    italic: false,
    underline: false,
  };
  const [inputValue, setInputValue] = useState("");
  const [textOptions, setTextOptions] = useState(defaultTextOptions);

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({ x: window.innerWidth, y: window.innerHeight });
    };

    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "z") {
        event.preventDefault();
        const newShapes = undo();
        lastAction.current = "undo";
        dispatchShapes({ type: "set", shapes: newShapes });
      } else if ((event.ctrlKey || event.metaKey) && event.key === "y") {
        event.preventDefault();
        const newShapes = redo();
        lastAction.current = "redo";
        dispatchShapes({ type: "set", shapes: newShapes });
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("shapes", JSON.stringify(shapes));

    const noUpdate = ["undo", "redo"];
    if (!noUpdate.includes(lastAction.current)) {
      addToHistory([...shapes]);
    }

    lastAction.current = null;
  }, [shapes]);

  useEffect(() => {
    const handleZoom = (event) => {
      if (currentShape) return;
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

  function pan(x, y) {
    offsetXRef.current += x;
    offsetYRef.current += y;
    redrawBaseCanvas(baseCanvasRef, offsetXRef, offsetYRef, scale);
    redrawTempCanvas(tempCanvasRef, offsetXRef, offsetYRef, scale);
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
          if (event.button === 0 && selectedTool !== "text") {
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
          let [mouseX, mouseY] = getMouseCoords(event);
          const [canvasX, canvasY] = getCanvasCoords(event);

          if (selectedTool === "text") {
            if (mouseX > window.innerWidth - 20) {
              mouseX += -20
              pan(-20, 0)
            }
            if (mouseY > window.innerHeight - 20) {
              mouseY += -20 *scale
              pan(0, -20)
            }
            const newTextOptions = {
              ...textOptions,
              active: true,
              x: mouseX,
              y: mouseY,
            };
            setTextOptions(newTextOptions);
            startText(canvasX, canvasY, newTextOptions);
          }
        }}
        onContextMenu={(event) => {
          event.preventDefault();
          return false;
        }}
      />
      {textOptions.active && (
        <div
          tabIndex={0}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
              lastAction.current = "add";
              const newText = {
                ...currentShape,
                content: inputValue,
                font: `
                ${textOptions.italic ? "italic" : ""}
                ${textOptions.bold ? "bold" : ""} 
                ${textOptions.size}px 
                ${textOptions.font}
                `,
                color: textOptions.color,
                textAlign: textOptions.align,
                underline: textOptions.underline,
              };
              if (newText.content.trim() !== "")
                dispatchShapes({ type: "add", shape: newText });
              setCurrentShape(null);
              setInputValue("");
              setTextOptions(defaultTextOptions);
            }
          }}
        >
          <TextOptions
            x={textOptions.x}
            y={textOptions.y}
            textOptions={textOptions}
            setTextOptions={setTextOptions}
          />
          <TextInput
            x={textOptions.x}
            y={textOptions.y}
            textOptions={textOptions}
            scale={scale}
            inputValue={inputValue}
            setInputValue={setInputValue}
            pan={pan}
          />
        </div>
      )}
      <ZoomBar scale={scale} setScale={setScale} />
    </div>
  );
}

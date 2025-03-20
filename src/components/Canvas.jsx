import { useRef, useEffect, useState } from "react";
import { GetShapeFunctions } from "../scripts/shapeFunctions";
import { GetRedrawFunctions } from "../scripts/redrawFunctions";
import { useToolsContext } from "../Providers/ToolsProvider";
import { ZoomBar } from "./ZoomBar";
import { TextOptions } from "./TextOptions";
import { TextInput } from "./TextInput";
import { useShapes } from "../Providers/ShapeProvider";
import { useHistory } from "../Providers/HistoryProvider";
import {
  getMouseCoords,
  getCanvasCoords,
  mouseToCanvas,
} from "../scripts/canvasUtils";
import { SelectionContainer } from "./SelectionContainer";
import { useTransform } from "../Providers/TransformProvider";

export function Canvas({ lastAction }) {
  const [currentShape, setCurrentShape] = useState(null);
  const [screenSize, setScreenSize] = useState({
    x: window.innerWidth,
    y: window.innerHeight,
  });

  const {offsetXRef, offsetYRef, scale, setScale} = useTransform()
  const [panning, setPanning] = useState(null);
  const maxZoom = 5;
  const minZoom = 0.1;

  const { shapes, dispatchShapes } = useShapes();
  const { addToHistory, undo, redo } = useHistory();

  const {
    startShape,
    startText,
    updateShape,
    moveShape,
    finishShape,
    getShapeById,
  } = GetShapeFunctions(
    shapes,
    dispatchShapes,
    currentShape,
    setCurrentShape,
    lastAction
  );

  const { redrawBaseCanvas, redrawTempCanvas, selectShape, getSelection } =
    GetRedrawFunctions(shapes, currentShape);

  const { selectedTool, selectedColor, selectedWidth } = useToolsContext();

  const baseCanvasRef = useRef(null);
  const tempCanvasRef = useRef(null);

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

  // const [selectedShape, setSelectedShape] = useState(null);
  const [selection, setSelection] = useState(null);
  const [movingShape, setMovingShape] = useState(null);
  const selectionRef = useRef(null);

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
    const handleMouseMove = (event) => {
      if (!movingShape) return;
      const diffX = event.clientX - movingShape.startX;
      const diffY = event.clientY - movingShape.startY;

      const selection = document.querySelector(".selection-container");
      if (selection)
        selection.style.transform = `translate(${diffX}px, ${diffY}px)`;
    };
    const handleMouseUp = (event) => {
      if (!movingShape) return;
      const diffX =
        mouseToCanvas(event.clientX, offsetXRef, scale) -
        mouseToCanvas(movingShape.startX, offsetXRef, scale);
      const diffY =
        mouseToCanvas(event.clientY, offsetYRef, scale) -
        mouseToCanvas(movingShape.startY, offsetYRef, scale);
      const updatedShape = moveShape(diffX, diffY, movingShape.shape);
      dispatchShapes({ type: "update", shape: updatedShape });
      setMovingShape(null);
      setSelection(getSelection(updatedShape));
      const selection = document.querySelector(".selection-container");
      if (selection) {
        selection.style.transform = `translate(0px, 0px)`;
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [movingShape]);

  useEffect(() => {
    localStorage.setItem("shapes", JSON.stringify(shapes));

    const dontUpdate = ["undo", "redo"];
    if (!dontUpdate.includes(lastAction.current)) {
      addToHistory([...shapes]);
    }

    lastAction.current = null;
  }, [shapes]);

  useEffect(() => {
    const handleZoom = (event) => {
      if (currentShape || movingShape) return;
      event.preventDefault();
      const zoom = event.deltaY < 0 ? 1.1 : 0.9;
      let newScale = scale * zoom;

      if (newScale < minZoom) newScale = minZoom;
      if (newScale > maxZoom) newScale = maxZoom;
      setScale(newScale);

      const [mouseX, mouseY] = getMouseCoords(event, baseCanvasRef);
      const [canvasX, canvasY] = getCanvasCoords(
        event,
        baseCanvasRef,
        offsetXRef,
        offsetYRef,
        scale
      );

      //adjust offset to centralize the mouse position
      offsetXRef.current = mouseX - canvasX * newScale;
      offsetYRef.current = mouseY - canvasY * newScale;
    };

    window.addEventListener("wheel", handleZoom, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleZoom);
    };
  }, [scale, currentShape, movingShape]);

  useEffect(() => {
    redrawBaseCanvas(baseCanvasRef);
    if (selection) {
      const newSelectedShape = getShapeById(selection.selectedShape.id);
      setSelection(getSelection(newSelectedShape));
    }
  }, [shapes, currentShape, scale]);

  useEffect(() => {
    redrawTempCanvas(tempCanvasRef);
  }, [currentShape, redrawTempCanvas, scale]);

  function pan(x, y) {
    offsetXRef.current += x;
    offsetYRef.current += y;
    redrawBaseCanvas(baseCanvasRef);
    redrawTempCanvas(tempCanvasRef);
    if (selection) {
      setSelection(getSelection(selection.selectedShape));
    }
  }

  function getCursor() {
    if (currentShape && currentShape.type === "eraser") return "none";
    if (panning) return 'url("/images/grab.svg") 0 24, auto';

    switch (selectedTool) {
      case "pen":
        return 'url("/images/pencil.svg") 0 24, auto';
      case "eraser":
        return 'url("/images/eraser.svg") 0 24, auto';
      case "text":
        return 'url("/images/text-cursor.svg"), auto';
      default:
        return "auto";
    }
  }

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
        style={{
          position: "absolute",
          zIndex: 2,
          cursor: getCursor(),
        }}
        onMouseDown={(event) => {
          const [canvasX, canvasY] = getCanvasCoords(
            event,
            baseCanvasRef,
            offsetXRef,
            offsetYRef,
            scale
          );
          if (
            event.button === 0 &&
            selectedTool !== "text" &&
            selectedTool !== "select"
          ) {
            startShape(
              canvasX,
              canvasY,
              selectedColor,
              selectedWidth,
              selectedTool
            );
          } else if (event.button === 2) {
            setPanning({
              startX: canvasX * scale,
              startY: canvasY * scale,
            });
          }
        }}
        onMouseMove={(event) => {
          if (panning) {
            const [mouseX, mouseY] = getMouseCoords(event, baseCanvasRef);
            offsetXRef.current = mouseX - panning.startX;
            offsetYRef.current = mouseY - panning.startY;

            redrawBaseCanvas(baseCanvasRef);
            if (selection) setSelection(getSelection(selection.selectedShape));
          } else {
            if (selectedTool !== "text" && selectedTool !== "select") {
              const [canvasX, canvasY] = getCanvasCoords(
                event,
                baseCanvasRef,
                offsetXRef,
                offsetYRef,
                scale
              );
              updateShape(canvasX, canvasY, baseCanvasRef);
            }
          }
        }}
        onMouseUp={() => {
          if (panning) {
            setPanning(null);
          } else if (selectedTool !== "text" && selectedTool !== "select") {
            finishShape();
          }
        }}
        onClick={(event) => {
          let [mouseX, mouseY] = getMouseCoords(event, baseCanvasRef);
          const [canvasX, canvasY] = getCanvasCoords(
            event,
            baseCanvasRef,
            offsetXRef,
            offsetYRef,
            scale
          );

          if (selectedTool === "text") {
            if (mouseX > window.innerWidth - 20) {
              mouseX += -20;
              pan(-20, 0);
            }
            if (mouseY > window.innerHeight - 20) {
              mouseY += -20 * scale;
              pan(0, -20);
            }
            const newTextOptions = {
              ...textOptions,
              active: true,
              x: mouseX,
              y: mouseY,
            };
            setTextOptions(newTextOptions);
            startText(canvasX, canvasY, newTextOptions);
          } else if (selectedTool === "select") {
            const newSelectedShape = selectShape(
              mouseX,
              mouseY,
              baseCanvasRef,
            );
            if (newSelectedShape) {
              setSelection(getSelection(newSelectedShape));
              console.log("selectedShape: ", newSelectedShape);
            } else {
              setSelection(null);
              redrawBaseCanvas(baseCanvasRef);
            }
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
              setTextOptions({ ...textOptions, active: false });
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

      {selection && (
        <SelectionContainer
          selection={selection}
          setSelection={setSelection}
          setMovingShape={setMovingShape}
          selectionRef={selectionRef}
          dispatchShapes={dispatchShapes}
        />
      )}

      <ZoomBar scale={scale} setScale={setScale} />
    </div>
  );
}

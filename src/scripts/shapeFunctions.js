import { hip } from "./math";
import { v4 } from "uuid";
import { GetRedrawFunctions } from "./redrawFunctions";
import { canvasToMouse } from "./canvasUtils";
import { useTransform } from "../Providers/TransformProvider";

export function GetShapeFunctions(
  shapes,
  dispatchShapes,
  currentShape,
  setCurrentShape,
  lastAction
) {
  const { offsetXRef, offsetYRef, scale } = useTransform();
  const { selectShape } = GetRedrawFunctions(shapes, currentShape);

  function startShape(x, y, selectedColor, selectedWidth, selectedTool) {
    let newShape = null;
    const id = v4();

    switch (selectedTool) {
      case "pen":
        newShape = {
          id: id,
          type: "freehand",
          points: [{ x, y }],
          color: selectedColor,
          lineWidth: selectedWidth,
        };
        break;
      case "line":
        newShape = {
          id: id,
          type: "line",
          startX: x,
          startY: y,
          endX: x,
          endY: y,
          color: selectedColor,
          lineWidth: selectedWidth,
        };
        break;
      case "rectangle":
        newShape = {
          id: id,
          type: "rect",
          startX: x,
          startY: y,
          width: 0,
          height: 0,
          color: selectedColor,
          lineWidth: selectedWidth,
        };
        break;
      case "circle":
        newShape = {
          id: id,
          type: "circle",
          startX: x,
          startY: y,
          centerX: x,
          centerY: y,
          radius: 0,
          color: selectedColor,
          lineWidth: selectedWidth,
        };
        break;
      case "eraser":
        newShape = {
          id: id,
          type: "eraser",
          coord: { x, y },
          border: true,
          lineWidth: selectedWidth * 2,
        };
        break;
    }
    setCurrentShape(newShape);
  }

  function updateShape(x, y, canvasRef) {
    if (!currentShape) return;

    const updatedShape = { ...currentShape };
    switch (updatedShape.type) {
      case "freehand":
        updatedShape.points.push({ x, y });
        break;
      case "line":
        updatedShape.endX = x;
        updatedShape.endY = y;
        break;
      case "rect":
        updatedShape.width = x - updatedShape.startX;
        updatedShape.height = y - updatedShape.startY;
        break;
      case "circle":
        updatedShape.radius = hip(
          x - updatedShape.centerX,
          y - updatedShape.centerY
        );
        updatedShape.centerX =
          updatedShape.startX + (x - updatedShape.startX) / 2;
        updatedShape.centerY =
          updatedShape.startY + (y - updatedShape.startY) / 2;
        break;
      case "eraser": {
        updatedShape.coord = { x, y };
        const selectedShape = selectShape(
          canvasToMouse(x, offsetXRef, scale),
          canvasToMouse(y, offsetYRef, scale),
          canvasRef,
          currentShape.lineWidth
        );
        if (selectedShape) {
          dispatchShapes({ type: "delete", shape: selectedShape });
        }
        break;
      }
    }
    setCurrentShape(updatedShape);
  }

  function startText(canvasX, canvasY, textOptions) {
    const id = v4();
    const newText = {
      id: id,
      type: "text",
      startX: canvasX,
      startY: canvasY,
      content: "",
      font: `
      ${textOptions.italic ? "italic" : "normal"}
      normal ${textOptions.bold ? "bold" : "normal"} 
      ${textOptions.size}px 
      ${textOptions.font}
      `,
      color: textOptions.color,
      textAlign: textOptions.align,
      underline: textOptions.underline,
    };

    setCurrentShape(newText);
  }

  function finishShape() {
    if (!currentShape) return;

    if (currentShape.type !== "eraser") {
      lastAction.current = "add";
      dispatchShapes({ type: "add", shape: currentShape });
    }

    setCurrentShape(null);
  }

  function moveShape(diffX, diffY, shape) {
    switch (shape.type) {
      case "freehand": {
        const newPoints = shape.points.map((point) => {
          return {
            x: point.x + diffX,
            y: point.y + diffY,
          };
        });
        return { ...shape, points: newPoints };
      }
      case "line":
        return {
          ...shape,
          startX: shape.startX + diffX,
          startY: shape.startY + diffY,
          endX: shape.endX + diffX,
          endY: shape.endY + diffY,
        };
      case "circle":
        return {
          ...shape,
          centerX: shape.centerX + diffX,
          centerY: shape.centerY + diffY,
        };
      default: {
        return {
          ...shape,
          startX: shape.startX + diffX,
          startY: shape.startY + diffY,
        };
      }
    }
  }

  function getShapeById(id) {
    const shape = shapes.filter((shape) => {
      if (shape.id === id) return true;
      return false;
    });
    return shape[0];
  }

  return {
    startShape,
    startText,
    updateShape,
    moveShape,
    finishShape,
    getShapeById,
  };
}

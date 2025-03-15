import { hip } from "./math";

export function getShapeFunctions(
  dispatchShapes,
  currentShape,
  setCurrentShape,
  lastAction
) {
  function startShape(x, y, selectedColor, selectedWidth, selectedTool) {
    let newShape = null;

    switch (selectedTool) {
      case "pen":
        newShape = {
          type: "freehand",
          points: [{ x, y }],
          color: selectedColor,
          lineWidth: selectedWidth,
        };
        break;
      case "line":
        newShape = {
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
          type: "eraser",
          points: [{ x, y }],
          border: true,
          lineWidth: selectedWidth*2,
        };
        break;
    }
    setCurrentShape(newShape);
  }

  function updateShape(x, y) {
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
      case "eraser":
        updatedShape.points.push({ x, y });
        break;
    }
    setCurrentShape(updatedShape);
  }

  function startText(canvasX, canvasY, textOptions) {
    const newText = {
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

    if (currentShape.type === "eraser") {
      currentShape.border = false;
    }
    lastAction.current = "add";
    dispatchShapes({ type: "add", shape: currentShape });
    setCurrentShape(null);
  }

  return {
    startShape,
    startText,
    updateShape,
    finishShape,
  };
}

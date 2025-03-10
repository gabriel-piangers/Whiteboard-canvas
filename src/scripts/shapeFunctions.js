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
          lineWidth: selectedWidth,
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

  function textInsertion(
    mouseX,
    mouseY,
    canvasX,
    canvasY,
    selectedColor,
    scale
  ) {
    const newText = {
      type: "text",
      startX: canvasX,
      startY: canvasY,
      content: "",
      font: "16px Arial",
      fontSize: 16,
      color: selectedColor,
      textAlign: "left",
      textBaseLine: "bottom",
    };

    function measureTextWidth(text) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      ctx.font = newText.font;
      return ctx.measureText(text).width;
    }

    setCurrentShape(newText);

    const input = document.createElement("input");
    input.id = "canvas-input";
    input.type = "text";
    input.style.width = `${measureTextWidth(input.value) + 12}px`;
    input.style.left = `${mouseX}px`;
    input.style.top = `${mouseY}px`;
    input.style.font = newText.font;
    input.style.color = newText.color;
    input.style.fontSize = `${newText.fontSize * scale}px`;
    document.body.appendChild(input);

    input.oninput = () => {
      input.style.width = `${measureTextWidth(input.value) + 12}px`;
    };
    input.onblur = () => {
      let updatedText = { ...newText };
      updatedText.content = input.value;

      //finishShape for textInsertion
      lastAction.current = "add";
      dispatchShapes({ type: "add", shape: updatedText });
      setCurrentShape(null);
      input.remove();
    };
    input.onkeydown = (event) => {
      if (event.key === "Enter") {
        input.blur();
      }
    };
    input.focus();
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
    textInsertion,
    updateShape,
    finishShape,
  };
}

import { useTransform } from "../Providers/TransformProvider";
import {
  getPixelAt,
  measureTextHeight,
  measureTextWidth,
  isColorsEqual,
  canvasToMouse,
} from "./canvasUtils";


export function GetRedrawFunctions(
  shapes,
  currentShape,
) {
  const {offsetXRef, offsetYRef, scale} = useTransform();
  const backgroundColor = { r: 0, g: 0, b: 0, a: 0 };

  function transformCanvas(canvas, ctx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Resets the transform
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(offsetXRef.current, offsetYRef.current);
    ctx.scale(scale, scale);
  }

  function redrawBaseCanvas(baseCanvasRef) {
    const canvas = baseCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    transformCanvas(canvas, ctx);

    [...shapes, currentShape]
      .filter(Boolean)
      .forEach((shape) => drawShape(ctx, shape));
  }

  function redrawTempCanvas(tempCanvasRef) {
    const canvas = tempCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    transformCanvas(canvas, ctx);

    drawShape(ctx, currentShape);
  }

  function drawShape(ctx, shape) {
    if (!shape) return;
    ctx.strokeStyle = shape.color;
    ctx.fillStyle = shape.color;
    ctx.lineWidth = shape.lineWidth;

    switch (shape.type) {
      case "freehand":
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        if (shape.points.length <= 1) {
          ctx.beginPath();
          ctx.arc(
            shape.points[0].x,
            shape.points[0].y,
            shape.lineWidth / 2,
            0,
            2 * Math.PI,
            false
          );
          ctx.fill();
          break;
        }

        ctx.beginPath();
        ctx.moveTo(shape.points[0].x, shape.points[0].y);
        for (let i = 1; i < shape.points.length; i++) {
          const current = shape.points[i];
          if (i === 1) {
            ctx.lineTo(current.x, current.y);
          } else {
            const previous = shape.points[i - 1];

            const midPointX = (previous.x + current.x) / 2;
            const midPointY = (previous.y + current.y) / 2;

            ctx.quadraticCurveTo(previous.x, previous.y, midPointX, midPointY);
          }
        }
        ctx.stroke();

        break;
      case "line":
        ctx.beginPath();
        ctx.moveTo(shape.startX, shape.startY);
        ctx.lineTo(shape.endX, shape.endY);
        ctx.stroke();
        break;
      case "rect":
        ctx.beginPath();
        ctx.rect(shape.startX, shape.startY, shape.width, shape.height);
        ctx.stroke();
        break;
      case "circle":
        ctx.beginPath();
        ctx.arc(
          shape.centerX,
          shape.centerY,
          shape.radius,
          0,
          2 * Math.PI,
          false
        );
        ctx.stroke();
        break;
      case "eraser":
        if (shape.border) {
          ctx.strokeStyle = "rgba(0,0,0,0.2)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(
            shape.coord.x,
            shape.coord.y,
            shape.lineWidth,
            0,
            2 * Math.PI,
            false
          );
          ctx.stroke();
        }
        break;
      case "text": {
        ctx.font = shape.font;
        ctx.fillStyle = shape.color;
        ctx.textAlign = shape.align;
        const textHeight = parseInt(ctx.font.match(/\d+/), 10);
        const textWidth = ctx.measureText(shape.content).width;
        ctx.fillText(shape.content, shape.startX, shape.startY + textHeight);
        if (shape.underline) {
          let startX = shape.startX;
          let startY = shape.startY + textHeight * 1.12;

          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(startX + textWidth, startY);
          ctx.strokeStyle = shape.color;
          ctx.lineWidth = textHeight / 12;
          ctx.stroke();
        }

        break;
      }
    }
  }

  function getBoundingBox(points, width) {
    let [minX, maxX, minY, maxY] = [Infinity, -Infinity, Infinity, -Infinity];
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      if (point.x < minX) minX = point.x;
      if (point.x > maxX) maxX = point.x;
      if (point.y < minY) minY = point.y;
      if (point.y > maxY) maxY = point.y;
    }
    maxX = canvasToMouse(maxX + width / 2, offsetXRef, scale);
    minX = canvasToMouse(minX - width / 2, offsetXRef, scale);
    maxY = canvasToMouse(maxY + width / 2, offsetYRef, scale);
    minY = canvasToMouse(minY - width / 2, offsetYRef, scale);
    return {
      startX: minX - 1,
      startY: minY - 1,
      width: maxX - minX - 2,
      height: maxY - minY - 2,
    };
  }

  function selectShape(x, y, canvasRef, selectionMargin = 3) {
    console.log(selectionMargin)
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    let selectedShape = null;

    for (let i = shapes.length - 1; i >= 0; i--) {
      const shape = shapes[i];
      if (shape.type === "eraser") continue;

      drawShape(ctx, shape);

      if (shape.type === "text") {
        const textWidth = measureTextWidth(shape.content, shape.font);
        const textHeight = measureTextHeight(shape.font);

        //converts mouse coords to canvas coords
        const canvasX = (x - offsetXRef.current) / scale;
        const canvasY = (y - offsetYRef.current) / scale;

        if (
          canvasX < shape.startX + textWidth + selectionMargin &&
          canvasX > shape.startX - selectionMargin &&
          canvasY < shape.startY + textHeight + selectionMargin &&
          canvasY > shape.startY - selectionMargin
        ) {
          selectedShape = shape;
          break;
        }
      } else {
        transformCanvas(canvas, ctx);

        const originalLineWidth = shape.lineWidth;
        shape.lineWidth = originalLineWidth + selectionMargin * 2;
        drawShape(ctx, shape);
        shape.lineWidth = originalLineWidth;

        if (!isColorsEqual(getPixelAt(x, y, ctx), backgroundColor)) {
          selectedShape = shape;
          break;
        }
      }
    }
    redrawBaseCanvas(canvasRef);
    return selectedShape;
  }

  function getSelection(selectedShape) {
    if (!selectedShape) return null;
    const newSelection = {
      startX: 0,
      startY: 0,
      width: 0,
      height: 0,
      selectedShape: selectedShape,
    };
    let bounds = null;
    switch (selectedShape.type) {
      case "freehand": {
        bounds = getBoundingBox(
          selectedShape.points,
          selectedShape.lineWidth,
          offsetXRef,
          offsetYRef,
          scale
        );
        break;
      }
      case "line": {
        const points = [
          { x: selectedShape.startX, y: selectedShape.startY },
          { x: selectedShape.endX, y: selectedShape.endY },
        ];
        bounds = getBoundingBox(
          points,
          selectedShape.lineWidth,
          offsetXRef,
          offsetYRef,
          scale
        );
        break;
      }
      case "rect": {
        const points = [
          { x: selectedShape.startX, y: selectedShape.startY },
          {
            x: selectedShape.startX + selectedShape.width,
            y: selectedShape.startY + selectedShape.height,
          },
        ];
        bounds = getBoundingBox(
          points,
          selectedShape.lineWidth,
          offsetXRef,
          offsetYRef,
          scale
        );
        break;
      }

      case "circle": {
        const points = [
          {
            x: selectedShape.centerX - selectedShape.radius,
            y: selectedShape.centerY - selectedShape.radius,
          },
          {
            x: selectedShape.centerX + selectedShape.radius,
            y: selectedShape.centerY + selectedShape.radius,
          },
        ];
        bounds = getBoundingBox(
          points,
          selectedShape.lineWidth,
          offsetXRef,
          offsetYRef,
          scale
        );
        break;
      }

      case "text": {
        const textWidth = measureTextWidth(
          selectedShape.content,
          selectedShape.font
        );
        const textHeight = measureTextHeight(selectedShape.font);
        const points = [
          { x: selectedShape.startX, y: selectedShape.startY },
          {
            x: selectedShape.startX + textWidth,
            y: selectedShape.startY + textHeight + 3,
          },
        ];
        bounds = getBoundingBox(points, 0, offsetXRef, offsetYRef, scale);
        break;
      }
    }
    newSelection.startX = bounds.startX;
    newSelection.startY = bounds.startY;
    newSelection.width = bounds.width;
    newSelection.height = bounds.height;

    return newSelection;
  }

  return {
    redrawBaseCanvas,
    redrawTempCanvas,
    selectShape,
    getSelection,
  };
}

export function getRedrawFunctions(shapes, currentShape) {
  function redrawBaseCanvas(baseCanvasRef, offsetXRef, offsetYRef, scale) {
    if (currentShape !== null && currentShape.type !== "eraser") {
      return;
    }
    const canvas = baseCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Resets the transform
    ctx.clearRect(
      0,
      0,
      baseCanvasRef.current.width,
      baseCanvasRef.current.height
    );
    ctx.translate(offsetXRef.current, offsetYRef.current);
    ctx.scale(scale, scale);

    [...shapes, currentShape]
      .filter(Boolean)
      .forEach((shape) => drawShape(ctx, shape));
  }

  function redrawTempCanvas(tempCanvasRef, offsetXRef, offsetYRef, scale) {
    const canvas = tempCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    ctx.setTransform(1, 0, 0, 1, 0, 0); // Resets the transform
    ctx.clearRect(
      0,
      0,
      tempCanvasRef.current.width,
      tempCanvasRef.current.height
    );
    ctx.translate(offsetXRef.current, offsetYRef.current);
    ctx.scale(scale, scale);

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

        ctx.beginPath();
        ctx.moveTo(shape.points[0].x, shape.points[0].y);
        for (let i = 1; i < shape.points.length; i++) {
          const current = shape.points[i]
          if (i === 1) {
            ctx.lineTo(current.x, current.y);
          } else {
            const previous = shape.points[i-1]

            const midPointX = (previous.x + current.x) /2
            const midPointY = (previous.y + current.y) /2

            ctx.quadraticCurveTo(previous.x, previous.y, midPointX, midPointY)
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
        ctx.globalCompositeOperation = "destination-out";
        for (let i = 0; i < shape.points.length; i++) {
          ctx.beginPath();
          ctx.arc(
            shape.points[i].x,
            shape.points[i].y,
            shape.lineWidth * 2,
            0,
            2 * Math.PI,
            false
          );
          if (i === shape.points.length - 1 && shape.border) {
            ctx.globalCompositeOperation = "source-over";
            ctx.strokeStyle = "rgba(0,0,0,0.2)";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.globalCompositeOperation = "destination-out";
          }
          ctx.fill();
        }

        ctx.globalCompositeOperation = "source-over";
        break;
      case "text":
        ctx.font = shape.font;
        ctx.fillStyle = shape.color;
        ctx.textAlign = shape.textAlign;
        ctx.textBaseLine = shape.textBaseLine;
        ctx.fillText(
          shape.content,
          shape.startX,
          shape.startY + parseInt(ctx.font.match(/\d+/), 10)
        );

        break;
    }
  }

  return {
    redrawBaseCanvas,
    redrawTempCanvas,
  };
}

import { useEffect, useRef, useState } from "react";

export function App() {
  const baseCanvasRef = useRef(null);
  const tempCanvasRef = useRef(null);
  const [selectedColor, setColor] = useState("#000000");
  const [selectedTool, setSelectedTool] = useState("pen");
  const [shapes, setShapes] = useState(
    JSON.parse(localStorage.getItem("shapes")) || []
  );
  const [currentShape, setCurrentShape] = useState(null);

  function startShape(x, y) {
    let newCurrentShape = null;

    switch (selectedTool) {
      case "pen":
        newCurrentShape = {
          type: "freehand",
          points: [{ x, y }],
          color: selectedColor,
        };
        break;
      case "line":
        newCurrentShape = {
          type: "line",
          startX: x,
          startY: y,
          endX: x,
          endY: y,
          color: selectedColor,
        };
    }
    setCurrentShape(newCurrentShape);
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
    }
    setCurrentShape(updatedShape);
  }

  function finishShape() {
    const newShapes = [...shapes, currentShape];
    setShapes(newShapes);
    setCurrentShape(null);
    saveShapes(newShapes);
  }

  function redrawBaseCanvas() {
    console.log('shapes: ', shapes)
    const canvas = baseCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    shapes.forEach((shape) => drawShape(ctx, shape));
  }

  function redrawTempCanvas() {
    console.log('currentShape: ', currentShape)
    const canvas = tempCanvasRef.current
    if (!canvas) return;

    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    drawShape(ctx, currentShape)
  }

   function drawShape(ctx, shape) {
    if (!shape) return;
    console.log('drawing', shape)
    ctx.save();

    ctx.strokeStyle = shape.color;
    ctx.fillStyle = shape.color;
    ctx.lineWidth = 2;

    switch (shape.type) {
      case "freehand":
        ctx.beginPath();
        for (let i = 0; i < shape.points.length - 1; i++) {
          ctx.moveTo(shape.points[i].x, shape.points[i].y);
          ctx.lineTo(shape.points[i + 1].x, shape.points[i + 1].y);
          ctx.stroke();
        }
        break;
      case "line":
        ctx.beginPath();
        ctx.moveTo(shape.startX, shape.startY);
        ctx.lineTo(shape.endX, shape.endY);
        ctx.stroke();
        break;
    }
    ctx.restore();
  }

  function saveShapes(shapes) {
    localStorage.setItem("shapes", JSON.stringify(shapes));
  }

  const clearCanvas = () => {
    localStorage.setItem("shapes", JSON.stringify([]));
    setShapes([]);
  };

  useEffect(redrawBaseCanvas,[shapes])

  useEffect(redrawTempCanvas, [currentShape])


  return (
    <div className="canvas-container">
      <div className="tools-bar">
        <input
          type="color"
          value={selectedColor}
          className="color-selector"
          onChange={(event) => {
            setColor(event.target.value);
          }}
        />
        <button className="clear-canvas" onClick={clearCanvas}>
          Clear All
        </button>
        <div className="tool-container">
          <input
            type="radio"
            defaultChecked
            name="selected-tool"
            onChange={() => {
              setSelectedTool("pen");
            }}
          />
          <p>Pen</p>
        </div>
        <div className="tool-container">
          <input
            type="radio"
            name="selected-tool"
            onChange={() => {
              setSelectedTool("line");
            }}
          />
          <p>Line</p>
        </div>
      </div>
      <div>
      <canvas
        ref={baseCanvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        className="canvas base-canvas"
        style={{position: 'absolute', zIndex: 1}}
      />

      <canvas
      ref={tempCanvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      className="canvas temp-canvas"
      style={{position: 'absolute', zIndex: 2}}
      onMouseDown={(event) => {
        const canvas = baseCanvasRef.current
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        startShape(x, y);
      }}
      onMouseMove={(event) => {
        const canvas = baseCanvasRef.current
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        updateShape(x, y)
      }}
      onMouseUp={() => {
        finishShape()
      }}
      />
      </div>
    </div>
  );
}

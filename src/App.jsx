import { useEffect, useRef, useState } from "react";
import { hip } from "./utils/math";

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
    let newShape = null;

    switch (selectedTool) {
      case "pen":
        newShape = {
          type: "freehand",
          points: [{ x, y }],
          color: selectedColor,
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
        };
        break;
      case 'rect':
        newShape = {
          type: 'rect',
          startX: x,
          startY: y,
          width: 0,
          height: 0,
          color: selectedColor
        };
        break;
      case 'circle':
        newShape = {
          type: 'circle',
          startX: x,
          startY: y,
          centerX: x,
          centerY: y,
          radius: 0,
          color: selectedColor
        }
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
      case 'rect':
        updatedShape.width = (x - updatedShape.startX)
        updatedShape.height = (y - updatedShape.startY)
        break;
      case 'circle':
        updatedShape.radius = hip((x - updatedShape.centerX), (y - updatedShape.centerY))
        updatedShape.centerX = updatedShape.startX + (x - updatedShape.startX)/2
        updatedShape.centerY = updatedShape.startY + (y - updatedShape.startY)/2

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
    const canvas = baseCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    shapes.forEach((shape) => drawShape(ctx, shape));
  }

  function redrawTempCanvas() {
    const canvas = tempCanvasRef.current
    if (!canvas) return;

    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    drawShape(ctx, currentShape)
  }

   function drawShape(ctx, shape) {
    if (!shape) return;
    ctx.strokeStyle = shape.color;
    ctx.fillStyle = shape.color;
    ctx.lineWidth = 2;

    switch (shape.type) {
      case "freehand":
        ctx.beginPath();
        ctx.moveTo(shape.points[0].x, shape.points[0].y);
        for (let i = 1; i < shape.points.length - 1; i++) {
          ctx.lineTo(shape.points[i].x, shape.points[i].y);
        }
        ctx.stroke();
        break;
      case "line":
        ctx.beginPath();
        ctx.moveTo(shape.startX, shape.startY);
        ctx.lineTo(shape.endX, shape.endY);
        ctx.stroke();
        break;
      case 'rect': 
        ctx.beginPath()
        ctx.rect(shape.startX, shape.startY, shape.width, shape.height)
        ctx.stroke()
        break;
      case 'circle':
        ctx.beginPath()
        ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, 2 * Math.PI, false)
        ctx.stroke()       
        break;
    }
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
        <div className="tool-container">
          <input
            type="radio"
            name="selected-tool"
            onChange={() => {
              setSelectedTool("rect");
            }}
          />
          <p>Rectangle</p>
        </div>
        <div className="tool-container">
          <input
            type="radio"
            name="selected-tool"
            onChange={() => {
              setSelectedTool("circle");
            }}
          />
          <p>Cirlce</p>
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

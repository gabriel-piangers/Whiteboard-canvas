import { useEffect, useRef } from "react"

export function App() {
  const canvasRef = useRef(null)

  let prevPos = null
  function drawInCanvas(event) {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const x = event.clientX
    const y = event.clientY

    if (prevPos) {
      ctx.fillStyle = 'black'
      ctx.beginPath()
      ctx.moveTo(prevPos.x, prevPos.y)
      ctx.lineTo(x, y)
      ctx.stroke()
    }
    prevPos = {x: x, y: y}
  }

  useEffect(() => {


    window.addEventListener('mousedown', () => {
      prevPos = null
      window.addEventListener('mousemove',drawInCanvas)
    })

    window.addEventListener('mouseup',() => {
      window.removeEventListener('mousemove', drawInCanvas)
    })

  }, [])

  return (
    <div className="canvas-container">
      <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} className="canvas"></canvas>
    </div>
  )
}
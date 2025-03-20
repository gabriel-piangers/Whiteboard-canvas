export function getPixelAt(x, y, ctx) {
  const imageData = ctx.getImageData(x, y, 1, 1);
  const [r, g, b, a] = imageData.data;
  return {
    r: r,
    g: g,
    b: b,
    a: a / 255,
  };
}

export function isColorsEqual(color1, color2) {
  return (
    color1.r === color2.r &&
    color1.g === color2.g &&
    color1.b === color2.b &&
    color1.a === color2.a
  );
}

export function measureTextWidth(text, font) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  ctx.font = font;
  return ctx.measureText(text).width;
}

export function measureTextHeight(font) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  ctx.font = font;
  return parseInt(ctx.font.match(/\d+/), 10);
}

export function getMouseCoords(event, canvasRef) {
  const canvas = canvasRef.current;
  const rect = canvas.getBoundingClientRect();

  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  return [mouseX, mouseY];
}

export function getCanvasCoords(event, canvasRef, offsetXRef, offsetYRef, scale) {
  const [mouseX, mouseY] = getMouseCoords(event, canvasRef);

  const canvasX = (mouseX - offsetXRef.current) / scale;
  const canvasY = (mouseY - offsetYRef.current) / scale;

  return [canvasX, canvasY];
}

export function canvasToMouse(x, offsetRef, scale) {
  return x * scale + offsetRef.current;
}

export function mouseToCanvas(x, offsetRef, scale) {
  const canvasX = (x - offsetRef.current) / scale;
  return canvasX;
}

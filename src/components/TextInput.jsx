import { useEffect, useRef, useState } from "react";

export function TextInput({
  x,
  y,
  scale,
  textOptions,
  inputValue,
  setInputValue,
  pan,
}) {
  const inputRef = useRef(null);
  const [inputCoords, setInputCoords] = useState({x, y})

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.style.width = `${measureTextWidth(inputValue) + 12}px`;
    }
  }, []);

  useEffect(() => {
    inputRef.current.focus();
    inputRef.current.style.width = `${measureTextWidth(inputValue) + 12}px`;

    const textHeight = measureTextHeight()
    if(y+ textHeight > window.innerHeight-1) {
      console.log('out: ', y, textHeight)
      const panY = -(inputCoords.y + textHeight + 10*scale - window.innerHeight);
      pan(0, panY)
      const newCoords = {...inputCoords, y: inputCoords.y +panY}

      setInputCoords(newCoords)
    }
  }, [textOptions]);

  function measureTextWidth(text) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.font = `${textOptions.bold ? 'bold' : ''} ${textOptions.size * scale}px ${textOptions.font}`;
    return ctx.measureText(text).width;
  }

  function measureTextHeight() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.font = `${textOptions.bold ? 'bold' : ''} ${textOptions.size * scale}px ${textOptions.font}`;
    return  parseInt(ctx.font.match(/\d+/), 10)
  }

  const handleInput = (event) => {
    setInputValue(event.target.value);

    const textWidth = measureTextWidth(event.target.value)
    inputRef.current.style.width = `${textWidth + 6 * scale}px`;

    if (x + textWidth > window.innerWidth-1) {
      const panX = -(inputCoords.x + textWidth - window.innerWidth);
      pan(panX, 0)
      const newCoords = {...inputCoords, x: inputCoords.x +panX}

      setInputCoords(newCoords)
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      inputRef.current.blur();
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      id="canvas-input"
      style={{
        left: `${inputCoords.x}px`,
        top: `${inputCoords.y}px`,
        fontFamily: textOptions.font,
        color: textOptions.color,
        fontSize: `${textOptions.size * scale}px`,
        fontWeight: (textOptions.bold ? 'bold' : ''),
        fontStyle: (textOptions.italic ? 'italic' : ''),
        textDecoration: (textOptions.underline ? 'underline' : '')
      }}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
    />
  );
}

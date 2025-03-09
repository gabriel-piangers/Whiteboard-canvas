import { useEffect, useRef } from "react";

export function TextInput({
  x,
  y,
  scale,
  textOptions,
  inputValue,
  setInputValue,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.style.width = `${measureTextWidth(inputValue) + 12}px`;
    }
  }, []);

  useEffect(() => {
    inputRef.current.focus();
    inputRef.current.style.width = `${measureTextWidth(inputValue) + 12}px`;
  }, [textOptions]);

  function measureTextWidth(text) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.font = `${textOptions.bold ? 'bold' : ''} ${textOptions.size * scale}px ${textOptions.font}`;
    return ctx.measureText(text).width;
  }

  const handleInput = (event) => {
    setInputValue(event.target.value);
    inputRef.current.style.width = `${
      measureTextWidth(event.target.value) + 6 * scale
    }px`;
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
        left: `${x}px`,
        top: `${y}px`,
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

export function ColorPicker({selectedColor, setColor}) {
  return (
    <label htmlFor="colorPicker" className="color-picker-container">
      <input type="color" id="colorPicker" className="color-input" onInput={(event) => {
        setColor(event.target.value)
      }} />
      <span className="color-preview" style={{
        backgroundColor: selectedColor
      }}></span>
    </label>
  );
}

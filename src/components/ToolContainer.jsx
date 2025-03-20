export function ToolContainer({ name, setSelectedTool }) {
  return (
    <div className={`tool-container`}>
      <input
        className={`tool-input tool-bar-option ${name}-tool`}
        type="radio"
        defaultChecked={name === "select" ? true : false}
        name="selected-tool"
        onChange={() => {
          setSelectedTool(name);
        }}
      />
    </div>
  );
}

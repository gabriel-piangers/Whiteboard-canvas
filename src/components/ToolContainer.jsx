export function ToolContainer({ name, setSelectedTool }) {
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  return (
    <div className="tool-container">
      <input
        type="radio"
        defaultChecked={name === "pen" ? true : false}
        name="selected-tool"
        onChange={() => {
          setSelectedTool(name);
        }}
      />
      <p>{capitalize(name)}</p>
    </div>
  );
}

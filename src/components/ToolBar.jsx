import { useToolsContext } from "./ToolsContext";
import { ToolContainer } from "./ToolContainer";

export function ToolBar({ dispatchShapes }) {
  const { selectedColor, setColor, selectedWidth, setWidth, setSelectedTool } =
    useToolsContext();
  const maxLineWidth = 30;

  return (
    <div className="tools-bar">
      <input
        type="color"
        value={selectedColor}
        className="color-selector"
        onChange={(event) => {
          setColor(event.target.value);
        }}
      />

      <input
        type="number"
        value={selectedWidth}
        onChange={(event) => {
          setWidth(Math.max(Math.min(maxLineWidth, event.target.value), 1));
        }}
      />
      <button
        className="clear-canvas"
        onClick={() => {
          dispatchShapes({ type: "clear" });
        }}
      >
        Clear All
      </button>
      <ToolContainer name={"pen"} setSelectedTool={setSelectedTool} />
      <ToolContainer name={"line"} setSelectedTool={setSelectedTool} />
      <ToolContainer name={"rectangle"} setSelectedTool={setSelectedTool} />
      <ToolContainer name={"circle"} setSelectedTool={setSelectedTool} />
      <ToolContainer name={"eraser"} setSelectedTool={setSelectedTool} />
      <ToolContainer name={"text"} setSelectedTool={setSelectedTool} />
    </div>
  );
}

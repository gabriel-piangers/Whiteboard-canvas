import { useToolsContext } from "./ToolsContext";
import { ToolContainer } from "./ToolContainer";
import { undo, redo } from "../scripts/history";

export function ToolBar({ dispatchShapes, lastAction }) {
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
          lastAction.current = "clear";
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

      <div className="undo-redo-container">
        <button
          className="undo-redo-button"
          onClick={() => {
            const newShapes = undo();
            dispatchShapes({ type: "set", shapes: newShapes });
          }}
        >
          undo
        </button>
        <button
          className="undo-redo-button"
          onClick={() => {
            const newShapes = redo();
            dispatchShapes({ type: "set", shapes: newShapes });
          }}
        >
          redo
        </button>
      </div>
    </div>
  );
}

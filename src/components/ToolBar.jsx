import { useToolsContext } from "./ToolsContext";
import { ToolContainer } from "./ToolContainer";
import { undo, redo } from "../scripts/history";
import { UndoIcon, RedoIcon } from "lucide-react";
import { ColorPicker } from "./ColorPicker";
import WidthSelector from "./WidthSelector";

export function ToolBar({ dispatchShapes, lastAction }) {
  const { selectedColor, setColor, selectedWidth, setWidth, setSelectedTool } =
    useToolsContext();

  return (
    <div className="tools-bar">
      <ColorPicker selectedColor={selectedColor} setColor={setColor}/>

      <WidthSelector selectedWidth={selectedWidth} setWidth={setWidth}/>
      <button
        className="clear-button tool-bar-option"
        onClick={() => {
          lastAction.current = "clear";
          dispatchShapes({ type: "clear" });
        }}
      >
        Clear
      </button>
      <ToolContainer name={"pen"} setSelectedTool={setSelectedTool} />
      <ToolContainer name={"line"} setSelectedTool={setSelectedTool} />
      <ToolContainer name={"rectangle"} setSelectedTool={setSelectedTool} />
      <ToolContainer name={"circle"} setSelectedTool={setSelectedTool} />
      <ToolContainer name={"eraser"} setSelectedTool={setSelectedTool} />
      <ToolContainer name={"text"} setSelectedTool={setSelectedTool} />

      <div className="undo-redo-container">
        <button
          className="undo-redo-button tool-bar-option"
          onClick={() => {
            const newShapes = undo();
            dispatchShapes({ type: "set", shapes: newShapes });
          }}
        >
          <UndoIcon />
        </button>
        <button
          className="undo-redo-button tool-bar-option"
          onClick={() => {
            const newShapes = redo();
            dispatchShapes({ type: "set", shapes: newShapes });
          }}
        >
          <RedoIcon />
        </button>
      </div>
    </div>
  );
}

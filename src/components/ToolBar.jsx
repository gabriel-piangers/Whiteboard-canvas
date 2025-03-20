import { useToolsContext } from "../Providers/ToolsProvider";
import { ToolContainer } from "./ToolContainer";
import { ColorPicker } from "./ColorPicker";
import WidthSelector from "./WidthSelector";
import { UndoRedoTool } from "./UndoRedoTools";
import { useShapes } from "../Providers/ShapeProvider";

export function ToolBar({ lastAction }) {
  const { selectedColor, setColor, selectedWidth, setWidth, setSelectedTool } =
    useToolsContext();
  const { dispatchShapes } = useShapes();

  return (
    <div className="tools-bar">
      <ColorPicker selectedColor={selectedColor} setColor={setColor} />
      <WidthSelector selectedWidth={selectedWidth} setWidth={setWidth} />

      <ToolContainer name={'select'} setSelectedTool={setSelectedTool}/>
      <ToolContainer name={"pen"} setSelectedTool={setSelectedTool} />
      <ToolContainer name={"line"} setSelectedTool={setSelectedTool} />
      <ToolContainer name={"rectangle"} setSelectedTool={setSelectedTool} />
      <ToolContainer name={"circle"} setSelectedTool={setSelectedTool} />
      <ToolContainer name={"eraser"} setSelectedTool={setSelectedTool} />
      <ToolContainer name={"text"} setSelectedTool={setSelectedTool} />
      <UndoRedoTool lastAction={lastAction} />
      <button
        className="clear-button tool-bar-option"
        onClick={() => {
          dispatchShapes({ type: "clear" });
        }}
      >
        Clear
      </button>
    </div>
  );
}

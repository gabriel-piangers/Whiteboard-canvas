import { useHistory } from "../Providers/HistoryProvider";
import { UndoIcon, RedoIcon } from "lucide-react";
import { useShapes } from "../Providers/ShapeProvider";

export function UndoRedoTool({ lastAction }) {
  const { dispatchShapes } = useShapes();
  const { undo, redo, canUndo, canRedo } = useHistory();

  return (
    <div className="undo-redo-container">
      <button
        className="undo-redo-button tool-bar-option"
        disabled={canUndo() ? false : true}
        onClick={() => {
          const newShapes = undo();
          lastAction.current = "undo";
          dispatchShapes({ type: "set", shapes: newShapes });
        }}
      >
        <UndoIcon />
      </button>
      <button
        className="undo-redo-button tool-bar-option"
        disabled={canRedo() ? false : true}
        onClick={() => {
          const newShapes = redo();
          lastAction.current = "redo";
          dispatchShapes({ type: "set", shapes: newShapes });
        }}
      >
        <RedoIcon />
      </button>
    </div>
  );
}

import { useEffect } from "react";

export function SelectionContainer({
  selection,
  setSelection,
  setMovingShape,
  selectionRef,
  dispatchShapes
}) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if(event.key === "Delete") {
        dispatchShapes({type: "delete", shape: selection.selectedShape})
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])
  
  useEffect(() => {
    if (selection && selectionRef) {
      selectionRef.current.focus();
    }
  }, [selection]);

    return (
      <div
        ref={selectionRef}
        tabIndex={0}
        className="selection-container"
        style={{
          left: selection.startX,
          top: selection.startY,
          width: selection.width,
          height: selection.height,
        }}
        onMouseDown={(event) => {
          if (!selection) return;
          setMovingShape({
            startX: event.clientX,
            startY: event.clientY,
            shape: selection.selectedShape,
          });
        }}
        onBlur={() => {
          setMovingShape(null);
          setSelection(null);
        }}
      >
        <div className="scale-corner-button right-upper-corner"></div>
      </div>
    );
}

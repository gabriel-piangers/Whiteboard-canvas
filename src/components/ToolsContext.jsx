import { useState, createContext, useContext } from "react";

const ToolsContext = createContext();

export function ToolsProvider({ children }) {
  const [selectedColor, setColor] = useState("#000000");
  const [selectedWidth, setWidth] = useState("2");
  const [selectedTool, setSelectedTool] = useState("pen");

  return (
    <ToolsContext.Provider
      value={{
        selectedColor,
        setColor,
        selectedWidth,
        setWidth,
        selectedTool,
        setSelectedTool,
      }}
    >
      {children}
    </ToolsContext.Provider>
  );
}

export function useToolsContext() {
  return useContext(ToolsContext);
}

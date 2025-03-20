import { createContext, useRef, useState, useContext } from "react";

const transformContext = createContext();

export function TransformProvider({ children }) {
  const offsetXRef = useRef(0);
  const offsetYRef = useRef(0);
  const [scale, setScale] = useState(1);

  return (
    <transformContext.Provider
      value={{ offsetXRef, offsetYRef, scale, setScale }}
    >
      {children}
    </transformContext.Provider>
  );
}

export function useTransform() {
  const context = useContext(transformContext);
  if (context === null) {
    throw new Error("useShapes must be inside a ShapeProvider");
  }
  return context;
}

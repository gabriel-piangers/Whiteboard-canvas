import { createContext, useContext, useReducer } from "react";

const ShapeContext = createContext(null);

export function ShapeProvider({ children }) {
  function shapesReducer(state, action) {
    let newShapes = [];
    switch (action.type) {
      case "add":
        newShapes = [...state, action.shape];
        return newShapes;

      case "clear":
        return [];

      case "set":
        return [...action.shapes];

      default:
        throw new Error("Unkown action at shapesReducer", action.type);
    }
  }

  const [shapes, dispatchShapes] = useReducer(
    shapesReducer,
    JSON.parse(localStorage.getItem("shapes")) || []
  );

  return (
    <ShapeContext.Provider value={{ shapes, dispatchShapes }}>
      {children}
    </ShapeContext.Provider>
  );
}

export function useShapes() {
  const context = useContext(ShapeContext);
  if (context === null) {
    throw new Error("useShapes must be inside a ShapeProvider");
  }
  return context;
}

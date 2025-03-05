export function shapesReducer(state, action) {
  let newShapes = [];

  switch (action.type) {
    case "add":
      newShapes = [...state, action.shape];
      localStorage.setItem("shapes", JSON.stringify(newShapes));
      return newShapes;
    case "clear":
      localStorage.setItem("shapes", JSON.stringify([]));
      return [];
    default:
      throw new Error("Unkown action at shapesReducer", action.type);
  }
}

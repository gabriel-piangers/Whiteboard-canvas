export function shapesReducer(state, action) {
  let newShapes = [];
  switch (action.type) {
    case "add":
      newShapes = [...state, action.shape];
      return newShapes;

    case "clear":
      return [];

    case 'set':
      return [...action.shapes]

    default:
      throw new Error("Unkown action at shapesReducer", action.type);
  }
}

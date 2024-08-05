import { v4 as uuidv4 } from "uuid";

export const generateNewTask = () => ({
  id: uuidv4(),
  content: "",
  done: false,
  subtasks: [],
  createdAt: new Date(Date.now()).toLocaleString(),
  updatedAt: new Date(Date.now()).toLocaleString(),
});

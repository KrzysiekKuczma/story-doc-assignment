import { v4 as uuidv4 } from "uuid";
import { ITask } from "../store/types";

export const generateNewTask = () => ({
  id: uuidv4(),
  content: "",
  done: false,
  parent: null,
  subtasks: [],
  createdAt: new Date(Date.now()).toLocaleString(),
  updatedAt: new Date(Date.now()).toLocaleString(),
});

export const mergeAndUpdateTasks = (
  oldTasks: ITask[],
  newTasks: ITask[],
): ITask[] => {
  // Create a map from the IDs of the new tasks for easy lookup
  const newTaskMap = new Map<string, ITask>();
  newTasks.forEach((task) => {
    newTaskMap.set(task.id, task);
  });

  // Iterate over the old tasks and update them if they exist in the new tasks
  const updatedTasks = oldTasks.map((task) => {
    if (newTaskMap.has(task.id)) {
      return newTaskMap.get(task.id) as ITask;
    }
    return task;
  });

  // Add any new tasks that were not in the old tasks
  const existingTaskIds = new Set(oldTasks.map((task) => task.id));
  newTasks.forEach((task) => {
    if (!existingTaskIds.has(task.id)) {
      updatedTasks.push(task);
    }
  });

  return updatedTasks;
};

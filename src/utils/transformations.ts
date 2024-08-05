import { ITask, ITaskNested } from "../store/types";

export const transformTasks = (tasks: ITask[]): ITaskNested[] => {
  // Create a lookup map for tasks by their id
  const taskMap: { [key: string]: ITask } = {};
  tasks.forEach((task) => {
    taskMap[task.id] = { ...task, subtasks: [] };
  });

  // Populate the subtasks field with actual task objects
  tasks.forEach((task) => {
    if (task.subtasks && task.subtasks.length > 0) {
      task.subtasks.forEach((subtaskId) => {
        const subtask = taskMap[subtaskId] as unknown as string;
        if (subtask) {
          taskMap[task.id].subtasks?.push(subtask);
        }
      });
    }
  });

  // Return the top-level tasks (those that are not subtasks of any other task)
  const topLevelTasks = tasks.filter((task) => {
    return !tasks.some((t) => t.subtasks?.includes(task.id));
  });

  return topLevelTasks.map(
    (task) => taskMap[task.id],
  ) as unknown as ITaskNested[];
};

export interface IBoard {
  tasks: ITask[];
}

export type TasksOrder = {
  id: string;
}[];

export interface ITask {
  content: string;
  id: string;
  subtasks: string[];
  parent: string;
  done: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ITaskNested = Omit<ITask, "subtasks"> & { subtasks: ITaskNested[] };

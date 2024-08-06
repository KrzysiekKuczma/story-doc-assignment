import TreeNode from "../utils/tree";

export interface IBoard {
  tasks: ITask[];
}

export type TasksOrder = {
  id: string;
}[];

export type ITask = Omit<TreeNode, "subtasks"> & {
  subtasks: string[];
};

export type LocalDBUpdateTask = { key: string; changes: Partial<ITask> };

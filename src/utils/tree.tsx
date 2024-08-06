import { ITask } from "../store/types";

class TreeNode {
  content: string;
  id: string;
  subtasks: TreeNode[];
  parent: string | null;
  done: boolean;
  createdAt: string;
  updatedAt: string;

  constructor(task: ITask) {
    this.content = task.content;
    this.id = task.id;
    this.subtasks = [];
    this.parent = task.parent;
    this.done = task.done;
    this.createdAt = task.createdAt;
    this.updatedAt = task.updatedAt;
  }
}
export default TreeNode;

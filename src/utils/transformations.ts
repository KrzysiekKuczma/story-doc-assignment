import { ITask } from "../store/types";
import TreeNode from "./tree";

export const buildTree = (tasks: ITask[]): TreeNode[] => {
  const taskMap: { [key: string]: TreeNode } = {};

  tasks.forEach((task) => {
    taskMap[task.id] = new TreeNode(task);
  });

  const rootTasks: TreeNode[] = [];

  tasks.forEach((task) => {
    const currentNode = taskMap[task.id];
    if (task.parent) {
      const parentNode = taskMap[task.parent];
      if (parentNode) {
        parentNode.subtasks.push(currentNode);
      } else {
        rootTasks.push(currentNode);
      }
    } else {
      rootTasks.push(currentNode);
    }
  });

  return rootTasks;
};

export const getNestedIds = (tasks: ITask[], initialId: string): string[] => {
  const findTaskById = (tasks: ITask[], targetId: string): ITask | null => {
    for (const task of tasks) {
      if (task.id === targetId) {
        return task;
      }
    }
    return null;
  };

  const collectIds = (task: ITask): string[] => {
    let ids: string[] = [task.id];
    for (const subtaskId of task.subtasks) {
      const subtask = findTaskById(tasks, subtaskId);
      if (subtask) {
        ids = ids.concat(collectIds(subtask));
      }
    }
    return ids;
  };

  const rootTask = findTaskById(tasks, initialId);
  return rootTask ? collectIds(rootTask) : [];
};

export const transformTreeToITasks = (root: TreeNode[]): ITask[] => {
  const tasks: ITask[] = [];

  function traverse(node: TreeNode, parent: string | null) {
    const task: ITask = {
      content: node.content,
      id: node.id,
      subtasks: node.subtasks.map((subtask) => subtask.id),
      parent: parent,
      done: node.done,
      createdAt: node.createdAt,
      updatedAt: node.updatedAt,
    };

    tasks.push(task);
    node.subtasks.forEach((subtask) => traverse(subtask, node.id));
  }

  root.forEach((treeNode) => traverse(treeNode, null));
  return tasks;
};

export const moveNode = (
  tree: TreeNode[],
  nodeId: string,
  newParentId: string | null,
): TreeNode[] => {
  const findNodeById = (
    nodeList: TreeNode[],
    targetId: string,
  ): TreeNode | undefined => {
    for (const node of nodeList) {
      if (node.id === targetId) {
        return node;
      } else {
        const subNode = findNodeById(node.subtasks, targetId);
        if (subNode) {
          return subNode;
        }
      }
    }
    return undefined;
  };

  const removeNodeById = (
    nodeList: TreeNode[],
    nodeId: string,
  ): TreeNode | null => {
    for (let i = 0; i < nodeList.length; i++) {
      if (nodeList[i].id === nodeId) {
        return nodeList.splice(i, 1)[0];
      }
      const subtaskNode = removeNodeById(nodeList[i].subtasks, nodeId);
      if (subtaskNode) {
        return subtaskNode;
      }
    }
    return null;
  };

  const changedNodes: TreeNode[] = [];
  const nodeToMove = removeNodeById(tree, nodeId);

  if (!nodeToMove) {
    console.error(`Node with id ${nodeId} not found`);
    return changedNodes;
  }
  changedNodes.push(nodeToMove);

  let newParentNode: TreeNode | undefined = undefined;
  if (newParentId) {
    newParentNode = findNodeById(tree, newParentId);
    if (!newParentNode) {
      console.warn(
        `Parent node with id ${newParentId} not found, adding node to top level`,
      );
    }
  }

  if (newParentNode) {
    newParentNode.subtasks.push(nodeToMove);
    nodeToMove.parent = newParentNode.id;
    changedNodes.push(newParentNode);
  } else {
    nodeToMove.parent = null;
    tree.push(nodeToMove);
  }

  return changedNodes;
};

import {
  createAsyncThunk,
  createListenerMiddleware,
  createSelector,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import { IBoard, ITask } from "../types";
import localDB from "../../db";
import { RootState } from "../store";
import { transformTasks } from "../../utils/transformations";

const initialState: IBoard = {
  tasks: [],
};

const loadTasksFromDB = createAsyncThunk("board/loadTasksDB", async () => {
  return await localDB.tasks.toArray();
});
const moveSubtask = createAsyncThunk(
  "board/moveSubtask",
  async (
    ids: { id: string; parentId?: string },
    thunkAPi,
  ): Promise<ITask[]> => {
    const { id, parentId } = ids;
    const state = thunkAPi.getState() as RootState;
    const tasksToUpdate: {
      key: string;
      changes: { subtasks: string[] };
    }[] = [];

    const tasks = state.board.tasks.slice();
    console.log(state);
    console.log(tasks);

    const subtaskIndex = tasks.findIndex((task) => task.id === id);
    const parentIndex = tasks.findIndex((task) => task.id === parentId);
    const previousParentIndex = tasks.findIndex((task) =>
      task.subtasks.includes(id),
    );

    console.log({ subtaskIndex, parentIndex, previousParentIndex });
    if (previousParentIndex >= 0) {
      const previousParentTask = tasks[previousParentIndex];
      const subtaskIndex = previousParentTask.subtasks.findIndex(
        (taskId) => taskId === id,
      );
      const cleanedParentSubtasks = [...previousParentTask.subtasks];
      cleanedParentSubtasks.splice(subtaskIndex, 1);
      tasks.splice(previousParentIndex, 1, {
        ...previousParentTask,
        subtasks: cleanedParentSubtasks,
      });
      tasksToUpdate.push({
        key: previousParentTask.id,
        changes: { subtasks: cleanedParentSubtasks },
      });
    }

    if (parentIndex >= 0) {
      const parrentTask = tasks[parentIndex];
      if (parrentTask && !parrentTask.subtasks.includes(id)) {
        console.log({ parrentTask });
        tasks.splice(parentIndex, 1, {
          ...parrentTask,
          subtasks: [...parrentTask.subtasks, id],
        });

        tasksToUpdate.push({
          key: parrentTask.id,
          changes: { subtasks: tasks[parentIndex].subtasks },
        });
      }
    }
    const subtask = tasks[subtaskIndex];

    console.log({ subtask });
    tasksToUpdate.push({
      key: subtask.id,
      changes: { subtasks: subtask.subtasks },
    });

    console.log("All mutated");
    // console.log({ tasksToUpdate });

    await localDB.tasks.bulkUpdate(tasksToUpdate);
    console.log({ tasks });
    return Promise.resolve(tasks);
  },
);

// Create a middleware to save to indexDB changes in tasks
export const tasksDBHandlerMiddleware = createListenerMiddleware();

export const boardSlice = createSlice({
  name: "board",
  initialState,
  reducers: {
    addTask: (state, action: PayloadAction<ITask>) => {
      state.tasks.push(action.payload);
    },
    updateTask: (
      state,
      action: PayloadAction<Partial<ITask> & { id: string }>,
    ) => {
      const { id, ...data } = action.payload;
      const taskIndex = state.tasks.findIndex((task) => task.id === id);
      const oldTask = state.tasks.find((t) => t.id === id);
      const updated = { ...oldTask!, ...data };

      // const old = state.tasks[taskIndex];

      // console.log({ taskIndex, old, oldTask, updated });
      state.tasks.splice(taskIndex, 1, updated);
    },
    removeTask: (state, action: PayloadAction<string>) => {
      const taskIndex = state.tasks.findIndex(
        (task) => task.id === action.payload,
      );
      state.tasks.splice(taskIndex, 1);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadTasksFromDB.fulfilled, (state, action) => {
      state.tasks = action.payload;
    });
    builder.addCase(moveSubtask.fulfilled, (state, action) => {
      console.log({ state, action });
      state.tasks = action.payload;
    });
  },
});

export const { addTask, updateTask, removeTask } = boardSlice.actions;

tasksDBHandlerMiddleware.startListening({
  actionCreator: addTask,
  effect: async (action, listenerApi) => {
    listenerApi.cancelActiveListeners();
    await localDB.tasks.add(action.payload);
  },
});

tasksDBHandlerMiddleware.startListening({
  actionCreator: removeTask,
  effect: (action, listenerApi) => {
    listenerApi.cancelActiveListeners();
    localDB.tasks.delete(action.payload);
  },
});

tasksDBHandlerMiddleware.startListening({
  actionCreator: updateTask,
  effect: (action, listenerApi) => {
    listenerApi.cancelActiveListeners();
    const { id, ...data } = action.payload;
    localDB.tasks.update(id, {
      ...data,
      updatedAt: new Date(Date.now()).toLocaleString(),
    });
  },
});

// tasksDBHandlerMiddleware.startListening({
//   actionCreator: moveSubtask,
//   effect: (action, listenerApi) => {
//     listenerApi.cancelActiveListeners();
//     const { id, ...data } = action.payload;
//     localDB.tasks.update(id, {
//       ...data,
//       updatedAt: new Date(Date.now()).toLocaleString(),
//     });
//   },
// });

const tasksSelector = (state: RootState) => state.board.tasks;

// Selector for nesting all subtasks for tasks
export const sortedTasks = createSelector(tasksSelector, (tasks) => {
  return transformTasks(tasks);
});

export { loadTasksFromDB, moveSubtask };

export default boardSlice.reducer;

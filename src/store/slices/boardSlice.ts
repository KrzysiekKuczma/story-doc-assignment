import {
  createAsyncThunk,
  createListenerMiddleware,
  createSelector,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import { IBoard, ITask, LocalDBUpdateTask } from "../types";
import localDB from "../../db";
import { RootState } from "../store";
import {
  getNestedIds,
  buildTree,
  moveNode,
  transformTreeToITasks,
} from "../../utils/transformations";
import { mergeAndUpdateTasks } from "../../utils/tasks";

const initialState: IBoard = {
  tasks: [],
};

const loadTasksFromDB = createAsyncThunk("board/loadTasksDB", async () => {
  return await localDB.tasks.toArray();
});

const removeTask = createAsyncThunk(
  "board/removeTask",
  async (id: string, thunkApi) => {
    const state = thunkApi.getState() as RootState;
    const tasks = state.board.tasks.slice();
    const tasksToRemove = getNestedIds(tasks, id);
    await localDB.tasks.bulkDelete(tasksToRemove);

    tasksToRemove.forEach((removeId) => {
      const foundIndex = tasks.findIndex((task) => task.id === removeId);
      tasks.splice(foundIndex, 1);
    });

    return Promise.resolve(tasks);
  },
);

const moveSubtask = createAsyncThunk(
  "board/moveSubtask",
  async (
    ids: { id: string; parentId: string | null },
    thunkApi,
  ): Promise<ITask[]> => {
    const { id, parentId = null } = ids;

    const state = thunkApi.getState() as RootState;
    const tasks = state.board.tasks;
    const tree = buildTree(tasks);
    const updatedTasks = transformTreeToITasks(moveNode(tree, id, parentId));

    const updateObj = updatedTasks.reduce(
      (prev: LocalDBUpdateTask[], curr): LocalDBUpdateTask[] => {
        const { id: key, ...changes } = curr;
        return [...prev, { key, changes }];
      },
      [],
    );
    await localDB.tasks.bulkUpdate(updateObj);

    return Promise.resolve(mergeAndUpdateTasks(tasks, updatedTasks));
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
      state.tasks.splice(taskIndex, 1, updated);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadTasksFromDB.fulfilled, (state, action) => {
      state.tasks = action.payload;
    });
    builder.addCase(moveSubtask.fulfilled, (state, action) => {
      state.tasks = action.payload;
    });
    builder.addCase(removeTask.fulfilled, (state, action) => {
      state.tasks = action.payload;
    });
  },
});

export const { addTask, updateTask } = boardSlice.actions;

// Middleware listeners
tasksDBHandlerMiddleware.startListening({
  actionCreator: addTask,
  effect: async (action, listenerApi) => {
    listenerApi.cancelActiveListeners();
    await localDB.tasks.add(action.payload);
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

const tasksSelector = (state: RootState) => state.board.tasks;

// Selector for nesting all subtasks for tasks
export const sortedTasks = createSelector(tasksSelector, (tasks) => {
  const tree = buildTree(tasks);
  return tree;
});

export { loadTasksFromDB, moveSubtask, removeTask };

export default boardSlice.reducer;

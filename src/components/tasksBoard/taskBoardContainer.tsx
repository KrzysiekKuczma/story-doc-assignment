import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import TasksBoard from "./taskBoard";

const TasksBoardContainer = () => (
  <DndProvider backend={HTML5Backend}>
    <TasksBoard />
  </DndProvider>
);

export default TasksBoardContainer;

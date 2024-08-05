import { useEffect } from "react";
import { DropTargetMonitor, useDrop } from "react-dnd";
import { useDispatch, useSelector } from "react-redux";
import { Add } from "../../assets/icons/Add";
import {
  addTask,
  loadTasksFromDB,
  moveSubtask,
  sortedTasks,
} from "../../store/slices";
import { AppDispatch } from "../../store/store";
import TasksSection from "../tasksSection/tasksSection";
import "./taskBoard.scss";
import { ITask } from "../../store/types";
import { DragTypes } from "../../utils/dragTypes";
import { generateNewTask } from "../../utils/tasks";

const TasksBoard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const tasks = useSelector(sortedTasks);

  useEffect(() => {
    dispatch(loadTasksFromDB());
  }, [dispatch]);

  const [, drop] = useDrop(
    () => ({
      accept: [DragTypes.TASKS_SECTION, DragTypes.TASK_CARD],
      hover(payload: ITask) {
        // console.log({ payload });
        // console.log({ task: task.id, payload });
        // const { index: overIndex } = findCard(id)
        // moveCard(draggedId, overIndex)
      },
      drop(_item: ITask, monitor) {
        // onDrop(monitor.getItemType())
        // const task = monitor.getItem();
        // console.log({ _item, task });
        //
        const didDrop = monitor.didDrop();
        if (didDrop) return;
        // onDrop(monitor.getItemType())
        const { id: itemId } = _item;
        dispatch(moveSubtask({ id: itemId }));
        return undefined;
      },
      collect: (monitor: DropTargetMonitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
        draggingColor: monitor.getItemType() as string,
      }),
    }),
    [],
  );

  return (
    <div ref={drop} className="tasks-board">
      {tasks.map((task) => (
        <TasksSection key={task.id} task={task} />
      ))}
      <button
        tabIndex={0}
        className="tasks-board-add-button"
        onClick={() => dispatch(addTask(generateNewTask()))}
      >
        <Add /> Add Card
      </button>
    </div>
  );
};

export default TasksBoard;

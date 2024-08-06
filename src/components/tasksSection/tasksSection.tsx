import { FC } from "react";
import {
  DragSourceMonitor,
  DropTargetMonitor,
  useDrag,
  useDrop,
} from "react-dnd";
import { useDispatch } from "react-redux";
import { Add } from "../../assets/icons/Add";
import { addTask, moveSubtask, updateTask } from "../../store/slices";
import { AppDispatch } from "../../store/store";
import { ITask } from "../../store/types";
import { DragTypes } from "../../utils/dragTypes";
import { generateNewTask } from "../../utils/tasks";
import TreeNode from "../../utils/tree";
import TaskCard from "../taskCard/taskCard";
import "./tasksSection.scss";

interface TasksSectionProps {
  task: TreeNode;
}

const TasksSection: FC<TasksSectionProps> = ({ task }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: task.subtasks?.length
        ? DragTypes.TASKS_SECTION
        : DragTypes.TASK_CARD,
      // canDrag: !forbidDrag,
      item: task,
      collect: (monitor: DragSourceMonitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [],
  );

  const [{ isOver, isOverCurrent }, drop] = useDrop(
    () => ({
      accept: [DragTypes.TASKS_SECTION, DragTypes.TASK_CARD],
      // hover(payload: ITask) {
      //   console.log(payload);
      //   setTimeout(() => {
      //     dispatch(moveSubtask({ id: payload.id, parentId: task.id }));
      //   }, 200);
      // },
      drop(_item: ITask, monitor) {
        const didDrop = monitor.didDrop();
        if (didDrop) return;
        // onDrop(monitor.getItemType())
        const { id: itemId } = _item;
        dispatch(moveSubtask({ id: itemId, parentId: task.id }));

        return undefined;
      },
      collect: (monitor: DropTargetMonitor) => ({
        isOver: monitor.isOver(),
        isOverCurrent: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop(),
      }),
    }),
    [],
  );

  const handleNewSubTaskGeneration = () => {
    const newTask = generateNewTask();
    dispatch(addTask(newTask));
    const subtasksIDs = task.subtasks.map((t) => t.id);
    dispatch(
      updateTask({ id: task.id, subtasks: [...subtasksIDs, newTask.id] }),
    );
  };

  return (
    <div
      ref={(node) => {
        return drag(drop(node));
      }}
      className={`tasks-section`}
      style={{
        opacity: isDragging ? 0.6 : 1,
        background: isOverCurrent ? "rgba(0, 125, 252, 0.2)" : "transparent",
      }}
    >
      <TaskCard key={task.id} task={task} />
      {task.subtasks?.length ? (
        <div className="tasks-section-subtasks">
          {task.subtasks.map((subtask) => (
            <TasksSection key={subtask.id} task={subtask} />
          ))}
          <button
            tabIndex={0}
            className="tasks-section-add-button"
            onClick={() => dispatch(handleNewSubTaskGeneration)}
          >
            <Add /> Add a card
          </button>
        </div>
      ) : null}
    </div>
  );
};

//   </>
export default TasksSection;

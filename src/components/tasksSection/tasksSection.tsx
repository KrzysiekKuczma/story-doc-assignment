import { useDispatch } from "react-redux";
import { addTask, moveSubtask, updateTask } from "../../store/slices";
import { AppDispatch } from "../../store/store";
import { Add } from "../../assets/icons/Add";
import TaskCard from "../taskCard/taskCard";
import { ITask, ITaskNested } from "../../store/types";
import "./tasksSection.scss";
import { FC } from "react";
import {
  useDrag,
  DragSourceMonitor,
  useDrop,
  DropTargetMonitor,
} from "react-dnd";
import { DragTypes } from "../../utils/dragTypes";
import { generateNewTask } from "../../utils/tasks";

interface TasksSectionProps {
  task: ITaskNested;
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

  const [, drop] = useDrop(
    () => ({
      accept: [DragTypes.TASKS_SECTION, DragTypes.TASK_CARD],
      hover(payload: ITask) {
        // const { index: overIndex } = findCard(id)
        // moveCard(draggedId, overIndex)
      },
      drop(_item: ITask, monitor) {
        const didDrop = monitor.didDrop();
        if (didDrop) return;
        // onDrop(monitor.getItemType())
        const { id: itemId } = _item;
        dispatch(moveSubtask({ id: itemId, parentId: task.id }));

        // if (itemId !== task.id) {
        //   const subtasksIDs = task.subtasks.map((t) => t.id);
        //   console.log({ subtasksIDs });
        //   dispatch(
        //     updateTask({ id: task.id, subtasks: [...subtasksIDs, itemId] }),
        //   );
        // }
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
      style={{ opacity: isDragging ? 0.6 : 1 }}
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

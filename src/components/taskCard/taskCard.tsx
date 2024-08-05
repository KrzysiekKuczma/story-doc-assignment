import {
  FC,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import "./taskCard.scss";
import { Edit, Trash } from "../../assets/icons";
import { ITask, ITaskNested } from "../../store/types";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/store";
import { removeTask, updateTask } from "../../store/slices";

interface TaskCardProps {
  text: string;
  setText: (text: string) => void;
  isEditing: boolean;
  setEditing: (edit: boolean) => void;
}

const TaskCardInput = forwardRef<HTMLDivElement, TaskCardProps>(
  ({ text, setText, isEditing, setEditing }, outerRef) => {
    const innerRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(outerRef, () => innerRef.current!, []);

    const handleBlur = () => {
      setEditing(false);
      if (innerRef.current) {
        setText(innerRef.current.innerText);
      }
    };

    useEffect(() => {
      if (text?.length && innerRef.current) {
        innerRef.current.innerText = text;
      }
    }, []);

    return (
      <div
        className="task-card-input"
        ref={innerRef}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onBlur={handleBlur}
        onDoubleClick={() => setEditing(true)}
        tabIndex={isEditing ? 0 : -1}
      />
    );
  },
);

const TaskCard: FC<{ task: ITaskNested }> = ({ task }) => {
  const [isEditing, setEditing] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch<AppDispatch>();

  const handleEditClick = () => {
    setEditing(true);
    inputRef.current?.focus();
  };

  const handleTextUpdate = (text: string) => {
    dispatch(updateTask({ id: task.id, content: text }));
  };

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  return (
    <div className="task-card-container" tabIndex={0}>
      <TaskCardInput
        text={task.content}
        setText={handleTextUpdate}
        isEditing={isEditing}
        setEditing={setEditing}
        ref={inputRef}
      />
      <div className="task-card-actions">
        <button onClick={handleEditClick} tabIndex={0}>
          <Edit />
        </button>
        <button onClick={() => dispatch(removeTask(task.id))} tabIndex={0}>
          <Trash />
        </button>
      </div>
    </div>
  );
};

export default TaskCard;

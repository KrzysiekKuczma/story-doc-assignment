import { FC } from "react";
import { useMatch, useNavigate } from "react-router-dom";
import "./workspaceTile.scss";

interface WorkspaceTileProps {
  routePath: string;
  icon: React.ReactNode;
  label: string;
}
const WorkspaceTile: FC<WorkspaceTileProps> = ({ routePath, icon, label }) => {
  const navigate = useNavigate();
  const match = useMatch(routePath);
  return (
    <div
      tabIndex={0}
      className={`workspace-tile ${match ? "active" : ""}`}
      onClick={() => navigate(routePath)}
    >
      {icon ? <div className="workspace-tile-icon">{icon}</div> : null}
      <span>{label}</span>
    </div>
  );
};

export default WorkspaceTile;

import { Outlet } from "react-router-dom";
import "./workspacesPanels.scss";

const WorkspacesPanels = () => (
  <div className="workspaces-panels-container">
    <Outlet />
  </div>
);

export default WorkspacesPanels;

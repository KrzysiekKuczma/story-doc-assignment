import "./App.scss";
import WorkspacesPanels from "./components/workspacesPanels/workspacesPanels";
import { WorkspacesSidebar } from "./components/workspacesSidebar";

export const App = () => {
  return (
    <div className="container">
      <WorkspacesSidebar />
      <WorkspacesPanels />
    </div>
  );
};

import "./WorkspacesSidebar.scss";
import { UserProfile } from "../userProfile";
import { WorkspaceSettings } from "../workspaceSettings";
import WorkspaceTile from "../workspaceTile/workspaceTile";
import { Boards, Dashboard, Profile, Search } from "../../assets/icons";

const navigationTiles = [
  {
    key: "nav-dashboard",
    label: "Dashboard",
    icon: <Dashboard />,
    routePath: "/dashboard",
  },
  {
    key: "nav-boards",
    label: "Boards",
    icon: <Boards />,
    routePath: "/boards",
  },
  {
    key: "nav-profile",
    label: "Profile",
    icon: <Profile />,
    routePath: "/profile",
  },
  {
    key: "nav-search",
    label: "Search",
    icon: <Search />,
    routePath: "/search",
  },
];

export const WorkspacesSidebar = () => {
  return (
    <div className="workspaces">
      <div className="workspaces-header"></div>
      <div className="workspaces-main">
        <div className="workspaces-navigation-tiles">
          {navigationTiles.map((tile) => (
            <WorkspaceTile
              key={tile.key}
              label={tile.label}
              icon={tile.icon}
              routePath={tile.routePath}
            />
          ))}
        </div>
      </div>
      <div className="workspaces-footer">
        <UserProfile />
        <WorkspaceSettings />
      </div>
    </div>
  );
};

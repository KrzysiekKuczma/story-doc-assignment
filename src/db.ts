import Dexie, { EntityTable } from "dexie";
import { ITask } from "./store/types";

const localDB = new Dexie("tasks") as Dexie & {
  tasks: EntityTable<ITask, "id">;
};
localDB.version(1).stores({
  tasks: "++id,content,subLevel,parent,done,createdAt,updatedAt",
});

export default localDB;

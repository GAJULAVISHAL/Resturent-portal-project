
import { Hono } from "hono";
import { addTable, closeTable, deleteTable, getTables, updateTableStatus } from "../controllers/TableController";

import { AuthMiddleware } from "../Middleware/AuthMiddleware";
import { RoleMiddleware } from "../Middleware/RoleMiddleware";

export const tableRouter = new Hono();

tableRouter.use("*", AuthMiddleware);

tableRouter.post("/add", RoleMiddleware(['ADMIN']), addTable);
tableRouter.get("/", RoleMiddleware(['ADMIN', 'WAITER']), getTables);
tableRouter.put("/:id", RoleMiddleware(['ADMIN', 'WAITER']), updateTableStatus);
tableRouter.put("/:id/close", RoleMiddleware(['ADMIN', 'WAITER']), closeTable);
tableRouter.delete("/:id", RoleMiddleware(['ADMIN']), deleteTable);

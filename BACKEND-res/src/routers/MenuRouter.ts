import { Hono } from "hono";
import { GetMenu , AddItem , UpdateItem , DeleteItem } from "../controllers/MenuController";
import { AuthMiddleware } from "../Middleware/AuthMiddleware";

export const MenuRouter = new Hono();

MenuRouter.post('/addItem',AuthMiddleware,AddItem);
MenuRouter.put('/updateItem',AuthMiddleware,UpdateItem);
MenuRouter.delete('/deleteItem/:id',AuthMiddleware,DeleteItem);
MenuRouter.get('/get',AuthMiddleware,GetMenu);

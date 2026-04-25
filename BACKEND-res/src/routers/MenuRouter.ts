import { Hono } from "hono";
import { GetMenu , AddItem , UpdateItem , DeleteItem, GetSpecificMenu, UploadImage } from "../controllers/MenuController";
import { AuthMiddleware } from "../Middleware/AuthMiddleware";

export const MenuRouter = new Hono();

MenuRouter.post('/addItem',AuthMiddleware,AddItem);
MenuRouter.put('/updateItem',AuthMiddleware,UpdateItem);
MenuRouter.delete('/deleteItem/:id',AuthMiddleware,DeleteItem);
MenuRouter.get('/get',AuthMiddleware,GetMenu);
MenuRouter.get('/getSepcificItems',AuthMiddleware,GetSpecificMenu)
MenuRouter.post('/uploadImage',AuthMiddleware,UploadImage)

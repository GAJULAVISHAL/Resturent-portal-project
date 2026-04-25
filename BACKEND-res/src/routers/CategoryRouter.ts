import { Hono } from "hono";
import { AddCategory, GetCategories, DeleteCategory } from "../controllers/CategoryController";
import { AuthMiddleware } from "../Middleware/AuthMiddleware";

export const CategoryRouter = new Hono();

CategoryRouter.post('/add',AuthMiddleware,AddCategory)
CategoryRouter.get('/get',AuthMiddleware,GetCategories)
CategoryRouter.delete('/delete/:id',AuthMiddleware,DeleteCategory)
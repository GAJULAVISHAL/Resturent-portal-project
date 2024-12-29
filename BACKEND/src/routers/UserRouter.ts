import { Hono } from "hono";
import { Signup , Login } from "../controllers/UserController";

export const UserRouter = new Hono();

UserRouter.post('/signup',Signup)
UserRouter.post('/login',Login)
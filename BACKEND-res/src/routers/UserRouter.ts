import { Hono } from "hono";
import { Signup , Login, GetUsers, GetUserProfile, Logout } from "../controllers/UserController";
import { AuthMiddleware } from "../Middleware/AuthMiddleware";


export const UserRouter = new Hono();

UserRouter.post('/signup',Signup)
UserRouter.post('/login',Login)
UserRouter.get('/Users',AuthMiddleware,GetUsers)//not in use
UserRouter.get('/profile', AuthMiddleware, GetUserProfile)
UserRouter.post('/logout',Logout)


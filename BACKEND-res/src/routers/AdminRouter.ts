import { Hono } from "hono";
import { getDashboardStats, getRevenueData, getTrendingItems } from "../controllers/AdminController";
import { AuthMiddleware } from "../Middleware/AuthMiddleware";

export const AdminRouter = new Hono();

AdminRouter.get('/dashboard/Stats', AuthMiddleware, getDashboardStats);
AdminRouter.get('/dashboard/Revenue', AuthMiddleware, getRevenueData);
AdminRouter.get('/dashboard/Trending', AuthMiddleware, getTrendingItems);
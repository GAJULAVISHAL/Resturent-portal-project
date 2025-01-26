import { Hono } from "hono";
import { PlaceOrder } from "../controllers/OrderController";
import { AuthMiddleware } from "../Middleware/AuthMiddleware";

export const OrderRouter = new Hono()

OrderRouter.post('/placeOrder',AuthMiddleware,PlaceOrder)
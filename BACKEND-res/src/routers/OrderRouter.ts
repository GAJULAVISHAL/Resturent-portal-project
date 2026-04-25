import { Hono } from "hono";
import { GetActiveOrders, PlaceOrder } from "../controllers/OrderController";
import { AuthMiddleware } from "../Middleware/AuthMiddleware";

export const OrderRouter = new Hono()

OrderRouter.post('/placeOrder',AuthMiddleware,PlaceOrder)
OrderRouter.get('/activeOrders',AuthMiddleware,GetActiveOrders)
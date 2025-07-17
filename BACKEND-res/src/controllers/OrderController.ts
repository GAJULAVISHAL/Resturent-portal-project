import { Context } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from '@prisma/extension-accelerate';

interface PlaceOrderRequest {
    tableNumber: number;
    items: { menuItemId: number; quantity: number }[];
}

export async function PlaceOrder(c: Context) {
    try {
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
        }).$extends(withAccelerate())

        const body: PlaceOrderRequest = await c.req.json()
        const {     tableNumber, items } = body

        if (!tableNumber || !items || items.length === 0) {
            return c.json({ message: "Invalid input data" }, 400);
        }

        const order = await prisma.orders.create({
            data: {
                tableNumber : tableNumber,
                items: {
                    create: items.map(item => ({
                        menuItemId: item.menuItemId,
                        quantity: item.quantity
                    }))
                }
            },
            include: {
                items: true, // Include associated order items in the response
            },
        });
        
        return c.json({
            message: "Order Placed",
            order
        }, 201)

    } catch (error) {
        console.log("error while placing Order", error)
        return c.json({
            message: "failed to place order"
        }, 500)
    }
}
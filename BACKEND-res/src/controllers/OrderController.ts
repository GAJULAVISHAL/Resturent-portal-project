import { Context } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from '@prisma/extension-accelerate';

// DTO: We remove 'totalPrice' from the request because the server MUST calculate it.
interface PlaceOrderRequest {
    tableId: number;
    items: { menuItemId: number; quantity: number }[];
}

export async function PlaceOrder(c: Context) {
    try {
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
        }).$extends(withAccelerate())
        
        const payload = c.get('payload');
        // Authorization Check
        if (payload.role !== 'WAITER') {
            return c.json({ message: "Unauthorized" }, 401)
        }

        const body: PlaceOrderRequest = await c.req.json()
        const { tableId, items } = body

        // 1. Input Validation
        if (!tableId || !items || items.length === 0) {
            return c.json({ message: "Invalid input data" }, 400);
        }

        // 2. ATOMICITY & VERIFICATION: Fetch current prices from DB
        // We do not trust the prices sent by the frontend.
        const itemIds = items.map(i => i.menuItemId);
        const dbItems = await prisma.menuItems.findMany({
            where: { id: { in: itemIds } }
        });

        // Create a fast lookup map (O(1) access)
        const priceMap = new Map(dbItems.map(i => [i.id, i.price]));

        // 3. CALCULATION: Compute total and prepare snapshot data
        let calculatedTotal = 0;
        const orderItemsData = items.map(item => {
            const priceAtMoment = priceMap.get(item.menuItemId);
            
            if (!priceAtMoment) {
                throw new Error(`Item ID ${item.menuItemId} invalid or unavailable`);
            }

            const lineTotal = priceAtMoment * item.quantity;
            calculatedTotal += lineTotal;

            return {
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                price: priceAtMoment // <--- SNAPSHOT: We freeze the price here
            };
        });

        // 4. PERSISTENCE: Save to DB with the server-calculated total
        const order = await prisma.$transaction(async (tx) => {
            const newOrder = await tx.orders.create({
                data: {
                    tableId: tableId,
                    status: 'NEW',
                    totalPrice: calculatedTotal,
                    waiterId: Number(payload.id),
                    items: {
                        create: orderItemsData
                    }
                },
                include: {
                    items: true,
                    table: true,
                },
            });

            await tx.table.update({
                where: { id: tableId },
                data: { status: 'OCCUPIED' }
            });

            return newOrder;
        }, {
            timeout: 15000 // Reduced to 15 seconds (Prisma Accelerate default limit)
        });

        return c.json({
            message: "Order Placed",
            order
        }, 201)

    } catch (error) {
        console.log("Error while placing Order", error)
        return c.json({
            message: "Failed to place order"
        }, 500)
    }
}

export async function GetActiveOrders(c: Context) {
    try {
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
        }).$extends(withAccelerate())
        
        const payload = c.get('payload')
        const role = payload.role
        
        if (role !== 'WAITER' && role !== 'KITCHEN') {
            return c.json({ message: "Unauthorized" }, 401)
        }

        const orders = await prisma.orders.findMany({
            where: {
                status: 'NEW',
                waiter: {
                    adminId: Number(payload.adminId)
                }
            },
            select: {
                id: true,
                tableId: true,
                createdAt: true,
                table: {
                    select: {
                        id: true,
                        number: true
                    }
                },
                totalPrice: true,
                items: {
                    select: {
                        id: true,
                        quantity: true,
                        price: true,
                        menuItemId: true, // Select menuItemId for merging
                        menuItem: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        })

        // Group orders by tableId
        const tableGroups = new Map<number, any>();

        orders.forEach(order => {
            if (!tableGroups.has(order.tableId)) {
                tableGroups.set(order.tableId, {
                    id: `table-${order.tableId}`, // Unique ID for the grouped order
                    tableId: order.tableId,
                    table: order.table,
                    itemsMap: new Map<number, any>(), // Temporary map to merge items
                    totalPrice: 0,
                    createdAt: order.createdAt.getTime(),
                });
            }

            const group = tableGroups.get(order.tableId);
            
            order.items.forEach(item => {
                const existingItem = group.itemsMap.get(item.menuItemId);
                if (existingItem) {
                    existingItem.quantity += item.quantity;
                } else {
                    group.itemsMap.set(item.menuItemId, {
                        id: item.id, // Use the ID of the first occurrence
                        name: item.menuItem.name,
                        price: item.price,
                        quantity: item.quantity
                    });
                }
            });

            group.totalPrice += order.totalPrice;
            
            // Keep the earliest createdAt for the group
            const orderTime = order.createdAt.getTime();
            if (orderTime < group.createdAt) {
                group.createdAt = orderTime;
            }
        });

        // Convert grouped itemsMap to items array
        const activeOrders = Array.from(tableGroups.values()).map(group => {
            const { itemsMap, ...rest } = group;
            return {
                ...rest,
                items: Array.from(itemsMap.values())
            };
        });

        return c.json(activeOrders, 200);

    } catch (e) {
        console.log(e);
        return c.json({ message: "Error fetching orders" }, 500);
    }    
}
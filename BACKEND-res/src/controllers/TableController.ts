
import { Context } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";


export const addTable = async (c: Context) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const body = await c.req.json();
    const user = c.get('payload');

    try {
        const table = await prisma.table.create({
            data: {
                number: body.number,
                capacity: body.capacity || 4,
                adminId: Number(user.id),
                status: "AVAILABLE",
            },
        });
        return c.json({ message: "Table added", table });
    } catch (e) {
        return c.json({ message: "Error adding table, number might duplicate", error: e }, 400);
    }
};

export const getTables = async (c: Context) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const user = c.get('payload');
    
    // Allow both ADMIN and WAITER to view tables.
    let adminIdToFetch;
    
    try {
        if (user.role === "ADMIN") {
            adminIdToFetch = user.id;
        } else if (user.role === "WAITER" || user.role === "KITCHEN") {
             // We need to fetch the user to get their adminId
             const fullUser = await prisma.user.findUnique({
                 where: { id: Number(user.id) }
             });
             adminIdToFetch = fullUser?.adminId;
        }

        if (!adminIdToFetch) {
             return c.json({ message: "Unauthorized or no Admin linked" }, 403);
        }

        const tables = await prisma.table.findMany({
            where: {
                adminId: Number(adminIdToFetch)
            },
            orderBy: {
                number: 'asc'
            }
        });

        return c.json({ tables });

    } catch(e) {
         return c.json({ message: "Error fetching tables" }, 500);
    }
};

export const updateTableStatus = async (c: Context) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const body = await c.req.json();
    const tableId = Number(c.req.param("id"));

    try {
        const table = await prisma.table.update({
            where: { id: tableId },
            data: {
                status: body.status // Expecting "AVAILABLE" or "OCCUPIED"
            }
        });
        return c.json({ message: "Table status updated", table });
    } catch (e) {
        return c.json({ message: "Error updating table" }, 400);
    }
};


export const closeTable = async (c: Context) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const tableId = Number(c.req.param("id"));

    try {
        await prisma.$transaction([
            // 1. Mark all 'NEW' orders as 'COMPLETED'
            prisma.orders.updateMany({
                where: {
                    tableId: tableId,
                    status: 'NEW' as any
                },
                data: {
                    status: 'COMPLETED' as any
                }
            }),
            // 2. Set table status to AVAILABLE
            prisma.table.update({
                where: { id: tableId },
                data: {
                    status: 'AVAILABLE'
                }
            })
        ]);

        return c.json({ message: "Table closed and orders finalized" });
    } catch (e) {
        console.log("Error closing table", e);
        return c.json({ message: "Error closing table" }, 400);
    }
}

export const deleteTable = async (c: Context) => {
     const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const tableId = Number(c.req.param("id"));
    // User is already verified and checked for ADMIN role by middleware

    try {
        await prisma.table.delete({
            where: { id: tableId }
        });
        return c.json({ message: "Table deleted" });
    } catch (e) {
         return c.json({ message: "Error deleting table" }, 400);
    }
}

import { Context } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { menuHasher } from "../utils/hash";

export async function getDashboardStats(c: Context) {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        const payload = c.get('payload')
        if (payload.role !== 'ADMIN') {
            return c.json({
                msg: "UnAuthorized"
            }, 401)
        }

        const stats = await prisma.$transaction([
            prisma.orders.aggregate({
                _sum: {
                    totalPrice: true
                }
            }),
            prisma.orders.count(),
            prisma.menuItems.count(),
            prisma.user.count({
                where: {
                    role: { in: ['KITCHEN', 'WAITER'] },
                    adminId: payload.id
                }
            })
        ])

        return c.json({
            Revenue: stats[0]._sum.totalPrice,
            OrderCount: stats[1],
            MenuItemCount: stats[2],
            StaffCount: stats[3]
        })
    } catch (e) {
        return c.json({
            msg: "Something went wrong"
        }, 500)
    }
}

export async function getRevenueData(c: Context) {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        const payload = c.get('payload');
        if (payload.role !== 'ADMIN') {
            return c.json({ msg: "UnAuthorized" }, 401);
        }

        const adminId = payload.id;
        const { timeFrame, date } = c.req.query();

        // Base date for calculation (default to now)
        const baseDate = date ? new Date(date) : new Date();

        let startDate: Date;
        let endDate: Date;

        // Determine date range
        if (timeFrame === 'year') {
            startDate = new Date(baseDate.getFullYear(), 0, 1); // Jan 1st
            endDate = new Date(baseDate.getFullYear() + 1, 0, 1); // Jan 1st next year
        } else if (timeFrame === 'month') {
            startDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1); // 1st of month
            endDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 1); // 1st of next month
        } else if (timeFrame === 'day') {
            // "Day" filter implies "This Week" based on user description (Mon-Sun breakdown)
            // Get current day of week (0=Sun, 1=Mon, ..., 6=Sat)
            const day = baseDate.getDay();
            // Calculate difference to get to Monday (if Sun(0), diff is -6. If Mon(1), diff is 0)
            // We want Monday to be the start.
            const diff = baseDate.getDate() - day + (day === 0 ? -6 : 1);

            startDate = new Date(baseDate.setDate(diff));
            startDate.setHours(0, 0, 0, 0);

            // End date is 7 days from start
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 7);
        } else {
            const day = baseDate.getDay();
            const diff = baseDate.getDate() - day + (day === 0 ? -6 : 1);
            startDate = new Date(baseDate.setDate(diff));
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 7);
        }

        // Fetch orders relevant to this admin within the date range
        // Since Orders doesn't have specific adminId, we check if it has items from this admin
        const orders = await prisma.orders.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lt: endDate
                },
                items: {
                    some: {
                        menuItem: {
                            adminId: adminId
                        }
                    }
                }
            },
            select: {
                totalPrice: true,
                createdAt: true
            }
        });

        // Aggregation Logic
        let aggregatedData: { label: string; value: number }[] = [];

        if (timeFrame === 'year') {
            // Initialize 12 months
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            aggregatedData = months.map(m => ({ label: m, value: 0 }));

            orders.forEach(order => {
                const monthIndex = new Date(order.createdAt).getMonth();
                aggregatedData[monthIndex].value += order.totalPrice;
            });

        } else if (timeFrame === 'month') {
            // Initialize 5 weeks
            aggregatedData = [
                { label: 'Week 1', value: 0 },
                { label: 'Week 2', value: 0 },
                { label: 'Week 3', value: 0 },
                { label: 'Week 4', value: 0 },
                { label: 'Week 5', value: 0 },
            ];

            orders.forEach(order => {
                const dayOfMonth = new Date(order.createdAt).getDate();
                // Simple week calculation: (day - 1) / 7
                const weekIndex = Math.floor((dayOfMonth - 1) / 7);
                if (aggregatedData[weekIndex]) {
                    aggregatedData[weekIndex].value += order.totalPrice;
                }
            });

        } else if (timeFrame === 'day') { // Weekly view
            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            aggregatedData = days.map(d => ({ label: d, value: 0 }));

            orders.forEach(order => {
                const date = new Date(order.createdAt);
                let dayIndex = date.getDay() - 1; // 0=Sun -> -1. We want 0=Mon
                if (dayIndex === -1) dayIndex = 6; // Sunday becomes 6

                if (aggregatedData[dayIndex]) {
                    aggregatedData[dayIndex].value += order.totalPrice;
                }
            });
        }

        return c.json({
            data: aggregatedData
        });

    } catch (e) {
        console.error(e);
        return c.json({
            msg: "Something went wrong"
        }, 500);
    }
}

export async function getTrendingItems(c: Context) {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        const payload = c.get("payload");
        if (payload.role !== "ADMIN") {
            return c.json({ msg: "UnAuthorized" }, 401);
        }

        const user = await prisma.user.findUnique({
            where: { id: payload.id },
        });
        if (!user) {
            return c.json({ msg: "User not found" }, 404);
        }

        const since = new Date();
        since.setDate(since.getDate() - 7);

        const currentPeriod = await prisma.orderItems.groupBy({
            by: ["menuItemId"],
            where: {
                menuItem: { adminId: payload.id },
                order: {
                    createdAt: { gte: since }, // include all orders regardless of status
                },
            },
            _sum: { quantity: true },
        });


        if (currentPeriod.length === 0) {
            return c.json({ data: [] });
        }

        const menuItemIds = currentPeriod.map((i) => i.menuItemId);

        const menuItems = await prisma.menuItems.findMany({
            where: { id: { in: menuItemIds } },
            include: { category: true },
        });

        const menuItemMap = new Map(menuItems.map((m) => [m.id, m]));

        const trendingItems = currentPeriod
            .map((entry) => {
                const item = menuItemMap.get(entry.menuItemId);
                if (!item) return null;

                const sales = entry._sum.quantity ?? 0;

                return {
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    category: item.category.name,
                    sales,
                    revenue: sales * item.price,
                    image: item.imageUrl ?? "",
                }
            })
            .filter((item) => item !== null)
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5);

        return c.json({ data: trendingItems });
    } catch (e) {
        console.error(e);
        return c.json({ msg: "Something went wrong" }, 500);
    }
}

export async function getQrLink(c: Context) {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const payload = c.get("payload");
    if (payload.role !== "ADMIN") {
        return c.json({ msg: "UnAuthorized" }, 401)
    }
    
    const encodedId = menuHasher.encode([payload.id]);
    

    const restaurantUrl = c.env.NODE_ENV === "production" ? c.env.FRONTEND_URL : "http://localhost:5173";
    const qrLink = `${restaurantUrl}/publicMenu/?id=${encodedId}`;
    return c.json({ qrLink });
}
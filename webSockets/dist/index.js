"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ws_1 = require("ws");
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_1 = require("cookie"); // ✅ Fixed: Named import
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.SECRETKEY_JWT;
if (!JWT_SECRET) {
    console.error("FATAL ERROR: SECRETKEY_JWT is not defined in the environment variables.");
    process.exit(1);
}
const httpServer = app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📡 WebSocket server is ready`);
});
const wss = new ws_1.WebSocketServer({ server: httpServer });
// Health check
setInterval(() => {
    wss.clients.forEach((ws) => {
        const client = ws;
        if (client.isAlive === false) {
            return client.terminate();
        }
        client.isAlive = false;
        client.ping();
    });
}, 30000);
wss.on('connection', function connection(ws, req) {
    const authWs = ws;
    authWs.isAlive = true;
    ws.on('pong', () => {
        authWs.isAlive = true;
    });
    try {
        // 1. Get raw cookies
        const rawCookies = req.headers.cookie;
        // 🔍 DEBUG LOGS: Check your server console when you connect!
        console.log("------------------------------------------------");
        console.log("Incoming Cookies:", rawCookies);
        if (!rawCookies) {
            console.error("❌ Error: Browser sent NO cookies. Check 'path' and 'secure' flags in your login route.");
            throw new Error('No cookies found.');
        }
        // 2. Parse the cookies into an object
        const parsedCookies = (0, cookie_1.parse)(rawCookies);
        // 🔍 DEBUG LOGS: See what names we parsed
        console.log("Parsed keys:", Object.keys(parsedCookies));
        // 3. Extract the specific token
        // CHANGE: Use 'accessToken' to match your Hono backend!
        const token = parsedCookies['accessToken'];
        if (!token) {
            console.error(`❌ Error: 'accessToken' cookie is missing. Available cookies: ${Object.keys(parsedCookies).join(', ')}`);
            throw new Error('Token cookie is missing.');
        }
        // 4. Verify
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (!payload.id || !payload.role)
            throw new Error('Invalid payload');
        authWs.user = payload;
        console.log(`✅ Success: User ${authWs.user.id} connected.`);
        // ... Standard message handling ...
        authWs.on('message', function message(data) {
            var _a;
            if (((_a = authWs.user) === null || _a === void 0 ? void 0 : _a.role) !== 'WAITER')
                return;
            try {
                const orderData = JSON.parse(data.toString());
                console.log("Received order data:", orderData);
                console.log(`📬 Order received from ${authWs.user.id}`);
                const payloadForKitchen = JSON.stringify(Object.assign(Object.assign({}, orderData), { waiterId: authWs.user.id }));
                wss.clients.forEach((client) => {
                    var _a, _b;
                    const kitchenWs = client;
                    if (kitchenWs !== authWs && kitchenWs.readyState === ws_1.WebSocket.OPEN && ((_a = kitchenWs.user) === null || _a === void 0 ? void 0 : _a.role) === 'KITCHEN' && kitchenWs.user.adminId === ((_b = authWs.user) === null || _b === void 0 ? void 0 : _b.adminId)) {
                        kitchenWs.send(payloadForKitchen);
                        console.log('order details', payloadForKitchen);
                    }
                });
            }
            catch (e) {
                console.error(e);
            }
        });
    }
    catch (error) {
        console.error(`Authentication failed: ${error.message}`);
        ws.close(1008, 'Authentication Failed');
    }
});

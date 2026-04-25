import express from 'express';
import jwt from 'jsonwebtoken';
import { WebSocketServer, WebSocket } from 'ws';
import dotenv from 'dotenv';
import { parse } from 'cookie'; // ✅ Fixed: Named import

dotenv.config();

interface UserPayload {
  id: string;
  role: 'WAITER' | 'KITCHEN' | 'ADMIN';
  adminId: string;
}

interface AuthenticatedWebSocket extends WebSocket {
  user?: UserPayload;
  isAlive?: boolean;
}

const app = express();
app.use(express.json());

// Use 8080 by default to match the frontend WebSocket URL (ws://localhost:8080)
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.SECRETKEY_JWT;

if (!JWT_SECRET) {
  console.error("FATAL ERROR: SECRETKEY_JWT is not defined in the environment variables.");
  process.exit(1);
}

const httpServer = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 WebSocket server is ready`);
});

const wss = new WebSocketServer({ server: httpServer });

// Health check
setInterval(() => {
  wss.clients.forEach((ws) => {
    const client = ws as AuthenticatedWebSocket;
    if (client.isAlive === false) {
      return client.terminate();
    }
    client.isAlive = false;
    client.ping();
  });
}, 30000);

wss.on('connection', function connection(ws: WebSocket, req) {
  const authWs = ws as AuthenticatedWebSocket;
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
    const parsedCookies = parse(rawCookies); 
    
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
    const payload = jwt.verify(token, JWT_SECRET) as UserPayload;
    if (!payload.id || !payload.role) throw new Error('Invalid payload');

    authWs.user = payload;
    console.log(`✅ Success: User ${authWs.user.id} connected.`);

    // ... Standard message handling ...
    authWs.on('message', function message(data) {
      if (authWs.user?.role !== 'WAITER') return;
      try {
        const orderData = JSON.parse(data.toString());
        console.log("Received order data:", orderData);
        console.log(`📬 Order received from ${authWs.user.id}`);
        
        const payloadForKitchen = JSON.stringify({ ...orderData, waiterId: authWs.user.id });

        wss.clients.forEach((client) => {
          const kitchenWs = client as AuthenticatedWebSocket;
          if (kitchenWs !== authWs && kitchenWs.readyState === WebSocket.OPEN && kitchenWs.user?.role === 'KITCHEN' && kitchenWs.user.adminId === authWs.user?.adminId) { 
            kitchenWs.send(payloadForKitchen);
            console.log('order details', payloadForKitchen);
          }
        });
      } catch (e) { console.error(e); }
    });

  } catch (error) {
    console.error(`Authentication failed: ${(error as Error).message}`);
    ws.close(1008, 'Authentication Failed');
  }
});
import { Hono } from 'hono'
import {cors} from 'hono/cors'
import {UserRouter} from './routers/UserRouter'
import {MenuRouter} from './routers/MenuRouter'
import { OrderRouter } from './routers/OrderRouter'
import { CategoryRouter } from './routers/CategoryRouter'
import { AdminRouter } from './routers/AdminRouter'
import { tableRouter } from './routers/TableRouter'

const app = new Hono().basePath('/api/v1')

app.use('*', cors({
  origin: (origin, c) => {
    const allowedOrigins = [
      'http://localhost:5173',
      c.env.FRONTEND_URL as string
    ].filter(Boolean);
    
    // If the request's origin is in our allowed list, reflect it back
    if (origin && allowedOrigins.includes(origin)) {
      return origin;
    }
    // Default fallback
    return 'http://localhost:5173';
  },
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))
app.route('/user',UserRouter)
app.route('/menu',MenuRouter)
app.route('/order',OrderRouter)
app.route('/category',CategoryRouter)
app.route('/admin',AdminRouter)
app.route('/table',tableRouter)
export default app

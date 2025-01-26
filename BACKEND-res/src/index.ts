import { Hono } from 'hono'
import {cors} from 'hono/cors'
import {UserRouter} from './routers/UserRouter'
import {MenuRouter} from './routers/MenuRouter'
import { OrderRouter } from './routers/OrderRouter'

const app = new Hono()

app.use('/*',cors())
app.route('/api/v1/user',UserRouter)
app.route('/api/v1/menu',MenuRouter)
app.route('api/v1/order',OrderRouter)
export default app

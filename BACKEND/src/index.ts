import { Hono } from 'hono'
import {cors} from 'hono/cors'
import {UserRouter} from './routers/UserRouter'
import {MenuRouter} from './routers/MenuRouter'
const app = new Hono()

app.use('/*',cors())
app.route('/api/v1/user',UserRouter)
app.route('/api/v1/menu',MenuRouter)
export default app

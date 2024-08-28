import express from 'express'
import cors from 'cors'
import http from 'http'
import 'dotenv/config'
import errorHandle from '../middleware/errorHandle'

// Routes root

import userRoute from '../router/userRoute'
import kennelRoute from '../router/kennelRoute'
import adminRoute from '../router/adminRoutes'

const app = express()
export const httpServer = http.createServer(app)
const corsOption = {     
    origin:process.env.CORS,
    method:'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}

app.use(express.json({limit:'50mb'}))
app.use(express.urlencoded({limit:'50mb',extended:true}))
app.use(cors(corsOption))


app.use("/api/user",userRoute)
app.use('/api/kennel',kennelRoute)
app.use('/api/admin',adminRoute)


app.use(errorHandle) 
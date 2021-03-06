import express from 'express'
import cors from 'cors'
import routes from './routes';
const app = express()
import {resolve} from 'path'

app.use(cors())
app.use(express.json())
app.use(routes)
app.use('/uploads', express.static(resolve(__dirname,'..','uploads')))
app.listen(3333,()=>{
  console.log('listening on port: #3333')
})
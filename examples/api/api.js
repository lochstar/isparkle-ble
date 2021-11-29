const Koa = require('koa')
const body = require('koa-body')
const cors = require('koa2-cors')
const logger = require('koa-logger')
const route = require('koa-route')
const iSparkleBle = require('../../isparkle-ble')

const app = new Koa()
const bleSerial = new iSparkleBle()

const PORT = '1338'
const HOST = '0.0.0.0'

// Start ble
bleSerial.debug = true

let radioStatus = ''
let bleConnected = false

bleSerial.on('scanning', (status) => {
  console.log(`bt radio status: ${ status }`)
  radioStatus = status
})

bleSerial.on('connected', (val) => {
  console.log(`connected to: ${ bleSerial.peripheral.address }`)
  bleConnected = val
})

bleSerial.on('data', (data) => {
  console.log(`data: ${ String(data) }`)
})

app.use(body())

app.use(cors({
  origin: '*',
}))

app.use(logger())

app.use(route.get('/status', (ctx) => {
  ctx.body = {
    radioStatus,
    bleConnected,
  }
}))

app.use(route.post('/cmd', (ctx) => {
  if (!bleConnected) {
    ctx.status = 401
    return ctx.body = {
      error: {
        message: `ble not connected`
      }
    }
  }

  if (!ctx.request.body.cmd) {
    ctx.status = 401
    return ctx.body = {
      error: {
        message: 'cmd parameter required'
      }
    }
  }

  bleSerial.sendCmd(ctx.request.body.cmd.split(','))
  ctx.body = ctx.request.body
}))

// Start server
app.listen(PORT, HOST)

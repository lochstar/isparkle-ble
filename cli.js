const readline = require('readline')
const iSparkleBle = require('./isparkle-ble')

const bleSerial = new iSparkleBle()

bleSerial.on('scanning', (status) => {
  console.log(`bt radio status: ${ status }`)
})

bleSerial.on('connected', (val) => {
  console.log(`connected to: ${ bleSerial.peripheral.address }`)

  // listen for terminal input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.setPrompt('CMD> ')
  rl.prompt()

  rl.on('line', (input) => {
    bleSerial.sendCmd(input.split(','))
    rl.prompt()
  })
})

bleSerial.on('data', (data) => {
  console.log(`data: ${String(data)}`)
})

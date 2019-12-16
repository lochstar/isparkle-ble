const iSparkleBle = require('./isparkle-ble')
const BleUart = require('./ble-uart')

const bleSerial = new BleUart()

bleSerial.on('scanning', (status) => {
  console.log(`bt radio status: ${status}`)
})

bleSerial.on('connected', () => {
  console.log(`connected to: ${ bleSerial.peripheral.address }`)
  const device = new iSparkleBle(bleSerial)

  // listen for terminal input
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  })

  readline.on('line', (input) => {
    device.sendCmd(input.split(','))
  })
})

bleSerial.on('data', (data) => {
  console.log(`data: ${String(data)}`)
})

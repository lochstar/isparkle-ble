const noble = require('@abandonware/noble')
const EventEmitter = require('events')

// nordic uart service identifiers
const uart = {
  serviceUUID: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
  txUUID: '6e400002-b5a3-f393-e0a9-e50e24dcca9e',
  rxUUID: '6e400003-b5a3-f393-e0a9-e50e24dcca9e'
}

const uuid = (uuid_with_dashes) => {
  return uuid_with_dashes.replace(/-/g, '')
}

class BleUart extends EventEmitter {
  constructor() {
    super();

    this.serviceUUID = uuid(uart.serviceUUID)
    this.transmitUUID = uuid(uart.txUUID)
    this.receiveUUID = uuid(uart.rxUUID)

    // transmit and receive BLE characteristics
    this.receive = null
    this.transmit = null
    this.writeWithoutResponse = false

    this.connected = false
    this.peripheral = null

    // when the bt radio turns on, start scanning
    noble.on('stateChange', this.scan)

    // connect when a peripheral with the appropriate service is discovered
    noble.on('discover', this.connect)
  }

  scan = (state) => {
    if (state === 'poweredOn') {
      noble.startScanning([this.serviceUUID], false)
    }
    this.emit('scanning', state)
  }

  connect = (peripheral) => {
    this.peripheral = peripheral
    peripheral.connect()

    // called only when the peripheral has the service you're looking for
    peripheral.on('connect', this.discover)

    // when a peripheral disconnects, run disconnect
    peripheral.on('disconnect', this.disconnect)
  }

  discover = () => {
    // once you know you have a peripheral with the desired
    // service, you can stop scanning for others:
    noble.stopScanning()
    // get the service you want on this peripheral:
    this.peripheral.discoverServices([this.serviceUUID], this.explore)
  }

  // the services and characteristics exploration function:
  // once you're connected, this gets run:
  explore = (err, services) => {
    if (err) {
      console.log(err)
      return
    }

    // this gets run by the for-loop at the end of the
    // explore function, below:
    const getCharacteristics = (err, characteristics) => {
      if (err) {
        console.log(err)
        return
      }

      characteristics.forEach((characteristic) => {
        // receive characteristic
        if (characteristic.uuid === this.receiveUUID) {
          this.receive = characteristic
          if (characteristic.properties.indexOf('notify') < 0) {
            console.log(`ERROR: expecting ${characteristic.uuid} to have 'notify' property.`)
          }
          this.receive.notify(true)  // turn on notifications

          this.receive.on('data', (data, notification) => {
            if (notification) {
              this.emit('data', data)
            }
          })

          this.receive.subscribe((err) => {
            if (err) {
              console.error('Error subscribing to receive Characteristic');
            }
          })
        }

        // transmit characteristic
        if (characteristic.uuid === this.transmitUUID) {
          this.transmit = characteristic
          if (characteristic.properties.indexOf('writeWithoutResponse') > -1) {
            this.writeWithoutResponse = true
          } else {
            this.writeWithoutResponse = false
          }
        }
      })

      // if you've got a valid transmit and receive characteristic,
      // then you're truly connected. Emit a connected event:
      if (this.transmit && this.receive) {
        this.connected = true
        this.emit('connected', this.connected)
      }
    }

    // iterate over the services discovered. If one matches
    // the UART service, look for its characteristics:
    for (var s in services) {
      if (services[s].uuid === this.serviceUUID) {
        services[s].discoverCharacteristics([], getCharacteristics)
        return
      }
    }
  }

  // the BLE write function. If there's a valid transmit characteristic,
  /// then write data out to it as a Buffer:
  write = (data) => {
    if (this.transmit) {
      // Bluetooth LE packet is at most 20 bytes
      // slice the data into 20-byte chunks:
      while (data.length > 20) {
        const output = data.slice(0, 19)
        this.transmit.write(Buffer.from(output), this.writeWithoutResponse)
        data = data.slice(20)
      }
      // send any remainder bytes less than the last 20:
      this.transmit.write(Buffer.from(data), this.writeWithoutResponse)
    }
  }

  // the BLE disconnect function:
  disconnect = () => {
    this.connected = false
  }
}

module.exports = BleUart

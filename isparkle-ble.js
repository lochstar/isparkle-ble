const BleUart = require('./ble-uart')

class iSparkleBle extends BleUart {
  constructor(bleSerial) {
    super();
    this.bleSerial = bleSerial
    this.count = 0
  }

  getCmdString(value, action = 'PT') {
    const countString = this.count < 10 ? `0${ this.count }` : this.count
    const typeString = action // PW
    const valueString = `${ value.replace(/\s+/g, '') }`  // remove spaces
    const cmdString = `${ countString }${ typeString }${ valueString }`
    return cmdString
  }

  sendClearCmd(count) {
    const countString = count < 10 ? `0${count}` : count
    const clearCmd = `${ countString }PT0000000000000`

    console.log(`write: ${clearCmd}`)
    this.bleSerial.write(clearCmd)
    this.count++
  }

  sendCmd(commands) {
    // single command
    if (commands.length === 1) {
      if (commands[0] === 'off' || commands[0] === 'on') {
        const cmdString = this.getCmdString(commands[0] === 'off' ? '0' : '1', 'PW')
        console.log(`write ${commands[0]} cmd: ${cmdString}`)
        this.bleSerial.write(cmdString)
        this.count++

        if (commands[0] === 'on') {
          console.log('power on')
          this.bleSerial.write(this.getCmdString('1120005000050'))
          this.count++
        }

        this.sendClearCmd(this.count)
        return cmdString
      }

      const cmdString = this.getCmdString(commands[0])
      console.log(`write: ${cmdString}`)
      this.bleSerial.write(cmdString)
      this.count++

      this.sendClearCmd(this.count)
      return cmdString
    }

    // multiple commands
    commands.forEach((command, i) => {
      const cmdString = this.getCmdString(command)
      console.log(`write: ${cmdString}`)
      this.bleSerial.write(cmdString)
      this.count++

      // clear at end
      if (i === commands.length - 1) {
        this.sendClearCmd(this.count)
      }
    })
  }
}

module.exports = iSparkleBle

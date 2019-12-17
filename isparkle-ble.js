const BleUart = require('./ble-uart')

const VALID_TYPES = [
  'PT',
  'PW',
  'SP',
  'TM',
]

class iSparkleBle extends BleUart {
  constructor() {
    super()
    this.count = 0
  }

  getCmdString(value) {
    let typeString = 'PT'
    if (VALID_TYPES.indexOf(value.slice(0, 2)) > -1) {
      typeString = ''
    }

    const countString = this.count < 10 ? `0${ this.count }` : this.count
    const valueString = `${ value.replace(/\s+/g, '') }`  // remove spaces
    const cmdString = `${ countString }${ typeString }${ valueString }`
    return cmdString
  }

  sendClearCmd() {
    const countString = this.count < 10 ? `0${ this.count }` : this.count
    const clearCmd = `${ countString }PT0000000000000`

    console.log(`write: ${clearCmd}`)
    this.write(clearCmd)
    this.count++
  }

  sendCmd(commands) {
    // single command
    if (commands.length === 1) {
      if (commands[0] === 'off' || commands[0] === 'on') {
        const cmdString = this.getCmdString(commands[0] === 'off' ? 'PW0' : 'PW1')
        console.log(`write ${commands[0]} cmd: ${cmdString}`)
        this.write(cmdString)
        this.count++

        if (commands[0] === 'on') {
          console.log('power on')
          this.write(this.getCmdString('1120005000050'))
          this.count++
        }

        // this.sendClearCmd()
        return cmdString
      }

      const cmdString = this.getCmdString(commands[0])
      console.log(`write: ${cmdString}`)
      this.write(cmdString)
      this.count++

      this.sendClearCmd()
      return cmdString
    }

    // multiple commands
    commands.forEach((command, i) => {
      const cmdString = this.getCmdString(command)
      console.log(`write: ${cmdString}`)
      this.write(cmdString)
      this.count++

      // clear at end
      if (i === commands.length - 1) {
        this.sendClearCmd()
      }
    })
  }
}

export default iSparkleBle

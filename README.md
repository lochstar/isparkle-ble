# iSparkle BLE

Custom controller for [iSparkle](https://www.isparklelight.com) LED Christmas lights. iSparkle uses a BLE device that pairs with a clunky Android/iOS application to control the functions. This is a NodeJS implementation of the API.

Commands were reverse-engineered using the iSparkle app and Bluetooth packet capturing on Android.

## Installation & Usage

Clone the repository and and run `npm install` to install depedencies.

See the [noble](https://github.com/abandonware/noble) repository for installation/execution requirements for Linux/Windows.

Start with `npm start`, once the device connects you can enter your commands in the terminal. Multiple commands can be separated with a comma.

## Commands

Commands are either a 5, 13 or 15 character string.

First 2 characters must increment starting at `00` per connection. These digits are handled by the library and are omitted in the below examples.

Second 2 characters must begin with `PW`, `PT`, `TM` or `SP`.

If a command is successful, an `AK` (Acknowledged) response will be recieved.

If a command is unsuccessful, an `NA` (Not Applicable) response will be recieved.

These responses are prefixed with the 2-digit count value.

### PW (Power)

Power commands are made up of 1 character appended to the preceding 4 characters, totalling 5.

- `0`: Power Off
- `1`: Power On

After powering on you must send a PT command to turn on the lights.

#### Example

```
PW1  // power on
PW0  // power off
```

### PT (Party)

Party commands are made up of 9 characters appended to the preceding 4 characters, totalling 13.

Multiple commands can be sent one-after-another to create a collection.

Send a PT value of `0000000000000` to end a party command collection and activate the lights.

| Colour     | Function  | Brightness | Timing | Brightness | Timing |
| ---------- | --------- | ---------- | ------ | ---------- | ------ |
| 10 (mix)   | 1 (solid) | 00 (off)   | 000    | 00 (off)   | 000    |
| 11 (white) | 2 (fade)  | 10 (max)   | 999    | 10 (max)   | 999    |

Brightness is only used by the **solid** function.

Timing controls pause duration when switching between brightness values when used with **solid**.
Timing controls fade in and fade out duration when used with **fade**.

#### Example

```
PT1010700007000  // mixed solid with 70% brightness
PT1110200002000  // white solid with 20% brightness
PT1120005000050  // white fade with 5s in/out timing
```

### TM (Time)

Time commands are made up of 11 characters appended to the preceding 4 characters, totalling 15.

Two scheduled power on/off times can be set. To set a schedule, send a TM command, followed by a SP command.

Time commands are a datetime stamp in the following format: `1YYYYMMDDHHmmss`.

#### Example

```
TM120191213080634  // Dec 12, 2019 08:03:34
```

### SP (Scheduled Power)

Scheduled Power commands are made up of 9 characters, appended to the preceding 4 characters, totalling 13.

Time commands are a datetime stamp in the following format: `nHHMMHHMM`.

`n` is one of the following:

- 1: Set first schedule
- 2: Clear first schedule
- 3: Set second schedule
- 4: Clear second schedule

To clear a scheduled send all zeroes as the time format. A TM command is not required to be sent before when clearing a schedule.

#### Example

```
SP107001000  // set scheduled 1 to start at 07:00 and end at 10:00
SP308000009  // set schedule 2 to start at 08:00 and end at 00:09

SP200000000  // clear schedule 1
SP400000000  // clear schedule 2
```

### References

- https://github.com/abandonware/noble
- https://github.com/tigoe/BluetoothLE-Examples/tree/master/noble/readSerial
- http://nilhcem.com/iot/reverse-engineering-simple-bluetooth-devices
- https://www.isparklelight.com

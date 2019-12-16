// var fs = require('fs');
const portAudio = require('naudiodon');
const createBuffer = require('audio-buffer-from')

var OfflineAudioContext = require("web-audio-engine").OfflineAudioContext;

window = {}

const RealTimeBPMAnalyzer = require('realtime-bpm-analyzer')

// OfflineContext = require("web-audio-engine").OfflineAudioContext;
// console.log(global.OfflineContext)
// const context = new AudioContext();

// console.log(portAudio.getDevices());
// console.log(portAudio.getHostAPIs());

const onAudioProcess = new RealTimeBPMAnalyzer({
  scriptNode: {
    bufferSize: 4096,
    numberOfInputChannels: 1,
    numberOfOutputChannels: 1
  },
  webAudioAPI: {
    OfflineAudioContext: OfflineAudioContext
  },
  pushTime: 2000,
  pushCallback: (err, bpm) => {
    // console.log('bpm', bpm);
    if (bpm && bpm.length) {
      console.log(bpm[0].count)
    }
  }
})

// Create an instance of AudioIO with inOptions, which will return a ReadableStream
var ai = new portAudio.AudioIO({
  inOptions: {
    channelCount: 2,
    sampleFormat: portAudio.SampleFormat16Bit,
    sampleRate: 44100,
    deviceId: 4
  }
});

ai.on('data', (data) => {
  // console.log(data);
  const audioBuffer = createBuffer(data)
  const pcmData = audioBuffer.getChannelData(0)
  // console.log(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate, audioBuffer.duration)
  // findPeaks(pcmData, audioBuffer.sampleRate)

  // const avg = pcmData.reduce((a, b) => a + b, 0) / pcmData.length
  // console.log(getbars(avg))

  // console.log(audioBuffer)

  // console.log(audioBuffer.length)

  // if (audioBuffer) {
    // onAudioProcess.analyze({ inputBuffer: audioBuffer })
  // }

  // const peaks = extractPeaks(audioBuffer, audioBuffer.sampleRate, false)
  // console.log(peaks)
})

function getbars(val) {
  bars = ''

  // console.log(val / 2)

  for (var i = 0 ; i < (val / 2) - 60 ; i++){
    bars = bars + '|'
  }
  return bars
}

// Create a write stream to write out to a raw audio file
// var ws = fs.createWriteStream('rawAudio.raw');

//Start streaming
// ai.pipe(data);

ai.start();

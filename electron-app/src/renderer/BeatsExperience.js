const { Experience, View, audioContext } = require('soundworks/client');
const Synth = require('./Synth');
const electron = require('electron');

const ipcRenderer = electron.ipcRenderer;

class BeatsPerformance extends Experience {
  constructor() {
    super();

    this.sync = this.require('sync');
    this.platform = this.require('platform', {
      features: 'web-audio',
      showDialog: false,
    });

    this.sharedParams = this.require('shared-params');

    // we hope that some report will be done before experience starts
    this.model = {
      status: '',
      statusDuration: 0,
      timeOffset: 0,
      frequencyRatio: 0,
      connection: '',
      connectionDuration: 0,
      connectionTimeOut: 0,
      travelDuration: 0,
      travelDurationMin: 0,
      travelDurationMax: 0,
    }

    this.sync.addListener((report) => {
      Object.assign(this.model, report);
      console.log(this.model);
    });
  }

  start() {
    super.start();

    this.synth = new Synth(this.sync); // a Web Audio synth that makes sound
    this.synth.connect(audioContext.destination);

    // when the server sends the beat loop start time
    this.receive('start:beat', (startTime, beatPeriod) => {
      this.synth.play(startTime, beatPeriod);
    });

    this.sharedParams.addParamListener('gain', (gain) => {
      this.synth.gain = gain;
    });

    // define latency
    // (function logAudioTime() {
    //   ipcRenderer.send('audio:time', audioContext.currentTime);
    //   setTimeout(logAudioTime, 5);
    // }());
  }
}

module.exports = BeatsPerformance;

import { audioContext } from 'soundworks/client';
import debug from 'debug';

const log = debug('soundworks:beats');


export default class Synth {
  constructor(sync) {
    this.sync = sync;

    this.scheduleID = 0; // to cancel setTimeout
    this.schedulePeriod = 0.05;
    this.scheduleLookahead = 0.5;

    this.clickBuffer = this.generateClickBuffer();
    this.clackBuffer = this.generateClackBuffer();
    this.noiseBuffer = this.generateNoiseBuffer();
  }

  generateClickBuffer() {
    const length = 2;
    const channels = 1;
    const gain = -10; // dB

    let buffer = audioContext.createBuffer(channels, length,
                                           audioContext.sampleRate);
    let data = buffer.getChannelData(0);

    const amplitude = this.dBToLin(gain);
    data[0] = amplitude;
    data[1] = -amplitude;

    return buffer;
  }

  generateClackBuffer() {
    const length = 5;
    const channels = 1;
    const gain = -10; // dB

    let buffer = audioContext.createBuffer(channels, length,
                                           audioContext.sampleRate);
    const amplitude = this.dBToLin(gain);
    let data = buffer.getChannelData(0);

    for(let i = 0; i < length; ++i) {
      data[i] = amplitude; // sic
    }

    return buffer;
  }

  generateNoiseBuffer() {
    const duration = 0.2; // second
    const gain = -30; // dB

    const length = duration * audioContext.sampleRate;
    const amplitude = this.dBToLin(gain);
    const channelCount = audioContext.destination.channelCount;
    let buffer = audioContext.createBuffer(channelCount, length,
                                           audioContext.sampleRate);
    for(let c = 0; c < channelCount; ++c) {
      let data = buffer.getChannelData(c);
      for(let i = 0; i < length; ++i) {
        data[i] = amplitude * (Math.random() * 2 + 1);
      }
    }

    return buffer;
  }

  /**
   * Initiate a running process, starting at nextTime, or now if
   * nextTime is in past.
   *
   * @param {Number} nextTime in sync time
   * @param {Number} period
   */
  play(nextTime, period) {
    clearTimeout(this.scheduleID);
    const now = this.sync.getSyncTime();

    if(nextTime < now + this.scheduleLookahead) {
      // too late
      if(nextTime < now) {
        log('too late by', nextTime - now);
        this.triggerSound(nextTime, this.noiseBuffer);

        // good restart from now
        nextTime += Math.ceil((now - nextTime) / period) * period;

        // next it might be soon: fast forward
        if(nextTime < now + this.scheduleLookahead) {
          log('soon', nextTime - now);
          this.triggerSound(nextTime, this.clackBuffer);
          nextTime += period;
        }
      } else {
        log('triggered', nextTime - now);
        this.triggerSound(nextTime, this.clickBuffer);
        nextTime += period;
      }

    } // within look-ahead

    this.scheduleID = setTimeout( () => {
      this.play(nextTime, period);
    }, 1000 * this.schedulePeriod);
  }

  /**
   * Actually output the sound.
   *
   * @param {Number} startTime in master time
   *
   */
  triggerSound(startTime, buffer) {
    let bufferSource = audioContext.createBufferSource();
    bufferSource.buffer = buffer;
    bufferSource.connect(audioContext.destination);

    // compensate client delay
    const localTime = Math.max(0, this.sync.getAudioTime(startTime));
    bufferSource.start(localTime);
  }

  /**
   * Convert dB to linear gain value (1e-3 for -60dB)
   *
   * @param {number} dBValue
   *
   * @return {number} gain value
   */
  dBToLin(dBValue) {
    return Math.pow(10, dBValue / 20);
  }
}

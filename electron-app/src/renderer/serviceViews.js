const { View } = require('soundworks/client');

// --------------------------- example
/**
 * Interface for the view of the `audio-buffer-manager` service.
 *
 * @interface AbstractAudioBufferManagerView
 * @extends module:soundworks/client.View
 */
/**
 * Method called when a new information about the currently loaded assets
 * is received.
 *
 * @function
 * @name AbstractAudioBufferManagerView.onProgress
 * @param {Number} percent - The purcentage of loaded assets.
 */
// ------------------------------------

const noop = () => {};

const serviceViews = {
  // ------------------------------------------------
  // AudioBufferManager
  // ------------------------------------------------
  'service:audio-buffer-manager': class AudioBufferManagerView extends View {
    onProgress(ratio) {}
  },

  // ------------------------------------------------
  // Checkin
  // ------------------------------------------------
  'service:checkin': class CheckinView extends View {
    constructor() {
      super();
      this._readyCallback = null;
    }

    setReadyCallback(callback) {}
    updateLabel(value) {}
    updateErrorStatus(value) {}
  },


  // ------------------------------------------------
  // Platform
  // ------------------------------------------------
  'service:platform': class PlatformView extends View {
    updateCheckingStatus(value) {}
    updateIsCompatibleStatus(value) {}
    updateHasAuthorizationsStatus(value) {}
  },

  // ------------------------------------------------
  // Raw-Socket
  // ------------------------------------------------
  'service:raw-socket': class RawSocketView extends View {},

  // ------------------------------------------------
  // Sync
  // ------------------------------------------------
  'service:sync': class RawSocketView extends View {},


  // public API
  has(id) {
    return !!this[id];
  },

  get(id, config) {
    const ctor = this[id];
    const view = new ctor();
    // additionnal configuration
    view.model.globals = Object.assign({}, config);
    view.options.id = id.replace(/\:/g, '-');

    return view;
  },
};

module.exports = serviceViews;

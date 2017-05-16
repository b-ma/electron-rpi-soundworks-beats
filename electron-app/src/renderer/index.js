// import client side soundworks and player experience
const electron = require('electron');
const soundworks = require('soundworks/client');
const BeatsExperience = require('./BeatsExperience');
const serviceViews = require('./serviceViews');

// get config from main process
const ipcRenderer = electron.ipcRenderer;
const soundworksConfig = ipcRenderer.sendSync('config:request');

console.log(soundworksConfig);

// initialize the client with configuration received
// from the server through the `index.html`
// @see {~/src/server/index.js}
// @see {~/html/default.ejs}
const config = Object.assign({ appContainer: 'body' }, soundworksConfig);
soundworks.client.init(config.clientType, config);

// configure views for the services
soundworks.client.setServiceInstanciationHook((id, instance) => {
  if (serviceViews.has(id))
    instance.view = serviceViews.get(id, config);
});

// create client side (player) experience and start the client
const experience = new BeatsExperience(config.assetsDomain);
soundworks.client.start();

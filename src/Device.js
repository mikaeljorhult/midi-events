// Declare dependencies.
var PubSub = require('./PubSub');

/**
 * Device class.
 *
 * @param mixed input Port to be attached as input for the device.
 * @param mixed output Port to be attached as output for the device.
 */
function Device(input, output) {
  var midi = require('./main');

  // Resolve ports.
  this.inputs = midi.inputs(input);
  this.outputs = midi.outputs(output);
}

/**
 * Send MIDI message to device.
 *
 * @param message object MIDI message to send.
 * @param timestamp integer Timestamp when message should be sent.
 */
Device.prototype.send = function (message, timestamp) {
  var midi = require('./main');

  // Forward message to correct port.
  midi.send(this.outputs, message, timestamp);

  // Return this to make methods chainable.
  return this;
};

/**
 * Subscribe to MIDI messages from device inputs.
 *
 * @param callback function Function to run when a message is received.
 */
Device.prototype.listen = function (callback) {
  var i,
      length = this.inputs.length;

  // Subscribe to events on each device id.
  for (i = 0; i < length; i++) {
    PubSub.on('id:' + this.inputs[i].id, callback);
  }

  // Return this to make methods chainable.
  return this;
};

/**
 * Unsubscribe function from device messages.
 *
 * @param callback function Function to unsubscribe.
 */
Device.prototype.unlisten = function (callback) {
  var i,
      length = this.inputs.length;

  // Unsubscribe to events on each device port.
  for (i = 0; i < length; i++) {
    PubSub.off(PubSub.on('id:' + this.inputs[i].id, callback));
  }

  // Return this to make methods chainable.
  return this;
};

Device.prototype.on = function (topic, callback) {
  var i,
      length = this.inputs.length;

  topic = ':' + topic;

  // Subscribe to events on each device id.
  for (i = 0; i < length; i++) {
    PubSub.on('id:' + this.inputs[i].id + topic, callback);
  }

  // Return this to make methods chainable.
  return this;
};

Device.prototype.off = function (topic, callback) {
  var i,
      length = this.inputs.length;

  topic = ':' + topic;

  // Unsubscribe to events on each device port.
  for (i = 0; i < length; i++) {
    PubSub.off(PubSub.on('id:' + this.inputs[i].id + topic, callback));
  }

  // Return this to make methods chainable.
  return this;
};

Device.prototype.noteon = function (callback) {
  this.on('noteon', callback);
}

Device.prototype.noteoff = function (callback) {
  this.on('noteoff', callback);
}

Device.prototype.controller = function (callback) {
  this.on('controller', callback);
}

// Return function.
module.exports = Device;
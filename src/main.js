'use strict';

// Declare dependencies.
var Device = require('./Device'),
    PubSub = require('./PubSub');

// Declare variables.
var MIDIEvents  = {},
    supported   = (!!window.navigator.requestMIDIAccess),
    requestMIDI = (supported ? navigator.requestMIDIAccess() : null),
    MIDIAccess  = null;

/**
 * Request access to MIDI devices.
 *
 * @param callback function Callback to run when access to MIDI has been established.
 */
function connect(callback) {
  requestMIDI.then(function (access) {
    MIDIAccess = access;

    // Listen for MIDI messages.
    PubSub.on('connected:input', listen, false);
    listen();

    // Listen for state changes.
    MIDIAccess.addEventListener('statechange', stateChangeListener, false);

    // Trigger event.
    PubSub.trigger('enabled');

    // Trigger callback.
    if (typeof callback === 'function') {
      callback();
    }
  }, requestFailure);
}

/**
 * Get input ports.
 *
 * @return array All available MIDI inputs.
 */
function inputs() {
  return portIterator(MIDIAccess.inputs.values());
}

/**
 * Get output ports.
 *
 * @return array All available MIDI outputs.
 */
function outputs() {
  return portIterator(MIDIAccess.outputs.values());
}

/**
 * Setup listeners for all MIDI ports.
 */
function listen() {
  var ports = inputs();

  // Attach listener to all requested ports.
  for (var i = 0; i < ports.length; i++) {
    ports[i].addEventListener('midimessage', messageListener, false);
  }
}

/**
 * Remove listeners for specified input.
 *
 * @param id integer Input port to stop monitoring for messages.
 */
function unlisten(id) {
  var ports = resolveInputPort('id', id);

  // Attach listener to all requested ports.
  for (var i = 0; i < ports.length; i++) {
    ports[i].removeEventListener('midimessage', messageListener, false);
  }
}

/**
 * Handle event sent from MIDI port.
 *
 * @param event object Event sent from MIDI port.
 */
function messageListener(event) {
  var message = {
    port: event.target.id,
    type: 'unsupported',
    channel: 0
  };

  // Add note and value.
  message.note = event.data[1];
  message.value = event.data[2];

  // Include original event.
  message.originalEvent = event;

  // Determine type of message and channel it was sent on.
  switch (true) {
    // Lower than 128 is not a supported message.
    case (event.data[0] < 128):
      break;

    // 128 - 143 represent note off on each of the 16 channels.
    case (event.data[0] < 144 || (event.data[0] < 160 && event.data[2] === 0)):
      message.type = 'noteoff';
      message.channel = event.data[0] - (event.data[0] > 143 ? 144 : 128);
      break;

    // 144 - 159 represent note on on each of the 16 channels.
    case (event.data[0] < 160):
      message.type = 'noteon';
      message.channel = event.data[0] - 144;
      break;

    // 160 - 176 represent aftertouch on each of the 16 channels.
    case (event.data[0] < 176):
      message.type = 'polyphonic-aftertouch';
      message.channel = event.data[0] - 160;
      break;

    // 176 - 191 represent controller messages on each of the 16 channels.
    case (event.data[0] < 192):
      message.type = 'controller';
      message.channel = event.data[0] - 176;
      break;

    // 192 - 207 represent control change messages on each of the 16 channels.
    case (event.data[0] < 208):
      message.type = 'controlchange';
      message.channel = event.data[0] - 192;
      message.note = 0;
      message.value = event.data[1];
      break;

    // 208 - 223 represent channel aftertouch on each of the 16 channels.
    case (event.data[0] < 224):
      message.type = 'aftertouch';
      message.channel = event.data[0] - 208;
      message.note = 0;
      message.value = event.data[1];
      break;
  }

  // Trigger events.
  PubSub.trigger('message', [message]);
  PubSub.trigger(message.type, [message]);
  PubSub.trigger(message.type + ':' + message.note, [message]);
  PubSub.trigger('port:' + message.port, [message]);
  PubSub.trigger('id:' + event.target.id, [message]);
  PubSub.trigger('id:' + event.target.id + ':' + message.type, [message]);
}

/**
 * Handle state change event sent from MIDI access object.
 *
 * @param event object Event sent from MIDI port.
 */
function stateChangeListener(event) {
  var message = {
    port: event.target.id,
    type: event.port.state,
    interface: event.port.type
  };

  // Include original event.
  message.originalEvent = event;

  // Trigger events.
  PubSub.trigger('statechange', [message]);
  PubSub.trigger(message.type, [message]);
  PubSub.trigger(message.type + ':' + message.interface, [message]);
  PubSub.trigger('id:' + event.target.id, [message]);
  PubSub.trigger('id:' + event.target.id + ':' + message.type, [message]);
}

/**
 * Resolve input port from requested property.
 *
 * @param property string Property of MIDI port to compare.
 * @param value mixed Value of property to match.
 * @return array Resolved port.
 */
function resolveInputPort(property, value) {
  return resolvePort('input', property, value);
}

/**
 * Resolve output port from requested property.
 *
 * @param property string Property of MIDI port to compare.
 * @param value mixed Value of property to match.
 * @return array Resolved port.
 */
function resolveOutputPort(property, value) {
  return resolvePort('output', property, value);
}

/**
 * Resolve port from requested property.
 *
 * @param type string Type of port to resolve.
 * @param property string Property of MIDI port to compare.
 * @param value mixed Value of property to match.
 * @return array Resolved ports.
 */
function resolvePort(type, property, value) {
  var availablePorts = (type === 'output' ? outputs() : inputs()),
      resolvedPorts  = [];

  // Go through each port and compare property.
  for (var i = 0; i < availablePorts.length; i++) {
    // Check if port has the property and if it matches the request.
    if (availablePorts[i].hasOwnProperty(property) && availablePorts[i][property] === value) {
      resolvedPorts.push(availablePorts[i]);
    }
  }

  // Return resolved ports.
  return resolvedPorts;
}

/**
 * Send MIDI message to requested ports.
 *
 * @param output mixed Output ports to send message to.
 * @param message object MIDI message to send.
 * @param timestamp integer Timestamp when message should be sent.
 */
function send(output, messages, timestamp) {
  var ports = outputs(output);

  // Convert message to array if needed.
  if (Object.prototype.toString.call(messages) !== '[object Array]') {
    messages = [messages];
  }

  // Go through and check each message type.
  for (var i = 0; i < messages.length; i++) {
    // Convert string values to numeric.
    switch (messages[i].type) {
      case 'noteon':
        messages[i].type = 144;
        break;

      case 'noteoff':
        messages[i].type = 128;
        break;
    }
  }

  // Send all messages to each requested ports.
  for (var i = 0; i < ports.length; i++) {
    for (var j = 0; j < messages.length; j++) {
      // Do the actual sending.
      ports[i].send([
        messages[j].type,
        messages[j].note,
        messages[j].value
      ], timestamp === undefined ? window.performance.now() : timestamp);
    }
  }
}

/**
 * Go through iterator and return values as an array.
 *
 * @param iterator object ES6 iterator.
 */
function portIterator(iterator) {
  var returnArray = [],
      entry;

  // Add value to array as long as there are more items.
  while (!(entry = iterator.next()).done) {
    returnArray.push(entry.value);
  }

  return returnArray;
}

/**
 * Handle if request for MIDI access failed.
 *
 * @param error object Generated error object.
 */
function requestFailure(error) {
  console.log(error);
}

/**
 * Shorthand for attaching note on listener.
 *
 * @param callback function Function to attach to event.
 */
function noteon(callback) {
  PubSub.on('noteon', callback);
}

/**
 * Shorthand for attaching note off listener.
 *
 * @param callback function Function to attach to event.
 */
function noteoff(callback) {
  PubSub.on('noteoff', callback);
}

/**
 * Shorthand for attaching controller listener.
 *
 * @param callback function Function to attach to event.
 */
function controller(callback) {
  PubSub.on('controller', callback);
}

function createDevice(input, output) {
  return new Device(input, output);
}

// Add methods to MIDIEvents object.
MIDIEvents = {
  supported: supported,
  connect: connect,
  inputs: inputs,
  outputs: outputs,
  unlisten: unlisten,
  send: send,
  resolveInputPort: resolveInputPort,
  resolveOutputPort: resolveOutputPort,

  // Handling devices.
  createDevice: createDevice,

  // Add PubSub methods.
  on: PubSub.on,
  off: PubSub.off,

  // Shorthands for listeners.
  noteon: noteon,
  noteoff: noteoff,
  controller: controller
};

// Return object with public methods.
module.exports = MIDIEvents;
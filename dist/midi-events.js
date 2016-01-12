/*!
 * MIDI Events 0.2.1
 *
 * @author Mikael Jorhult
 * @license https://github.com/mikaeljorhult/midi-events MIT
 */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.midiEvents = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
};

Device.prototype.noteoff = function (callback) {
  this.on('noteoff', callback);
};

Device.prototype.controller = function (callback) {
  this.on('controller', callback);
};

// Return function.
module.exports = Device;

},{"./PubSub":2,"./main":3}],2:[function(require,module,exports){
// Declare variable to store events and callbacks.
var eventCache = {};

// Return public methods.
module.exports = {
  /**
   * Publish a event.
   */
  trigger: function (topic, args, scope) {
    if (eventCache[topic]) {
      var thisTopic = eventCache[topic],
          i = thisTopic.length - 1;

      for (i; i >= 0; i -= 1) {
        thisTopic[i].apply(scope || this, args || []);
      }
    }
  },

  /**
   * Subscribe to a event.
   */
  on: function (topic, callback) {
    if (!eventCache[topic]) {
      eventCache[topic] = [];
    }

    eventCache[topic].push(callback);

    return [topic, callback];
  },

  /**
   * Unsubscribe from event.
   */
  off: function (handle, completly) {
    var t = handle[0],
        i = eventCache[t].length - 1;

    if (eventCache[t]) {
      for (i; i >= 0; i -= 1) {
        if (eventCache[t][i] === handle[1]) {
          eventCache[t].splice(eventCache[t][i], 1);

          if (completly) {
            delete eventCache[t];
          }
        }
      }
    }
  }
};

},{}],3:[function(require,module,exports){
'use strict';

// Declare dependencies.

var Device = require('./Device'),
    PubSub = require('./PubSub');

// Declare variables.
var MIDIEvents = {},
    supported = !!window.navigator.requestMIDIAccess,
    requestMIDI = supported ? navigator.requestMIDIAccess() : null,
    MIDIAccess = null,
    inputPorts = [],
    outputPorts = [];

/**
 * Request access to MIDI devices.
 *
 * @param callback function Callback to run when access to MIDI has been established.
 */
function connect(callback) {
  requestMIDI.then(function (access) {
    MIDIAccess = access;

    // Cache inputs and outputs.
    inputPorts = portIterator(MIDIAccess.inputs.values());
    outputPorts = portIterator(MIDIAccess.outputs.values());

    // Trigger event.
    PubSub.trigger('connected');

    // Trigger callback.
    if (typeof callback === 'function') {
      callback();
    }
  }, requestFailure);
}

/**
 * Get input ports.
 *
 * @param output mixed Requested inputs.
 * @return array All available MIDI inputs.
 */
function inputs(input) {
  return getPorts('input', input);
}

/**
 * Get output ports.
 *
 * @param output mixed Requested outputs.
 * @return array All available MIDI inputs.
 */
function outputs(output) {
  return getPorts('output', output);
}

/**
 * Setup listeners for specified inputs.
 *
 * @param input mixed Input ports to monitor for messages.
 */
function listen(input) {
  var ports = inputs(input),
      length = ports.length,
      i;

  // Attach listener to all requested ports.
  for (i = 0; i < length; i++) {
    ports[i].addEventListener('midimessage', portListener, false);
  }
}

/**
 * Remove listeners for specified inputs.
 *
 * @param input mixed Input ports to stop monitoring for messages.
 */
function unlisten(input) {
  var ports = inputs(input),
      length = ports.length,
      i;

  // Attach listener to all requested ports.
  for (i = 0; i < length; i++) {
    ports[i].removeEventListener('midimessage', portListener, false);
  }
}

/**
 * Handle event sent from MIDI port.
 *
 * @param midiEvent object Event sent from MIDI port.
 */
function portListener(midiEvent) {
  var message = {
    port: resolveInputPort('id', midiEvent.target.id),
    type: 'unsupported',
    channel: 0
  };

  // Add note and value.
  message.note = midiEvent.data[1];
  message.value = midiEvent.data[2];

  // Include original event.
  message.originalEvent = midiEvent;

  // Determine type of message and channel it was sent on.
  switch (true) {
    // Lower than 128 is not a supported message.
    case midiEvent.data[0] < 128:
      break;

    // 128 - 143 represent note off on each of the 16 channels.
    case midiEvent.data[0] < 144 || midiEvent.data[0] < 160 && midiEvent.data[2] === 0:
      message.type = 'noteoff';
      message.channel = midiEvent.data[0] - (midiEvent.data[0] > 143 ? 144 : 128);
      break;

    // 144 - 159 represent note on on each of the 16 channels.
    case midiEvent.data[0] < 160:
      message.type = 'noteon';
      message.channel = midiEvent.data[0] - 144;
      break;

    // 160 - 176 represent aftertouch on each of the 16 channels.
    case midiEvent.data[0] < 176:
      message.type = 'polyphonic-aftertouch';
      message.channel = midiEvent.data[0] - 160;
      break;

    // 176 - 191 represent controller messages on each of the 16 channels.
    case midiEvent.data[0] < 192:
      message.type = 'controller';
      message.channel = midiEvent.data[0] - 176;
      break;

    // 192 - 207 represent control change messages on each of the 16 channels.
    case midiEvent.data[0] < 208:
      message.type = 'controlchange';
      message.channel = midiEvent.data[0] - 192;
      message.note = 0;
      message.value = midiEvent.data[1];
      break;

    // 208 - 223 represent channel aftertouch on each of the 16 channels.
    case midiEvent.data[0] < 224:
      message.type = 'aftertouch';
      message.channel = midiEvent.data[0] - 208;
      message.note = 0;
      message.value = midiEvent.data[1];
      break;
  }

  // Trigger events.
  PubSub.trigger('message', [message]);
  PubSub.trigger(message.type, [message]);
  PubSub.trigger(message.type + ':' + message.note, [message]);
  PubSub.trigger('port:' + message.port, [message]);
  PubSub.trigger('id:' + midiEvent.target.id, [message]);
  PubSub.trigger('id:' + midiEvent.target.id + ':' + message.type, [message]);
}

/**
 * Resolve requested ports.
 *
 * @param type string Type of ports to resolve.
 * @param value mixed Ports to resolve.
 * @return array Resolved ports, or empty array.
 */
function getPorts(type, value) {
  var availablePorts = type === 'output' ? outputPorts : inputPorts,
      arrayToResolve = [],
      ports = [],
      i;

  if (typeof value === 'number') {
    // A single index is requested. Create an array from it.
    if (value < availablePorts.length) {
      ports.push(availablePorts[value]);
    }
  } else if (Object.prototype.toString.call(value).match(/^\[object MIDI(Input|Output)]$/)) {
    // A single MIDI port object was provided. Use it.
    ports.push(value);
  } else if (Object.prototype.toString.call(value) === '[object Array]') {
    // An array of indexes is requested. Add all of them.
    arrayToResolve = value;
  } else if (typeof value === 'string' && value.toLowerCase() === 'all' || value === undefined) {
    // All ports requested. Assign them directly.
    ports = availablePorts;
  }

  // If there are indexes not saved in ports variable.
  if (arrayToResolve.length > 0) {
    // Go through each index and add corresponding port to array.
    for (i = 0; i < arrayToResolve.length; i++) {
      if (typeof arrayToResolve[i] === 'number') {
        // Array index. Make sure that the port exists.
        if (arrayToResolve[i] < availablePorts.length) {
          ports.push(availablePorts[value]);
        }
      } else if (Object.prototype.toString.call(arrayToResolve[i]).match(/^\[object MIDI(Input|Output)]$/)) {
        // A MIDI port object.
        ports.push(arrayToResolve[i]);
      }
    }
  }

  // Return resolved ports.
  return ports;
}

/**
 * Resolve input port from requested property.
 *
 * @param property string Property of MIDI port to compare.
 * @param value mixed Value of property to match.
 * @return integer Resolved port.
 */
function resolveInputPort(property, value) {
  return resolvePort('input', property, value);
}

/**
 * Resolve output port from requested property.
 *
 * @param property string Property of MIDI port to compare.
 * @param value mixed Value of property to match.
 * @return integer Resolved port.
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
  var availablePorts = type === 'output' ? outputPorts : inputPorts,
      length = availablePorts.length,
      resolvedPorts = [],
      i;

  // Go through each port and compare property.
  for (i = 0; i < length; i++) {
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
  var ports = outputs(output),
      i,
      j;

  // Convert message to array if needed.
  if (Object.prototype.toString.call(messages) !== '[object Array]') {
    messages = [messages];
  }

  // Go through and check each message type.
  for (i = 0; i < messages.length; i++) {
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
  for (i = 0; i < ports.length; i++) {
    for (j = 0; j < messages.length; j++) {
      // Do the actual sending.
      ports[i].send([messages[j].type, messages[j].note, messages[j].value], timestamp === undefined ? window.performance.now() : timestamp);
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
  listen: listen,
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

},{"./Device":1,"./PubSub":2}]},{},[3])(3)
});
'use strict';

var util = require('util');
var EventEmitter = require('events').EventEmitter;
var debug = require('debug')('meshblu-relayr');
var relayr = require('relayr');
var meshblu = {};
try {
  meshblu = require('./meshblu.json');
} catch(e) {}

var defaultOptions = meshblu.options || {};

var MESSAGE_SCHEMA = {
  type: 'object',
  properties: {}
};

var OPTIONS_SCHEMA = {
  type: 'object',
  properties: {
    app_id: {
      type: 'string',
      required: true
    },
    dev_id: {
      type: 'string',
      required: true
    },
    app_token: {
      type: 'string',
      required: true
    }
  }
};

function Plugin(){
  this.options = defaultOptions;
  this.messageSchema = MESSAGE_SCHEMA;
  this.optionsSchema = OPTIONS_SCHEMA;
  return this;
}

util.inherits(Plugin, EventEmitter);

Plugin.prototype.onMessage = function(msg){
  var self = this;
  debug('onMessage...');
  debug(msg);
};

Plugin.prototype.onConfig = function(device){
  console.log('configured');
  debug(device)

  var self = this;
  self.setOptions(device.options);

  var relayrKeys = {
    dev_id: undefined,
    app_id: undefined,
    app_token:  undefined
  };

  if (this.options != {}) {
    relayrKeys.dev_id = this.options.dev_id;
    relayrKeys.app_id = this.options.app_id;
    relayrKeys.token  = this.options.app_token;
  }

  if (relayrKeys.dev_id &&
      relayrKeys.app_id &&
      relayrKeys.token) {
    relayr.connect(relayrKeys);
    relayr.listen(function(err,data){
      if (err) {
        debug('relayr error:', err)
      } else {
        console.log(data);
        self.emit("message", {devices: ['*'], payload: {data: data}});
      }
    });
  } else {
    console.log("missing configuration");
  }
};

Plugin.prototype.setOptions = function(options){
  if (options.dev_id &&
      options.app_id &&
      options.token) {
    this.options = options;
  } else {
    this.options = defaultOptions;
  }
};

module.exports = {
  messageSchema: MESSAGE_SCHEMA,
  optionsSchema: OPTIONS_SCHEMA,
  Plugin: Plugin
};

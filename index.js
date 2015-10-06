'use strict';

// load dependency modules
const fs 			= require('fs');
const _p 			= require('path');
const util 			= require('util');
const extend 	 	= require('extend');
const EventEmitter  = require('events');

// the event emitter for dirwalker events
function JauntEmitter() {
	EventEmitter.call(this);
}

// dirwalker inherit EventEmitter prototype
util.inherits(JauntEmitter, EventEmitter);

// asynchronous directory walk function
var walkdirasync = function (path, exts) {
	// if path is a directory then recurse
	(()=> {
		fs.stat(path, (err, stats) => {
			// if stats is a directory then recurse
			if( stats.isDirectory() ) {
				fs.readdir(path, (err, files) => {
					files.forEach( (file) => {
						walkdirasync.call(this, path + _p.sep + file, exts);
					});
				});
			}

			// if extensions arg is an array and the path matches with ext then emit match
			else if ( exts instanceof Array && exts.indexOf(_p.parse(path).ext) >= 0 ){
				this.emit('match', path);
			}

			// exts is an array but there is no match, emit a non-match event
			else if ( exts instanceof Array ) {
				this.emit('non-match', path);
			}

			// something went wrong I think
			else {
				this.emit('error', {
					message: 'missing ext option array possibly?'
				});
			}
		});
	}())
};

// synchronous directory walk function
var walkdirsync = function (path, exts) {
	// if path is a directory then recurse
	if ( fs.statSync(path).isDirectory() ) {
		let dirArray = fs.readdirSync(path);
		dirArray.forEach((entry) => walkdirsync.call(this, path + _p.sep + entry, exts));
	}

	// if extensions arg is an array and the path matches with ext then emit match
	else if ( exts instanceof Array && exts.indexOf(_p.parse(path).ext) >= 0 ) {
		// call callback on path
		this.emit('match', path);
	}

	// exts is an array but there is no match, emit a non-match event
	else if ( exts instanceof Array ) {
		this.emit('non-match', path);
	}

	// something went wrong I think
	else {
		this.emit('error', {
			message: 'missing ext option array possibly?'
		});
	}
}

// default options
let options = {
	async: 	true,	// asynchronous
	exts: 	[]		// extensions
}

// export constructor
module.exports = function Constructor(path, opts) {
	let jaunt 	= new JauntEmitter();

	// if user does not enter a path use cwd...
	if( !typeof path === "string" ) {
		opts = path;
		var path = '.';
	}

	opts = extend(options, opts);

	opts.async ? walkdirasync.call(jaunt, path, opts.exts) : walkdirsync.call(jaunt, path, opts.exts);

	return jaunt;
}

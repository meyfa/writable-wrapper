"use strict";

const util = require("util");
const Writable = require("stream").Writable;

module.exports = WritableWrapper;

/**
 * Construct a new WritableWrapper with the given target.
 *
 * @param {stream.Writable} target The target to write to.
 * @constructor
 */
function WritableWrapper(target) {
    // constructor
    if (!(this instanceof WritableWrapper)) {
        return new WritableWrapper(target);
    }
    Writable.call(this);

    this._target = target;
}

util.inherits(WritableWrapper, Writable);

/**
 * @override
 */
WritableWrapper.prototype._write = function (chunk, encoding, callback) {
    // Forward errors.
    // Note that this cannot be done through the callback on _target.write,
    // because without a listener, that call would throw (which we don't want!).
    // So we attach a listener.
    this._target.once("error", callback);
    this._target.write(chunk, encoding, (err) => {
        if (!err) {
            // No error, so unbind the callback
            this._target.removeListener("error", callback);
            callback();
        }
    });
};

/**
 * @override
 */
WritableWrapper.prototype.end = function (chunk, encoding, callback) {
    // Detect which arguments were really given
    let ch = chunk, enc = encoding, cb = callback;
    if (typeof chunk === "function") {
        cb = chunk;
        ch = enc = null;
    } else if (typeof encoding === "function") {
        cb = encoding;
        enc = null;
    }
    // Write the final chunk of data (if one was given)
    if (ch) {
        this.write(ch, enc);
    }
    // End the stream
    this._target.end(() => {
        // Now end this stream
        Writable.prototype.end.call(this, cb);
    });
};

/**
 * @override
 */
WritableWrapper.prototype.destroy = function (err) {
    // destroy() was added in Node v8.0.0, so we have to do some checks
    if (typeof this._target.destroy === "function") {
        this._target.destroy(err);
    }
    if (typeof Writable.prototype.destroy === "function") {
        Writable.prototype.destroy.call(this, err);
    }
};

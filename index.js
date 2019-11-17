"use strict";

const stream = require("stream");

class WritableWrapper extends stream.Writable {
    /**
     * Construct a new WritableWrapper with the given target.
     *
     * @param {stream.Writable} target The target to write to.
     */
    constructor (target) {
        super();
        this._target = target;
    }

    /**
     * @override
     */
    _write (chunk, encoding, callback) {
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
    }

    /**
     * @override
     */
    end (chunk, encoding, callback) {
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
            super.end(cb);
        });
    }

    /**
     * @override
     */
    destroy (err) {
        if (typeof this._target.destroy === "function") {
            this._target.destroy(err);
        }
        super.destroy(err);
    }
}

module.exports = WritableWrapper;

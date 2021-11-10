import { Writable } from 'stream'

export default class WritableWrapper extends Writable {
  private readonly _target: Writable

  /**
   * Construct a new WritableWrapper with the given target.
   *
   * @param target The target to write to.
   */
  constructor (target: Writable) {
    super()
    this._target = target
  }

  override _write (chunk: any, encoding: BufferEncoding, callback: (error?: Error | null) => void): void {
    // Forward errors.
    // Note that this cannot be done through the callback on _target.write,
    // because without a listener, that call would throw (which we don't want!).
    // So we attach a listener.
    this._target.once('error', callback)
    this._target.write(chunk, encoding, (err) => {
      if (err == null) {
        // No error, so unbind the callback
        this._target.removeListener('error', callback)
        callback()
      }
    })
  }

  override end (chunk?: any, encoding?: any, callback?: any): void {
    // Detect which arguments were really given
    let ch = chunk; let enc = encoding; let cb = callback
    if (typeof chunk === 'function') {
      cb = chunk
      ch = enc = null
    } else if (typeof encoding === 'function') {
      cb = encoding
      enc = null
    }
    // Write the final chunk of data (if one was given)
    if (ch != null) {
      this.write(ch, enc)
    }
    // End the stream
    this._target.end(() => {
      // Now end this stream
      super.end(cb)
    })
  }

  override destroy (err?: Error): void {
    if (typeof this._target.destroy === 'function') {
      this._target.destroy(err)
    }
    super.destroy(err)
  }
}

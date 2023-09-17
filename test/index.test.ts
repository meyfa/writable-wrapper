import assert from 'node:assert'
import { PassThrough } from 'node:stream'
import WritableWrapper from '../index.js'

describe('WritableWrapper', function () {
  describe('#write()', function () {
    it('writes data to target', function (done) {
      const target = new PassThrough()
      const obj = new WritableWrapper(target)
      obj.write('hello world', 'utf8')
      target.on('data', function (chunk) {
        const expected = Buffer.from('hello world', 'utf8')
        assert.ok(expected.equals(chunk))
        done()
      })
    })

    it("emits one 'error' event on failure", function (done) {
      const target = new PassThrough({
        write: function (chunk, encoding, callback) {
          callback(new Error('oops!'))
        }
      })
      const obj = new WritableWrapper(target)
      obj.on('error', function (err) {
        assert.strictEqual(err.message, 'oops!')
        done()
      })
      obj.write('hello world', 'utf8')
    })
  })

  describe('#end()', function () {
    it('writes data to target', function (done) {
      const target = new PassThrough()
      const obj = new WritableWrapper(target)
      obj.end('hello world', 'utf8')
      target.on('data', function (chunk) {
        const expected = Buffer.from('hello world', 'utf8')
        assert.ok(expected.equals(chunk))
        done()
      })
    })

    it('ends the target', function (done) {
      const target = new PassThrough()
      const obj = new WritableWrapper(target)
      target.on('finish', done)
      obj.end()
    })

    it("ends the target before emitting 'finish'", function (done) {
      const target = new PassThrough()
      let targetFinish = false
      const obj = new WritableWrapper(target)
      target.on('finish', function () {
        targetFinish = true
      })
      obj.on('finish', function () {
        assert.ok(targetFinish)
        done()
      })
      obj.end()
    })

    it('invokes the callback when done', function (done) {
      const target = new PassThrough()
      let targetFinish = false
      const obj = new WritableWrapper(target)
      target.on('finish', function () {
        targetFinish = true
      })
      obj.end(function () {
        assert.ok(targetFinish)
        done()
      })
    })

    it('ignores missing encoding argument', function (done) {
      const target = new PassThrough()
      const obj = new WritableWrapper(target)
      obj.end('some data', done)
    })

    it("emits one 'error' event on write failure", function (done) {
      const target = new PassThrough({
        write: function (chunk, encoding, callback) {
          callback(new Error('oops!'))
        }
      })
      const obj = new WritableWrapper(target)
      obj.on('error', function (err) {
        assert.strictEqual(err.message, 'oops!')
        done()
      })
      obj.end('hello world', 'utf8')
    })

    it('returns this', function () {
      const target = new PassThrough()
      const obj = new WritableWrapper(target)
      assert.strictEqual(obj.end('hello world', 'utf8'), obj)
    })
  })

  describe('#destroy()', function () {
    it('should destroy the target', function (done) {
      const target = new PassThrough()
      target.destroy = function (err) {
        assert.strictEqual(err?.message, 'oops!')
        done()
        return target
      }
      const obj = new WritableWrapper(target)
      obj.destroy(new Error('oops!'))
      obj.on('error', () => {})
    })

    it('should not fail for missing destroy() on target', function () {
      const target = new PassThrough()
      // @ts-expect-error - Node.js types require destroy to be a function
      target.destroy = undefined
      const obj = new WritableWrapper(target)
      obj.destroy()
      obj.on('error', () => {})
    })

    it('returns this', function () {
      const target = new PassThrough()
      const obj = new WritableWrapper(target)
      assert.strictEqual(obj.destroy(), obj)
    })
  })
})

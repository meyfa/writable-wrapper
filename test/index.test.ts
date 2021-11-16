import { expect } from 'chai'
import { PassThrough } from 'stream'

import WritableWrapper from '../index'

describe('WritableWrapper', function () {
  describe('#write()', function () {
    it('writes data to target', function (done) {
      const target = new PassThrough()
      const obj = new WritableWrapper(target)
      obj.write('hello world', 'utf8')
      target.on('data', function (chunk) {
        const expected = Buffer.from('hello world', 'utf8')
        expect(chunk).to.satisfy((c: Buffer) => expected.equals(c))
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
        expect(err.message).to.equal('oops!')
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
        expect(chunk).to.satisfy((c: Buffer) => expected.equals(c))
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
        expect(targetFinish).to.be.true
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
        expect(targetFinish).to.be.true
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
        expect(err.message).to.equal('oops!')
        done()
      })
      obj.end('hello world', 'utf8')
    })
  })

  describe('#destroy()', function () {
    it('should destroy the target', function (done) {
      const target = new PassThrough()
      target.destroy = function (err) {
        expect(err?.message).to.equal('oops!')
        done()
      }
      const obj = new WritableWrapper(target)
      obj.destroy(new Error('oops!'))
      obj.on('error', () => {})
    })

    it('should not fail for missing destroy() on target', function () {
      const target = new PassThrough()
      // @ts-expect-error
      target.destroy = undefined
      const obj = new WritableWrapper(target)
      obj.destroy()
      obj.on('error', () => {})
    })
  })
})

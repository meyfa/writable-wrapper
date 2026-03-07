import assert from 'node:assert'
import { once } from 'node:events'
import { PassThrough } from 'node:stream'
import { describe, it } from 'node:test'
import WritableWrapper from '../index.ts'

void describe('WritableWrapper', () => {
  void describe('#write()', () => {
    void it('writes data to target', async () => {
      const target = new PassThrough()
      const obj = new WritableWrapper(target)

      const dataPromise = once(target, 'data')
      obj.write('hello world', 'utf8')

      const [chunk] = await dataPromise
      const expected = Buffer.from('hello world', 'utf8')
      assert.ok(expected.equals(chunk))
    })

    void it('emits one "error" event on failure', async () => {
      const target = new PassThrough({
        write: function (chunk, encoding, callback) {
          callback(new Error('oops!'))
        }
      })
      const obj = new WritableWrapper(target)

      const errorPromise = once(obj, 'error')
      obj.write('hello world', 'utf8')

      const [err] = await errorPromise
      assert.strictEqual((err as Error).message, 'oops!')
    })
  })

  void describe('#end()', () => {
    void it('writes data to target', async () => {
      const target = new PassThrough()
      const obj = new WritableWrapper(target)

      const dataPromise = once(target, 'data')
      obj.end('hello world', 'utf8')

      const [chunk] = await dataPromise
      const expected = Buffer.from('hello world', 'utf8')
      assert.ok(expected.equals(chunk))
    })

    void it('ends the target', async () => {
      const target = new PassThrough()
      const obj = new WritableWrapper(target)

      obj.end()

      await once(target, 'finish')
    })

    void it('ends the target before emitting "finish"', async () => {
      const target = new PassThrough()
      let targetFinish = false
      const obj = new WritableWrapper(target)

      target.on('finish', function () {
        targetFinish = true
      })

      const finishPromise = once(obj, 'finish')
      obj.end()

      await finishPromise
      assert.ok(targetFinish)
    })

    void it('invokes the callback when done', async () => {
      const target = new PassThrough()
      let targetFinish = false
      const obj = new WritableWrapper(target)
      target.on('finish', function () {
        targetFinish = true
      })

      await new Promise<void>((resolve) => {
        obj.end(() => {
          assert.ok(targetFinish)
          resolve()
        })
      })
    })

    void it('ignores missing encoding argument', async () => {
      const target = new PassThrough()
      const obj = new WritableWrapper(target)

      obj.end('some data')
      await once(target, 'finish')
    })

    void it('emits one "error" event on write failure', async () => {
      const target = new PassThrough({
        write: function (chunk, encoding, callback) {
          callback(new Error('oops!'))
        }
      })
      const obj = new WritableWrapper(target)

      const errorPromise = once(obj, 'error')
      obj.end('hello world', 'utf8')

      const [err] = await errorPromise
      assert.strictEqual((err as Error).message, 'oops!')
    })

    void it('returns this', () => {
      const target = new PassThrough()
      const obj = new WritableWrapper(target)
      assert.strictEqual(obj.end('hello world', 'utf8'), obj)
    })
  })

  void describe('#destroy()', () => {
    void it('should destroy the target', async () => {
      const target = new PassThrough()

      const destroyed = new Promise<void>((resolve) => {
        target.destroy = function (err) {
          assert.strictEqual(err?.message, 'oops!')
          resolve()
          return target
        }
      })

      const obj = new WritableWrapper(target)
      obj.destroy(new Error('oops!'))
      obj.on('error', () => {})

      await destroyed
    })

    void it('should not fail for missing destroy() on target', () => {
      const target = new PassThrough()
      // @ts-expect-error - Node.js types require destroy to be a function
      target.destroy = undefined
      const obj = new WritableWrapper(target)
      obj.destroy()
      obj.on('error', () => {})
    })

    void it('returns this', () => {
      const target = new PassThrough()
      const obj = new WritableWrapper(target)
      assert.strictEqual(obj.destroy(), obj)
    })
  })
})

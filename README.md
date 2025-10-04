# writable-wrapper

[![CI](https://github.com/meyfa/writable-wrapper/actions/workflows/main.yml/badge.svg)](https://github.com/meyfa/writable-wrapper/actions/workflows/main.yml)

This TypeScript library for Node.js offers a writable stream implementation that
forwards all data to another `Writable`, the "target".

This is useful for adding functionality to a `Writable` without patching the
original object. `WritableWrapper` can be extended easily and will handle the
forwarding of any data written to it, while not making that data available to
any external consumer.

`Transform` streams are unsuitable for that purpose, since data listeners can
always be attached.

## Install

```
npm i writable-wrapper
```

## Usage

### Simple Example

```ts
import fs from 'fs'
import WritableWrapper from 'writable-wrapper'

const wrapper = new WritableWrapper(fs.createWriteStream('file.txt'))
```

### Custom Class Example

Of course, this functionality is really only useful for custom object types:

```ts
import fs from 'fs'
import WritableWrapper from 'writable-wrapper'

// Class for new items. You can write data, and when done, store the item.
// Not calling 'store' dismisses the item.
class NewlyCreatedItem extends WritableWrapper {
  store (): void {
    this.end(function () {
      // store this item
    })
  }
}

// ...

const item = new NewlyCreatedItem(fs.createWriteStream('file.txt'))
item.write('hello world', 'utf8')
item.store()
```

# writable-wrapper

[![Build Status](https://travis-ci.com/meyfa/writable-wrapper.svg?branch=master)](https://travis-ci.com/meyfa/writable-wrapper)
[![Test Coverage](https://api.codeclimate.com/v1/badges/1c1c78851c5a0ccda78b/test_coverage)](https://codeclimate.com/github/meyfa/writable-wrapper/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/1c1c78851c5a0ccda78b/maintainability)](https://codeclimate.com/github/meyfa/writable-wrapper/maintainability)

This Node package offers a writable stream implementation that forwards all data
to another Writable, the "target".

This is useful for adding functionality to a `Writable` without patching the
original object. `WritableWrapper` can be extended easily and will handle the
forwarding of any data written to it, while not making that data available to
any external consumer.

`Transform` streams are unsuitable for that purpose, since data listeners can
always be attached.

## Install

```
npm install --save writable-wrapper
```

## Usage

### Simple Example

```javascript
const fs = require("fs");
const WritableWrapper = require("writable-wrapper");

const wrapper = new WritableWrapper(fs.createWriteStream("file.txt"));
```

### Custom Class Example

Of course, this functionality is really only useful for custom object types:

```javascript
const fs = require("fs");
const util = require("util");
const WritableWrapper = require("writable-wrapper");

// Class for new items. You can write data, and when done, store the item.
// Not calling 'store' dismisses the item.
function NewlyCreatedItem(target) {
    WritableWrapper.call(this, target);
}

// make NewlyCreatedItem a subclass of WritableWrapper
util.inherits(NewlyCreatedItem, WritableWrapper);

NewlyCreatedItem.prototype.store = function () {
    this.end(function () {
        // store this item
    });
};

// ...

const item = new NewlyCreatedItem(fs.createWriteStream("file.txt"));
item.write("hello world", "utf8");
item.store();
```

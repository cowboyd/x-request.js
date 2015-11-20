# x-request

[![npm version](https://badge.fury.io/js/x-request.svg)](https://badge.fury.io/js/x-request)
[![Build Status](https://travis-ci.org/cowboyd/x-request.js.svg)](https://travis-ci.org/cowboyd/x-request.js)

Easily achieve beautiful, transparent uploads and downloads with an
immutable, event-driven XmlHttpRequest

## Why?

The familiar `XMLHttpRequest` object that is part of the standard browser
toolkit provides an imperative / callback based API, and so reacting
to changes can be a frustrating exercise in "what callbacks do I
register? onloadend? onload?", "In what order are they fired?", "what
are the properties of the event", etc...

`XRequest` is a drop-in replacement for the native `XMLHttpRequest`
that side-steps those problems by emitting a fully formed state every
time something changes about the request. Each state is both immutable
and complete, which means that it contains the _full representation_
of the request at the time it was emitted, leaving you free to consume
or ignore any property.

## Reactive, Framework Agnostic.

`x-request` derives its power by coupling complete, immutable states
with the simplest form of reactivity known to exist: _*the
callback*_. Furthermore, it is "Just JavaScript" with absolutely
_zero_ third party dependencies.

In this way, it can be easily embedded into the framework of your
choice, or composed with external protocols such as the [observable-spec][1]

### Bindings

`x-request` currently has bindings for

* Ember - [emberx-xml-http-request][2]

Please do consider using it and updating the list.

## Usage

To use, instantiate the request with the desired options, as well as a
function to observe the states.

``` javascript
import XRequest from 'x-request';

let request = new XRequest({
  //static options are passed along to the
  withCredentials: true,
  requestType: "json",
  //invoked every time there is a state change.
  observe: function(nextState) {
    state = nextState;
  }
});

//we can read the initial state before the callback is
//invoked.
let state = request.state;

state.readyState //=> 0
state.isLoadStarted //=> false
state.isLoadEnded //=> start

// use just like a normal xhr.
request.open('PUT', 'http://fileupload.com', true);
request.setRequestHeader('Authorization', `Bearer ${myAuthToken}`);

// get your data just like you would normally.
let data = new FormData();
data.set('string', 'value1');
data.set('blob', getBlobFromSomewhere());


request.send(data);
```

At some point, the request load will start and the `XRequest` will
emit a new state.

``` javascript
state.isLoadStarted //=> true
```

As the download progress, it will emit new states every time bytes are
transferred across the network; both uploaded bytes and downloaded
bytes.

``` javascript
state.download.percentage //=> 93
state.upload.percentage //=> 15
```

Having this information as a POJO is like gold for your UI.

## State

All of the properties of the the XHR, including `readyState`,
`status`, `response`, `responseText`, etc... are included with each
state. The full schema of each state looks roughly like:

``` javascript
{
  readyState: 0,
  requestHeaders: {},
  responseHeaders: {},
  responseType: 'json'
  response: '',
  responseText: '',
  responseXML: '',
  isLoadStarted: false, // alias for download.isLoadStarted
  isLoadEnded: false,   // alias for download.isLoadEnded
  isAborted: false,     // alias for download.isAborted
  isErrored: false,     // alias for download.isErrored
  isTimedOut: false,    // alias for download.isTimedOut
  download: {
    isLoadStarted: false,
    isLoadEnded: false,
    isAborted: false,
    isErrored: false,
    isLengthComputable: false,
    total: 0,
    loaded: 0,
    ratio: 0,
    percentage: 0
  },
  upload: {
    isLoadStarted: false,
    isLoadEnded: false,
    isAborted: false,
    isErrored: false,
    isLengthComputable: false,
    total: 0,
    loaded: 0,
    ratio: 0,
    percentage: 0
  }
}
```

## Options

The folowing options are supported in the constructor to `XRequest`:

* *freeze*: By default, the states that are emitted by `XRequest` have been
frozen with `Object.freeze()` and so are immutable in the strictest sense of the
word. Set this option to `false` if you don't want strict immutability.
* *observe*: a function that will be invoked every time there is a  state
transition. It is passed the full immutable with each invocation.
* *withCredentials:* passed directly to the underlying XHR, this says whether or
not to use the current browser cookies. defaults to `false`
* *timeout*: passed diretly to the underlying `XMLHttpRequest` object, indicates
the timeout for the request in milliseconds.
* *responseType*: passed directly to the underlying `XMLHttpRequest` object. It
indicates the data type of the `response` property.

[1]: https://github.com/jhusain/observable-spec
[2]: https://github.com/thefrontside/emberx-xml-http-request

## Development

```
git clone https://github.com/cowboyd/x-request.js.git
cd x-request.js
npm test
```

## LICENSE

(The MIT License)

Copyright (c) 2015 Charles Lowell

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
Status API Training Shop Blog About Pricing

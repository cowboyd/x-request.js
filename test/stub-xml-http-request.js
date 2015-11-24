import sinon from 'sinon';

let noop = function() {};

class XMLHttpRequestEventTarget {
  constructor() {
    this.onloadstart = noop;
    this.load = noop;
    this.onloadend = noop;
    this.onprogress = noop;
    this.onerror = noop;
    this.onabort = noop;
  }
}

export default class XMLHttpRequest extends XMLHttpRequestEventTarget {
  constructor() {
    super();
    this.readyState = 0;
    this.onreadystatechange = noop;
    this.onloadstart = noop;
    this.onloadend = noop;
    this.onerror = noop;
    this.onabort = noop;


    this.open = sinon.spy();
    this.send = sinon.spy(()=> {
      this.readyState = 1;
      this.onreadystatechange({});
    });
    this.abort = sinon.spy();

    this.upload = new XMLHttpRequestEventTarget();
  }
}

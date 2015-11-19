import Progress from './progress';

export default class XRequest {
  constructor(options = {}) {
    let xhr = new (options.XMLHttpRequest || window.XMLHttpRequest)();
    xhr.responseType = options.responseType;
    xhr.timeout = options.timeout || 0;
    xhr.withCredentials = options.withCredentials || false;
    let upload = new Progress(xhr.upload, {
      freeze: options.freeze,
      observe: (fact)=> {
        this.update((next)=> {
          next.upload = fact;
        });
      }
    });
    let download = new Progress(xhr, {
      freeze: options.freeze,
      observe: (fact)=> {
        this.update((next)=> {
          next.download = fact;
        });
      }
    });
    this.observe = options.observe || function() {};
    this.state = new State({
      xhr: xhr,
      freeze: options.freeze,
      upload: upload.state,
      download: download.state
    });
  }

  open(method, url) {
    this.state.xhr.open(method, url, true);
  }

  send(object) {
    this.state.xhr.send(object);
  }

  update(change) {
    this.state = new State(this.state, change);
    this.observe(this.state);
  }
}


class State {
  constructor(previous = {}, change = ()=> {}) {
    Object.assign(this, previous, {
      readyState: previous.xhr.readyState,
      status: previous.xhr.status,
      response: previous.xhr.response
    });
    if (this.responseType === 'text' || this.responseType === '') {
      this.responseText = previous.xhr.responseText;
    } else if (this.responseType === 'xml') {
      this.responseXML = previous.xhr.responseXML;
    }
    if (change.call) {
      change(this);
    } else {
      Object.assign(this, change);
    }
    if (this.freeze !== false) {
      Object.freeze(this);
    }
  }
  get isLoadStarted() { return this.download.isLoadStarted; }
  get isLoadEnded() { return this.download.isLoadEnded; }
  get isAborted() { return this.download.isAborted; }
  get isErrored() { return this.download.isErrored; }
  get isTimedOut() { return this.download.isTimedOut; }
}

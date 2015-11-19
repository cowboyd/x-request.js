import Progress from './progress';

let Top = this;

export default class XRequest {
  constructor(options = {XMLHttpRequest: Top.XMLHttpRequest}) {
    let xhr = new options.XMLHttpRequest();
    xhr.responseType = options.responseType;
    xhr.timeout = options.timeout || 0;
    xhr.withCredentials = options.withCredentials || false;
    let upload = new Progress(xhr.upload, {
      observe: (fact)=> {
        this.update((next)=> {
          next.upload = fact;
        });
      }
    });
    let download = new Progress(xhr, {
      observe: (fact)=> {
        this.update((next)=> {
          next.download = fact;
        });
      }
    });
    this.observe = options.observe || function() {};
    this.state = new State({
      xhr: xhr,
      upload: upload.state,
      download: download.state
    });
  }

  open(method, url) {
    this.state.xhr.open(method, url);
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
      response: previous.xhr.response,
      responseText: previous.xhr.responseText,
      responseXML: previous.xhr.responseXML
    });
    if (change.call) {
      change(this);
    } else {
      Object.assign(this, change);
    }
  }
  get isLoadStarted() { return this.download.isLoadStarted; }
  get isLoadEnded() { return this.download.isLoadEnded; }
  get isAborted() { return this.download.isAborted; }
  get isErrored() { return this.download.isErrored; }
  get isTimedOut() { return this.download.isTimedOut; }
}

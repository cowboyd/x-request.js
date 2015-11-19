export default class Progress {
  constructor(target, options = {observe: ()=> {}}) {
    this.observe = options.observe;
    this.target = target;
    this.state = new State({freeze: options.freeze});
    target.onloadstart = (event)=> {
      this.update({loadStart: new ProgressEvent(event)});
    };
    target.onloadend = (event)=> {
      this.update({loadEnd: new ProgressEvent(event)});
    };
    target.onprogress = (event)=> {
      this.update((next)=> {
        next.progress = next.progress.concat(new ProgressEvent(event));
      });
    };
    target.onabort = (event)=> {
      this.update({abort: new ProgressEvent(event)});
    };
    target.onerror = (event)=> {
      this.update({error: new ProgressEvent(event)});
    };
    target.ontimeout = (event)=> {
      this.update({timeout: new ProgressEvent(event)});
    };
  }
  update(change) {
    this.state = new State(this.state, change);
    this.observe(this.state);
  }
}

class State {
  constructor(previous = {}, change = ()=> {}) {
    Object.assign(this, {
      abort: null,
      error: null,
      loadStart: null,
      loadEnd: null,
      timeout: null,
      progress: []
    }, previous);
    if (change.call) {
      change(this);
    } else {
      Object.assign(this, change);
    }
    if (this.freeze !== false) {
      Object.freeze(this.progress);
      Object.freeze(this);
    }
  }

  get isAborted() {
    return !!this.abort;
  }

  get isErrored() {
    return !!this.error;
  }

  get isLoadStarted() {
    return !!this.loadStart;
  }

  get isLoadEnded() {
    return !!this.loadEnd;
  }

  get isTimedOut() {
    return !!this.timeout;
  }

  get latest() {
    let event = this.progress[this.progress.length - 1];
    if (!event) {
      event = { total: 0, loaded: 0, lengthComputable: false };
    }
    return event;
  }

  get isLengthComputable() {
    return this.latest.lengthComputable;
  }

  get loaded() {
    return this.latest.loaded;
  }

  get total() {
    return this.latest.total;
  }

  get ratio() {
    if (this.loaded === 0 && this.total === 0) {
      return 0;
    }
    return this.loaded / this.total;
  }

  get percentage() {
    return Math.floor(this.ratio * 100);
  }
}


class ProgressEvent {
  constructor(event) {
    this.event = event;
    this.timestamp = new Date();
  }

  get lengthComputable() {
    return this.event.lengthComputable;
  }

  get total() {
    return this.event.total;
  }

  get loaded() {
    return this.event.loaded;
  }
}

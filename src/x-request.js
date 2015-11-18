let Top = this;

class Progress {
  constructor(target, options = {observe: ()=> {}}) {
    this.observe = options.observe;
    this.target = target;
    this.state = new State();
  }
  update(change) {
    this.state = new State(this.state, change);
    this.observe(this.state);
  }
}

export default class XRequest extends Progress {
  constructor(options = {XMLHttpRequest: Top.XMLHttpRequest}) {
    super(new options.XMLHttpRequest(), options);
    let upload = new Progress(this.target.upload, {
      observe: (state)=> {
        this.update((next)=> {
          next.upload = state;
        });
      }
    });
    this.state = new State({
      xhr: this.target,
      upload: upload.state
    });
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
    Object.freeze(this.progress);
    Object.freeze(this);
  }

  get isAborted() {
    return !!this.abort;
  }

  get isErrored() {
    return !!this.error;
  }

  get isLoadStarted() {
    return !!this.loadStarted;
  }

  get isLoadEnded() {
    return !!this.loadEnded;
  }

  get isTimedOut() {
    return !!this.timeout;
  }

  get latest() {

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
    if (this.loaded === 0 && this.total ===0) {
      return 0;
    }
    return this.loaded / this.total;
  }

  get percentage() {
    return Math.floor(this.ratio * 100);
  }
}

import 'sinon-chai';
import {describe, beforeEach, it} from 'mocha';
import { expect } from 'chai';
import XRequest from '../src/x-request';
import StubRequest from './stub-xml-http-request';

describe("x-request", function() {
  beforeEach(function() {
    this.request = new XRequest({
      observe: (state)=> this.state = state,
      responseType: "json",
      timeout: 1000,
      withCredentials: true,
      XMLHttpRequest: StubRequest
    });
    this.xhr = this.request.state.xhr;
  });
  it("can be constructed", function() {
    expect(this.request).to.be.instanceOf(Object);
  });
  it("sets configuration properties onto the xhr itself", function() {
    expect(this.xhr.responseType).to.equal("json");
    expect(this.xhr.timeout).to.equal(1000);
    expect(this.xhr.withCredentials).to.equal(true);
  });
  it("can accept an XMLHttpRequest constructor", function() {
    expect(this.request.state.xhr).to.be.instanceOf(StubRequest);
  });
  it("has an initial state", function() {
    expect(this.request.state).to.be.instanceOf(Object);
  });
  it("does not emit an inital state", function() {
    expect(this.state).not.to.be.instanceOf(Object);
  });
  it("is immutable by default", function() {
    expect(()=> { this.request.state.expando = true; }).to.throw();
  });
  it("has an initial state", function() {
    var state = this.request.state;
    expect(state.readyState).to.equal(0);
    expect(state.download.isLoadStarted).to.equal(false);
    expect(state.download.isLoadEnded).to.equal(false);
    expect(state.download.isErrored).to.equal(false);
    expect(state.download.isTimedOut).to.equal(false);
    expect(state.download.percentage).to.equal(0);
    expect(state.download.ratio).to.equal(0);
    expect(state.download.total).to.equal(0);
    expect(state.download.loaded).to.equal(0);
    expect(state.download.isLengthComputable).to.equal(false);
  });
  it("has an initial upload state", function() {
    let upload = this.request.state.upload;
    expect(upload.isLoadStarted).to.equal(false);
    expect(upload.isLoadEnded).to.equal(false);
    expect(upload.isErrored).to.equal(false);
    expect(upload.isTimedOut).to.equal(false);
    expect(upload.percentage).to.equal(0);
    expect(upload.ratio).to.equal(0);
    expect(upload.total).to.equal(0);
    expect(upload.loaded).to.equal(0);
    expect(upload.isLengthComputable).to.equal(false);
  });

  describe("aborting", function() {
    beforeEach(function() {
      this.request.abort();
    });
    it("aborts the underlying request", function() {
      expect(this.xhr.abort).to.have.been.called;
    });
  });
  describe("opening the request", function() {
    beforeEach(function() {
      this.originalState = this.request.state;
      this.request.open('POST', 'https://file.upload.com');
    });

    it("invokes the underlying xhr method", function () {
      expect(this.xhr.open).to.have.been.calledWith('POST', 'https://file.upload.com', true);
    });
    describe("sending a file", function() {
      beforeEach(function() {
        this.request.send("Hi Bob.");
      });
      it("calls the underlying send method", function() {
        expect(this.xhr.send).to.have.been.calledWith('Hi Bob.');
      });

      describe(". While in-flight", function() {
        beforeEach(function() {
          this.initial = this.request.state;
        });
        describe("when the upload starts", function() {
          beforeEach(function() {
            this.xhr.upload.onloadstart({type: 'loadstart'});
          });
          it("emits a new state", function() {
            expect(this.initial).to.not.equal(this.request.state);
          });
        });

        describe("when the download starts", function() {
          beforeEach(function() {
            this.xhr.onloadstart({ type: 'loadstart' });
          });
          it("emits a new state", function() {
            expect(this.initial).to.not.equal(this.request.state);
          });
          it("reflects the started download", function() {
            let download = this.request.state.download;
            expect(download.isLoadStarted).to.equal(true);
          });
        });
      });

      describe("when the download ends", function() {
        beforeEach(function() {
          this.xhr.response = {hello: "world"};
          this.xhr.onloadend({type: 'loadend'});
        });
        it("emits a new state", function() {
          expect(this.initial).to.not.equal(this.request.state);
        });
        it("reflects that the download is finished", function() {
          expect(this.request.state.download.isLoadEnded).to.equal(true);
        });
        it("copies over the response text and JSON", function() {
          expect(this.request.state.response).to.deep.equal({hello: "world"});
        });
      });

      describe("when the download reports progress", function() {
        beforeEach(function() {
          this.xhr.onprogress({
            type: 'progress',
            lengthComputable: true,
            total: 100,
            loaded: 51
          });
        });

        it("emits a new state", function() {
          expect(this.initial).to.not.equal(this.request.state);
        });
        it("indicates that the length is computable", function() {
          expect(this.request.state.download.isLengthComputable).to.equal(true);
        });
        it("reports the ratio and percentage of the download progress", function() {
          expect(this.request.state.download.ratio).to.equal(0.51);
          expect(this.request.state.download.percentage).to.equal(51);
        });
      });

      describe("when it is aborted", function() {
        beforeEach(function() {
          this.xhr.onabort({type: 'abort'});
        });

        it("emits a new state", function() {
          expect(this.inital).to.not.equal(this.request.state);
        });
        it("reports that the download is ended", function() {
          expect(this.request.state.isAborted).to.equal(true);
        });
      });

      describe("when it is errored", function() {
        beforeEach(function() {
          this.xhr.onerror({type: 'error'});
        });
        it("emits a new state", function() {
          expect(this.initial).to.not.equal(this.request.state);
        });
        it("reports tha the download is errored", function() {
          expect(this.request.state.isErrored).to.equal(true);
        });
      });

      describe("when it times out", function() {
        beforeEach(function() {
          this.xhr.ontimeout({type: 'timeout'});
        });
        it("emits a new state", function() {
          expect(this.initial).to.not.equal(this.request.state);
        });
        it("reports tha the download is timed out", function() {
          expect(this.request.state.isTimedOut).to.equal(true);
        });
      });

    });
  });
  describe("constructing without freezing", function() {
    beforeEach(function() {
      this.request = new XRequest({
        freeze: false,
        XMLHttpRequest: StubRequest
      });
    });
    it("can add rando props to the state", function() {
      expect(()=> { this.request.state.expando = true; }).to.not.throw();
    });
  });

});

var expect = chai.expect,
    midiEvents = window.midiEvents;

describe('main.js', function () {
  it('should be globally available', function () {
    expect(midiEvents).to.be.a('object');
  });

  it('should check if Web MIDI API is supported', function () {
    expect(midiEvents).to.have.property('supported');
    expect(midiEvents.supported).to.be.a('boolean');
  });

  it('should emit connected event when connect', function (done) {
    midiEvents.on('connected', function() {
      done();
    });

    midiEvents.connect();
  });
})
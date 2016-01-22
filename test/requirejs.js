var expect = chai.expect;

requirejs.config({
  baseUrl: '../dist'
});

require(['midi-events'], function (midiEvents) {
  describe('main.js', function () {
    it('should be globally available', function () {
      expect(midiEvents).to.be.a('object');
    });

    it('should check if Web MIDI API is supported', function () {
      expect(midiEvents).to.have.property('supported');
      expect(midiEvents.supported).to.be.a('boolean');
    });

    it('should emit connected event when connect', function (done) {
      expect(midiEvents).to.have.property('connect');
      expect(midiEvents.connect).to.be.a('function');

      // Should be triggered when connect method is called.
      midiEvents.on('enabled', function() {
        done();
      });

      midiEvents.connect();
    });

    it('should return an array of available inputs', function () {
      expect(midiEvents).to.have.property('inputs');
      expect(midiEvents.inputs).to.be.a('function');

      var inputs = midiEvents.inputs();

      expect(inputs).to.be.a('array');
    });

    it('should return an array of available outputs', function () {
      expect(midiEvents).to.have.property('outputs');
      expect(midiEvents.outputs).to.be.a('function');

      var outputs = midiEvents.inputs();

      expect(outputs).to.be.a('array');
    });
  });

  mocha.run();
});
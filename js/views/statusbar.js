exports.createStatusbar = function(m, pubsub) {
  'use strict';
  var status = m.prop(''),
    endTime = function() {
      var timeDiff = Date.now() - time;
      status('done, time: (' + timeDiff + ')');
    },
    time;

  function setStatus (text) {
    m.startComputation();
    status(text);
    m.endComputation();
  }

  pubsub.on('run-query', function() {
    time = Date.now();
    setStatus('executing...');
  });
  pubsub.on('data', endTime);
  pubsub.on('data-error', endTime);
  pubsub.on('schema-loaded', function () {
    setStatus('Schema loaded !');
  });
  return {
    view: function() {
      return m('div', {
        'class': 'statusbar'
      }, status());
    }
  };
};
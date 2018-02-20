var through2 = require('through2');

var javaStreams = module.exports;

javaStreams.filter = function(cb) {
  return through2.obj(async function(chunk, enc, callback) {
    if (await cb(chunk)) {
      this.push(chunk);
    }

    callback();
  })
};

javaStreams.map = function(cb) {
  return through2.obj(async function(chunk, enc, callback) {
    this.push(await cb(chunk));

    callback();
  })
};

javaStreams.allMatch = function(cb) {
  var matches = 0;
  var total = 0;

  return through2.obj(async function(chunk, enc, callback) {
    if (await cb(chunk)) {
      matches += 1;
    }

    total += 1;

    callback();
  }, function() {
    this.emit('data', matches === total);
  });
};

javaStreams.anyMatch = function(cb) {
  var matches = 0;

  return through2.obj(async function(chunk, enc, callback) {
    if (await cb(chunk)) {
      matches += 1;
    }

    callback();
  }, function() {
    this.emit('data', matches > 0);
  });
};

javaStreams.collect = function() {
  var elements = [];

  return through2.obj(function(chunk, enc, callback) {
    elements.push(chunk);

    callback();
  }, function() {
    this.emit('data', elements);
  });
};

javaStreams.count = function() {
  var total = 0;

  return through2.obj(function(chunk, enc, callback) {
    total += 1;

    callback();
  }, function() {
    this.emit('data', total);
  });
};

javaStreams.distinct = function() {
  var elements = new Set();

  return through2.obj(function(chunk, enc, callback) {
    elements.add(chunk);

    callback();
  }, function() {
    this.emit('data', Array.from(elements));
  });
};

javaStreams.findFirst = function() {
  var element;

  return through2.obj(function(chunk, enc, callback) {
    if (element === undefined) {
      element = chunk;
    }

    callback();
  }, function() {
    this.emit('data', element);
  });
};

javaStreams.forEach = function(cb) {
  return through2.obj(async function(chunk, enc, callback) {
    await cb(chunk);

    this.push(chunk);

    callback();
  });
};

javaStreams.limit = function(n) {
  var matches = 0;

  return through2.obj(function(chunk, enc, callback) {
    if (matches < n) {
      this.push(chunk);
    }

    matches += 1;

    callback();
  });
};

javaStreams.max = function() {
  var highest;

  return through2.obj(function(chunk, enc, callback) {
    if (!highest || chunk > highest) {
      highest = chunk;
    }

    callback();
  }, function() {
    this.emit('data', highest);
  });
};

javaStreams.min = function() {
  var lowest;

  return through2.obj(function(chunk, enc, callback) {
    if (!lowest || chunk > lowest) {
      lowest = chunk;
    }

    callback();
  }, function() {
    this.emit('data', lowest);
  });
};

javaStreams.noneMatch = function(cb) {
  var matches = 0;

  return through2.obj(async function(chunk, enc, callback) {
    if (await cb(chunk)) {
      matches += 1;
    }

    callback();
  }, function() {
    this.emit('data', matches === 0);
  });
};

javaStreams.reduce = function(init, cb) {
  var prev;
  var results;

  return through2.obj(async function(chunk, enc, callback) {
    if (!prev) {
      prev = init;
    }

    results = await cb(prev, chunk);
    prev = results;

    callback();
  }, function() {
    this.emit('data', results);
  });
};

javaStreams.skip = function(n) {
  var toSkip = n;

  return through2.obj(function(chunk, enc, callback) {
    if (toSkip === 0) {
      this.push(chunk);
    }

    toSkip -= 1;

    callback();
  });
};

javaStreams.sorted = function(cb) {
  var elements = [];

  return through2.obj(function(chunk, enc, callback) {
    elements.push(chunk);

    callback();
  }, function() {
    elements.sort(cb);

    this.emit('data', elements);
  });
};

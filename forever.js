const forever = require('forever-monitor'),
      path = require('path');

const dirIndex = __dirname,
      indexJS = path.join(dirIndex, 'index.js');

console.log('Starting the nodeJS script: ' + indexJS);
console.log('Running on directory: ' + dirIndex);

var child = new (forever.Monitor)(indexJS, {
  cwd: dirIndex,
  max: 3,
  uid: 'dns-autoupdater',
  silent: false,
  args: []
});

child.on('exit', () => {
  console.log(indexJS + ' has unexpectedly exited after some restarts');
});

child.start();

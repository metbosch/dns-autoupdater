const Service = require('node-windows').Service,
      path = require('path');

const dirIndex = __dirname,
      indexJS = path.join(dirIndex, 'index.js');

console.log('Starting the nodeJS script: ' + indexJS);
console.log('Running on directory: ' + dirIndex);

var svc = new Service({
  name: 'DNS Autoupdater',
  description 'NodeJS script that automatically updates the DNS record with the computer public IP',
  script: indexJS,var Service = require('node-windows').Service;
});

svc.on('install', () => {
  svc.start();
});

svc.on('alreadyinstalled', () => {
  console.log('Service is already installed. Uninstaling it first...');
  svc.uninstall();
});

svc.on('uninstall', () => {
  console.log('Service correctly uninstalled. Reinstalling now...');
  svc.install();
});

svc.on('start', () => {
  console.log('Service correctly started.');
});

svc.on('error', () => {
  console.log('ERROR on the service.');
});

svc.on('invalidinstallation', () => {
  console.log('Cannot install the service. Invalid parameters.');
});

svc.install();

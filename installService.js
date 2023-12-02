var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name: 'BoscoPresenter Node.js Service',
  description: 'BoscoPresenter app running as a service.',
  script: 'C:\\BoscoPresenter\\index.js',
});

svc.on('install',function(){
  svc.start();
});

svc.install();

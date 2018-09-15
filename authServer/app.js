const io = require('socket.io').listen(3000);
const soccketModules = require('./socketModules.js');
const socketRoutes = require('./socketRoutes.js')(io,soccketModules);
console.log(`authServer is ready`);
var {Pool} = require('pg');
exports.pool = new Pool({
    user : '',
    host : '',
    database : '',
    password : '',
    port : ''
});
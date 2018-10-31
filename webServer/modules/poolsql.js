const {Pool} = require('pg');
exports.pool = new Pool({
    user : 'postgres',
    host : '13.231.226.96',
    database : 'blogdb',
    password : 'ckddnjs1',
    port : '5432'
});
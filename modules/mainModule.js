var poolSql = require('./poolsql');
module.exports.searchSelectedSubCategory=(mainCat,cb)=>{
    var categoryTable;  //게시물 테이블 이름
    var categoryRow1,categortRow2;  //게시물 row이름
    switch(mainCat){ // 게시판 종류 switch
        case '0' : {    // blog
            categoryTable = 'boardblog';    categoryRow = 'bblogcategory1';
            categortRow2 = 'bblogcategory2';
            break;
        }
        case '1' : {    //code
            categoryTable = 'boardcode';    categoryRow = 'bcodecategory1';
            categortRow2 = 'bcodecategory2';
            break;
        }
        default : {     //undifined
            cb('[mainModule.js][ERR]wrong category number, inserted['+mainCat+']',null);
            return;
        }
    }
    
    poolSql.pool.on('error',(err,client)=>{
        console.error('Unexpected err on idle clients',err);
        process.exit(-1);
    });
    poolSql.pool.connect().then(client =>{
        return client.query('select '+categoryRow+' as cat1, NULL as cat2  from '+categoryTable+' union select NULL as cat1, '+categortRow2+' as cat2 from '+categoryTable+';')
            .then(res =>{
                client.release();
                cb(null,res.rows);
            })
            .catch(e =>{
                console.log(e);
                cb(e,null);
            })
    })
}
var poolSql = require('./poolsql');
module.exports.appendNewPost=(rawItems,cb)=>{
    let mainCategory = rawItems.mainCategory;
    switch(mainCategory){
        case 'Code':{
            uploadCodePost(mainCategory,rawItems,(err)=>{
                if(err){
                    cb('[mainModule.js][appendNewPost][uploadPost][ERR] err : '+err);
                }else{
                    cb(null);
                }
            });
            return;
        }
        case 'Blog':{
            uploadBlogPost(mainCategory,rawItems,(err)=>{
                if(err){
                    cb('[mainModule.js][appendNewPost][uploadPost][ERR] err : '+err);
                }else{
                    cb(null);
                }
            });
            return;
        }
        default : {
            cb('[mainModule.js][appendNewPost][uploadPost][ERR] err, undefined mainCategory : '+mainCategory);
            return;
        }
    }

}

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
function uploadBlogPost(mainCategory,rawItems,cb){
    let subCategory1 = rawItems.subCategory1;
    let subCategory2 = rawItems.subCategory2;
    let context = rawItems.contextText;
    let thumbnailImg = rawItems.thumbnailImg;
    //context =context.replace(/<br>/g,'<br\/>');

    let title = rawItems.title;
    poolSql.pool.on('error',(err,client)=>{
		console.error('Unexpected err on idle clients',err);
		process.exit(-1);
	});
	poolSql.pool.connect((err,client,done)=>{
		if(err) throw err;
        client.query('INSERT INTO boardblog(bblogcategory1, bblogcategory2, bblogtitle, bblogdate, bblogcontext, bblogimg) VALUES ($1, $2, $3, now() AT TIME ZONE \'Asia/Seoul\', $4, $5);',
            [subCategory1,subCategory2,title,context,thumbnailImg],(err,res)=>{
            done();
            console.log('여까진왔나'+err);
			if(err){
				console.log(err.stack);
				cb(err);
			}else{
				console.log(res.rows);
				cb(null);
			}
		});
	});
};
function uploadCodePost(mainCategory,rawItems,cb){
    let subCategory1 = rawItems.subCategory1;
    let subCategory2 = rawItems.subCategory2;
    let context = rawItems.contextText;
    let thumbnailImg = rawItems.thumbnailImg;

    let title = rawItems.title;
    poolSql.pool.on('error',(err,client)=>{
		console.error('Unexpected err on idle clients',err);
		process.exit(-1);
	});
	poolSql.pool.connect((err,client,done)=>{
		if(err) throw err;
		client.query('INSERT INTO boardcode(bcodecategory1, bcodecategory2, bcodetitle, bcodedate, bcodecontext, bcodeimg) VALUES ($1, $2, $3, now() AT TIME ZONE \'Asia/Seoul\', $4, $5);',[subCategory1,subCategory2,title,context,thumbnailImg],(err,res)=>{
            done();
			if(err){
				console.log(err.stack);
				cb(err);
			}else{
				console.log(res.rows);
				cb(null);
			}
		});
	});
}
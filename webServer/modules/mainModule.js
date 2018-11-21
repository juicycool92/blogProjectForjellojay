const poolSql = require('./poolsql');

module.exports.appendNewPost=(rawItems,cb)=>{//관리자가 새 post를 입력할때 작동(err)
    const mainCategory = rawItems.mainCategory;//메인카테고리에 따라 다른 table에 입력된다.
    switch(mainCategory){
        case 'Code':{
            uploadPost('code',rawItems,(err)=>{
            //uploadCodePost(mainCategory,rawItems,(err)=>{
                if(err){
                    cb('[mainModule.js][appendNewPost][uploadPost][ERR] err : '+err);
                }else{
                    cb(null);
                }
            });
            return;
        }
        case 'Blog':{
            uploadPost('blog',rawItems,(err)=>{
            //uploadBlogPost(mainCategory,rawItems,(err)=>{
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
module.exports.getNewAndHot=(reqSize,cb)=>{ //신규,핫 토픽을 가져온다.(err,resultJson)
    callNewPost(reqSize,(err,resNew)=>{
        if(err){
            cb('[mainModule][getNewAndHot][callNewPost][ERR]'+err,null);
        }else{
            callHotPost(reqSize,(err,resHot)=>{
                if(err){
                    cb('[mainModule][getNewAndHot][callHotPost][ERR]'+err,null);
                }else{
                    cb(null,{"new":resNew,"hot":resHot});
                }
            });
        }
    });
}

function callNewPost(reqSize,cb){//새 토픽을 불러오는 내부함수
    poolSql.pool.on('error',(err,client)=>{
		console.error('Unexpected err on idle clients',err);
		process.exit(-1);
	});
	poolSql.pool.connect((err,client,done)=>{
		if(err){
            console.log(`[CRITICAL]EOORO MIGHT SERVER IMPECT DETAIL : `+err);
        };
        client.query('select \'blog\' as maincat, bblognum as num, bblogdate as dates, bblogcategory1 as cat1, bblogcategory2 as cat2, bblogtitle as title, bblogthumbnailtext as context, bblogimg as img from boardblog union select \'code\' as mainCat, bcodenum as num, bcodedate as dates, bcodecategory1 as cat1, bcodecategory2 as cat2, bcodetitle as title, bcodethumbnailtext as context, bcodeimg as img from boardcode order by dates desc limit $1;'
        ,[reqSize],(err,res)=>{
            done();
			if(err){
				cb(err,null);
			}else{
				cb(null,res.rows);
			}
		});
	});
};
function callHotPost(reqSize,cb){//핫 토픽을 불러오는 내부함수
    poolSql.pool.on('error',(err,client)=>{
		console.error('Unexpected err on idle clients',err);
		process.exit(-1);
	});
	poolSql.pool.connect((err,client,done)=>{
		if(err) throw err;
        client.query('select \'blog\' as maincat, bblognum as num, bblogcount as counts, bblogcategory1 as cat1, bblogcategory2 as cat2, bblogtitle as title, bblogthumbnailtext as context, bblogimg as img from boardblog union select \'code\' as mainCat, bcodenum as num, bcodecount as counts, bcodecategory1 as cat1, bcodecategory2 as cat2, bcodetitle as title, bcodethumbnailtext as context, bcodeimg as img from boardcode order by counts desc limit $1;'
        ,[reqSize],(err,res)=>{
            done();
			if(err){
				cb(err,null);
			}else{
				cb(null,res.rows);
			}
		});
	});
};

module.exports.searchSelectedSubCategory=(mainCat,cb)=>{//선택된 mainCategory의 subcategory들을 모두 불러온다. 중복은 재외한다.
    let categoryTable;  //게시물 테이블 이름
    let categoryRow1,categortRow2;  //게시물 row이름
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
let uploadPost = (mainCategory,rawItems,cb)=>{  //포스트 업로드 내부함수, 수정버전이므로 버그 발견 가능성 있음.
    //mainCategory 인자에 db table name과 동일하게 작성하여 실행하면, 아래의 uploadBlogPost나 uploadCodePost처럼 정상작동할것.
    const subCategory1 = rawItems.subCategory1;
    const subCategory2 = rawItems.subCategory2;
    const context = rawItems.contextText;
    let thumbnailImg = rawItems.thumbnailImg;
    const thumbnailText = rawItems.thumbnailText;
    if(thumbnailImg==='' ||thumbnailImg===' ' ||thumbnailImg===null || !thumbnailImg){
        thumbnailImg='public/noThumbnail.jpg';
    }
    const title = rawItems.title;
    poolSql.pool.on('error',(err,client)=>{
		console.error('Unexpected err on idle clients',err);
		process.exit(-1);
	});
	poolSql.pool.connect((err,client,done)=>{
		if(err) throw err;
        client.query('INSERT INTO board'+mainCategory+'(b'+mainCategory+'category1, b'+mainCategory+'category2, b'+mainCategory+'title, b'+mainCategory+'date, b'+mainCategory+'context, b'+mainCategory+'img, b'+mainCategory+'thumbnailtext ) VALUES ($1, $2, $3, now() AT TIME ZONE \'Asia/Seoul\', $4, $5, $6);',
            [subCategory1,subCategory2,title,context,thumbnailImg,thumbnailText],(err,res)=>{
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
/*
//NOT USED AT THIS MOMENT. WILL BE REPLACE BY 'uploadPost' FUNCTION DUE TO DUPLICATED ISSUE.
//IF THERE IS NO SUCH AS ERROR, THIS COMMENT SECTION WILL ERASE AFTER 1.1

function uploadBlogPost(mainCategory,rawItems,cb){  //포스트글을 업로드하는 내부함수
    const subCategory1 = rawItems.subCategory1;
    const subCategory2 = rawItems.subCategory2;
    const context = rawItems.contextText;
    let thumbnailImg = rawItems.thumbnailImg;
    const thumbnailText = rawItems.thumbnailText;
    if(thumbnailImg==='' ||thumbnailImg===' ' ||thumbnailImg===null || !thumbnailImg){
        thumbnailImg='public/noThumbnail.jpg';
    }
    const title = rawItems.title;
    poolSql.pool.on('error',(err,client)=>{
		console.error('Unexpected err on idle clients',err);
		process.exit(-1);
	});
	poolSql.pool.connect((err,client,done)=>{
		if(err) throw err;
        client.query('INSERT INTO boardblog(bblogcategory1, bblogcategory2, bblogtitle, bblogdate, bblogcontext, bblogimg, bblogthumbnailtext ) VALUES ($1, $2, $3, now() AT TIME ZONE \'Asia/Seoul\', $4, $5, $6);',
            [subCategory1,subCategory2,title,context,thumbnailImg,thumbnailText],(err,res)=>{
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
    const subCategory1 = rawItems.subCategory1;
    const subCategory2 = rawItems.subCategory2;
    const context = rawItems.contextText;
    let thumbnailImg = rawItems.thumbnailImg;
    const thumbnailText = rawItems.thumbnailText;
    
    if(thumbnailImg==='' ||thumbnailImg===' ' ||thumbnailImg===null || !thumbnailImg){
        thumbnailImg='public/noThumbnail.jpg';
    }
    const title = rawItems.title;

    poolSql.pool.on('error',(err,client)=>{
		console.error('Unexpected err on idle clients',err);
		process.exit(-1);
	});
	poolSql.pool.connect((err,client,done)=>{
		if(err) throw err;
       client.query('INSERT INTO boardcode(bcodecategory1, bcodecategory2, bcodetitle, bcodedate, bcodecontext, bcodeimg, bcodethumbnailtext ) VALUES ($1, $2, $3, now() AT TIME ZONE \'Asia/Seoul\', $4, $5, $6);',
            [subCategory1,subCategory2,title,context,thumbnailImg,thumbnailText],(err,res)=>{
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
*/
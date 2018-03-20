const {Pool} = require('pg');
const pool = new Pool({
    user : 'postgres',
    host : 'localhost',
    database : 'blogdb',
    password : 'ckddnjs1',
    port : '5432'
});
module.exports.callBlogAtPageNum = (curPage,cb)=>{
	//curPage는 불러올 페이지의 번호를 언급한다. curPage가 0일 경우에는, num이 desc로 되었을때 처음 10종목을,
	//1일 경우에는 1*11 로 해서 11번째부터 10종목을 가져오게끔 짜야 할 것 이다.
	var reqStartPost = curPage*10;
	pool.on('error',(err,client)=>{
		console.error('Unexpected err on idle clients',err);
		process.exit(-1);
	});
	pool.connect()
		.then(client =>{
			return client.query('select bblognum as num, bblogcategory1 as category1, bblogcategory2 as category2, bblogtitle as title, bblogdate as date from boardblog order by num desc offset $1 limit 10;',[reqStartPost])
				.then(res =>{
					client.release();
					calculateBlogSize((err,size)=>{
						if(err)
							cb(err,null,null);
						else
							cb(null,res.rows,size);
					})
				})
				.catch(e =>{
					///client.release();
					console.log(e.stack);
					cb(e,null,null);
				})
		})
}	
//	pool.on('error',(err,client)=>{
//		console.error('Unexpected err on idle clients',err);
//		process.exit(-1);
//	})
//	pool.connect((err,client,done)=>{
//		if(err) throw err;
//		client.query('select * from boardblog',(err,res)=>{
//			done();
//			if(err){
//				console.log(err.stack);
//			}else{
//				console.log(res.rows);
//			}
//		})
//	})
module.exports.callSelectedPost = (reqBoardNum,cb)=>{
	pool.on('error',(err,client)=>{
		console.error('Unexpected err on idle clients',err);
		process.exit(-1);
	});
	pool.connect((err,client,done)=>{
		if(err) throw err;
		client.query('select bblognum as num, bblogcategory1 as category1, bblogcategory2 as category2, bblogtitle as title, bblogdate as date, bblogcontext as context from boardblog where bblognum = $1;',[reqBoardNum],(err,res)=>{
			done();
			if(err){
				console.log(err.stack);
				cb(err,null);
			}else{
				console.log(res.rows);
				cb(null,res.rows[0]);
			}
		});
	});
}
module.exports.pickPrevNextPost = (reqBoardNum,cb)=>{
	pool.on('error',(err,client)=>{
		console.error('Unexpected err on idle clients',err);
		process.exit(-1);
	});
	pool.connect((err,client,done)=>{
		if(err) throw err;
		client.query('select * from(select bblognum as num, bblogtitle as title, lag(bblognum) over (order by bblognum desc rows between current row and unbounded following) as prev,lead(bblognum) over (order by bblognum desc rows between current row and unbounded following) as nextt from boardblog)x where $1 in(prev,nextt);',[reqBoardNum],(err,res)=>{
			done();
			if(err){
				console.log(err.stack);
				cb(err,null);
			}else{
				console.log(res.rows);
				cb(null,res.rows);
			}
		});
	});
}
function calculateBlogSize(cb){
	pool.on('error',(err,client)=>{
		console.error('Unexpected err on idle clients',err);
		process.exit(-1);
	});
	pool.connect()
		.then(client =>{
			return client.query('select count(*) from boardblog;')
				.then(res =>{
					client.release();
					cb(null,res.rows[0].count);
				})
				.catch(e =>{
					//client.release();
					console.log(e);
					cb('[blogModule][innerF.calculateBlogSize]err on sql',null);
				})
		})
}

const poolSql = require('./poolsql');

module.exports.callBlogAtPageNum = (curPage,cb)=>{
	//현제페이지에 존재하는 게시물들의 정보를 불러온다. 임의로 10개를 불러오게 되어있는데, 추후 수정을 가한다면 이곳에서 할것.
	//(err,목록들,실제 출력된 갯수)
	//실제 출력된 갯수는, 실제 게시글이 10개가 안되었을때를 위한 예외처리.
	let reqStartPost = curPage*10;
	poolSql.pool.on('error',(err,client)=>{
		console.error('Unexpected err on idle clients',err);
		process.exit(-1);
	});
	poolSql.pool.connect()
		.then(client =>{
			return client.query('select bblognum as num, bblogcategory1 as category1, bblogcategory2 as category2, bblogtitle as title, bblogdate as date from boardblog order by num desc offset $1 limit 10;'
			,[reqStartPost])
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
					console.log(e.stack);
					cb(e,null,null);
				})
		})
}	

module.exports.callSelectedPost = (reqBoardNum,cb)=>{//선택한 글을 불러온다. (err,selectedPost)
	poolSql.pool.on('error',(err,client)=>{
		console.error('Unexpected err on idle clients',err);
		process.exit(-1);
	});
	poolSql.pool.connect((err,client,done)=>{
		if(err) throw err;
		client.query('select bblognum as num, bblogcategory1 as category1, bblogcategory2 as category2, bblogtitle as title, bblogdate as date, bblogcontext as context from boardblog where bblognum = $1;'
		,[reqBoardNum],(err,res)=>{
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
module.exports.pickPrevNextPost = (reqBoardNum,cb)=>{ //이전,다음 게시물을 조회한다.(err,prevAndNext)
	poolSql.pool.on('error',(err,client)=>{
		console.error('Unexpected err on idle clients',err);
		process.exit(-1);
	});
	poolSql.pool.connect((err,client,done)=>{
		if(err) throw err;
		client.query('select * from(select bblognum as num, bblogtitle as title, lag(bblognum) over (order by bblognum desc rows between current row and unbounded following) as prev,lead(bblognum) over (order by bblognum desc rows between current row and unbounded following) as nextt from boardblog)x where $1 in(prev,nextt);'
		,[reqBoardNum],(err,res)=>{
			done();
			if(err){
				console.log(err.stack);
				cb(err,null);
			}else{
				cb(null,res.rows);
			}
		});
	});
}
module.exports.countSelectPost =(reqBoardNum)=>{ //해당 게시글의 조회수를 1 올리는 함수, 리턴필요가 없으므로 콜백이 없다.
	poolSql.pool.on('error',(err,client)=>{
		console.error('Unexpected err on idle clients',err);
		process.exit(-1);
	});
	poolSql.pool.connect((err,client,done)=>{
		if(err) throw err;
		client.query('update boardblog set bblogcount = bblogcount+1 where bblognum = $1 returning bblogcount;'
		,[reqBoardNum],(err,res)=>{
			done();
			if(err){
				console.log('[blogModule][countSelectPost][WARN]'+err.stack);
			}else{
				console.log('[blogModule][countSelectPost][INFO] success increase board num :'+JSON.stringify(res.rows[0]));
			}
		});
	});
}

function calculateBlogSize(cb){//blog db의 갯수를 뽑아내는 내부함수 (err,count)
	poolSql.pool.on('error',(err,client)=>{
		console.error('Unexpected err on idle clients',err);
		process.exit(-1);
	});
	poolSql.pool.connect()
		.then(client =>{
			return client.query('select count(*) from boardblog;')
				.then(res =>{
					client.release();
					cb(null,res.rows[0].count);
				})
				.catch(e =>{
					console.log(e);
					cb('[blogModule][innerF.calculateBlogSize]err on sql',null);
				})
		})
}

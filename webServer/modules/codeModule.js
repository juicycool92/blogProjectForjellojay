/* 현제 불필요하게 blog와code게시글 js가 중복되고있다.
추후 게시판이 늘어난다면 불편함은 더 증대될 건데,
여유가 있을때 통합작업을 하자 */
const poolSql = require('./poolsql');
module.exports.callcodeAtPageNum = (curPage,cb)=>{
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
			return client.query('select bcodenum as num, bcodecategory1 as category1, bcodecategory2 as category2, bcodetitle as title, bcodedate as date from boardcode order by num desc offset $1 limit 10;'
			,[reqStartPost])
				.then(res =>{
					client.release();
					calculatecodeSize((err,size)=>{
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
		client.query('select bcodenum as num, bcodecategory1 as category1, bcodecategory2 as category2, bcodetitle as title, bcodedate as date, bcodecontext as context from boardcode where bcodenum = $1;',[reqBoardNum],(err,res)=>{
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
module.exports.pickPrevNextPost = (reqBoardNum,cb)=>{//이전,다음 게시물을 조회한다.(err,prevAndNext)
	poolSql.pool.on('error',(err,client)=>{
		console.error('Unexpected err on idle clients',err);
		process.exit(-1);
	});
	poolSql.pool.connect((err,client,done)=>{
		if(err) throw err;
		client.query('select * from(select bcodenum as num, bcodetitle as title, lag(bcodenum) over (order by bcodenum desc rows between current row and unbounded following) as prev,lead(bcodenum) over (order by bcodenum desc rows between current row and unbounded following) as nextt from boardcode)x where $1 in(prev,nextt);'
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
		client.query('update boardcode set bcodecount = bcodecount+1 where bcodenum = $1 returning bcodecount;',[reqBoardNum],(err,res)=>{
			done();
			if(err){
				console.log('[codeModule][countSelectPost][WARN]'+err.stack);
			}else{
				console.log('[codeModule][countSelectPost][INFO] success increase board num :'+JSON.stringify(res.rows[0]));
			}
		});
	});
}
function calculatecodeSize(cb){//code db의 갯수를 뽑아내는 내부함수 (err,count)
	poolSql.pool.on('error',(err,client)=>{
		console.error('Unexpected err on idle clients',err);
		process.exit(-1);
	});
	poolSql.pool.connect()
		.then(client =>{
			return client.query('select count(*) from boardcode;')
				.then(res =>{
					client.release();
					cb(null,res.rows[0].count);
				})
				.catch(e =>{
					console.log(e);
					cb('[codeModule][innerF.calculatecodeSize]err on sql',null);
				})
		})
}

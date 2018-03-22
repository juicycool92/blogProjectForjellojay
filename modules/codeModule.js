var poolSql = require('./poolsql');
module.exports.callcodeAtPageNum = (curPage,cb)=>{
	//curPage는 불러올 페이지의 번호를 언급한다. curPage가 0일 경우에는, num이 desc로 되었을때 처음 10종목을,
	//1일 경우에는 1*11 로 해서 11번째부터 10종목을 가져오게끔 짜야 할 것 이다.
	var reqStartPost = curPage*10;
	poolSql.pool.on('error',(err,client)=>{
		console.error('Unexpected err on idle clients',err);
		process.exit(-1);
	});
	poolSql.pool.connect()
		.then(client =>{
			return client.query('select bcodenum as num, bcodecategory1 as category1, bcodecategory2 as category2, bcodetitle as title, bcodedate as date from boardcode order by num desc offset $1 limit 10;',[reqStartPost])
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
//		client.query('select * from boardcode',(err,res)=>{
//			done();
//			if(err){
//				console.log(err.stack);
//			}else{
//				console.log(res.rows);
//			}
//		})
//	})
module.exports.callSelectedPost = (reqBoardNum,cb)=>{
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
module.exports.pickPrevNextPost = (reqBoardNum,cb)=>{
	poolSql.pool.on('error',(err,client)=>{
		console.error('Unexpected err on idle clients',err);
		process.exit(-1);
	});
	poolSql.pool.connect((err,client,done)=>{
		if(err) throw err;
		client.query('select * from(select bcodenum as num, bcodetitle as title, lag(bcodenum) over (order by bcodenum desc rows between current row and unbounded following) as prev,lead(bcodenum) over (order by bcodenum desc rows between current row and unbounded following) as nextt from boardcode)x where $1 in(prev,nextt);',[reqBoardNum],(err,res)=>{
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
function calculatecodeSize(cb){
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
					//client.release();
					console.log(e);
					cb('[codeModule][innerF.calculatecodeSize]err on sql',null);
				})
		})
}

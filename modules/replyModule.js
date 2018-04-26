const poolSql = require('./poolsql');
module.exports.callReplyFromSelectedBoard = (reqBoardType,reqBoardNum,cb)=>{
	//선택된 게시판에서 덧글들을 불러오는 외부묘듈(err,resultJson)
	poolSql.pool.on('error',(err,client)=>{
		console.error('Unexpected err on idle clients',err);
		process.exit(-1);
	});
	poolSql.pool.connect((err,client,done)=>{
		var blogType;
		if(err) throw err;
		if(reqBoardType==='blog'){
			blogType = 'replyblog';
		}else if(reqBoardType === 'code'){
			blogType = 'replycode';
		}else{
			cb('wrong reqBoardType',null);
			return;
		}
		client.query('select r'+reqBoardType+'num as rnum, r'+reqBoardType+'name as rname, r'+reqBoardType+'context as rcontext, r'+reqBoardType+'date as rdate from '+blogType+' where r'+reqBoardType+'parent = $1 ;',[reqBoardNum],(err,res)=>{
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

module.exports.appReplyFromSelectedBoard = (reqArray, cb)=>{
	//선택된 게시판에 댓글을 입력(err,resultNum)
	poolSql.pool.on('error',(err,client)=>{
		console.error('Unexpected err on idle clients',err);
		process.exit(-1);
	});
	poolSql.pool.connect((err,client,done)=>{
		if(err) throw err;
		let tableName;
		switch(reqArray.postType){
			case 'blog':{
				tableName = 'replyblog';
				break;
			}
			case 'code':{
				tableName = 'replycode';
				break;
			}
			default:{
				cb('wrong type name',null);
				return;
			}
		}
		client.query('insert into '+tableName+' (r'+reqArray.postType+'parent,r'+reqArray.postType+'date,r'+reqArray.postType+'name,r'+reqArray.postType+'mail,r'+reqArray.postType+'password,r'+reqArray.postType+'context) values( $1 ,Now() AT TIME ZONE \'Asia/Seoul\',$2,$3,$4,$5)  returning r'+reqArray.postType+'parent as num;',[reqArray.postNum,reqArray.name,reqArray.mail,reqArray.pw,reqArray.context],(err,res)=>{
			done();
			if(err || !res.rows[0] ){
				console.log(err.stack);
				cb(err,null);
			}else{
				if(!res.rows[0].num == reqArray.postNum){
					cb('failed to insert without error',null);
				}
				cb(null,res.rows[0]);
			}
		});
	});
}

module.exports.deleteReplySelected = (reqArray, cb)=>{
	//선택된 댓글을 삭제하는 외부함수(err,result)
	poolSql.pool.on('error',(err,client)=>{
		console.error('Unexpected err on idle clients',err);
		process.exit(-1);
	});
	
	poolSql.pool.connect((err,client,done)=>{
		if(err) throw err;
		var tableName;
		switch(reqArray.postType){
			case 'blog':{
				tableName = 'replyblog';
				break;
			}
			case 'code':{
				tableName = 'replycode';
				break;
			}
			default:{
				cb('wrong type name',null);
				return;
			}
		}
		client.query('DELETE FROM '+tableName+' WHERE r'+reqArray.postType+'num=$1 and r'+reqArray.postType+'password = $2 returning *;',[reqArray.rNum,reqArray.rInPwd],(err,res)=>{
			done();
			if(err){
				console.log(err);
				cb(err,null);
			}else if(!res.rows[0]){
				cb('wrong pw',null);
			}else{
				cb(null,res.rows[0]);
			}
		});
	});
}

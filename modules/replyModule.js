const {Pool} = require('pg');
const pool = new Pool({
    user : '',
    host : '',
    database : '',
    password : '',
    port : ''
});
module.exports.callReplyFromSelectedBoard = (reqBoardNum,cb)=>{
	pool.on('error',(err,client)=>{
		console.error('Unexpected err on idle clients',err);
		process.exit(-1);
	});
	pool.connect((err,client,done)=>{
		if(err) throw err;
		client.query('select rblognum as rnum, rblogname as rname, rblogcontext as rcontext, rblogdate as rdate from replyblog where rblogparent = $1 ;',[reqBoardNum],(err,res)=>{
			done();
			if(err){
				console.log(err.stack);
				cb(err,null);
			}else{
				//console.log(res.rows);
				cb(null,res.rows);
			}
		});
	});
}
module.exports.appReplyFromSelectedBoard = (reqArray, cb)=>{
	pool.on('error',(err,client)=>{
		console.error('Unexpected err on idle clients',err);
		process.exit(-1);
	});
	pool.connect((err,client,done)=>{
		if(err) throw err;
		client.query('insert into replyblog (rblogparent,rblogdate,rblogname,rblogmail,rblogpassword,rblogcontext) values( $1 ,Now(),$2,$3,$4,$5)  returning rblogparent as num;',[reqArray.postNum,reqArray.name,reqArray.mail,reqArray.pw,reqArray.context],(err,res)=>{
			done();
			if(err || !res.rows[0] ){
				console.log(err.stack);
				cb(err,null);
			}else{
				if(!res.rows[0].num == reqArray.postNum){
					console.log(res.rows[0].num+'  :  '+reqArray.postNum);
					console.log(res.rows[0].num !== reqArray.postNum);
					cb('failed to insert without error',null);
				}
				console.log(res.rows);
				cb(null,res.rows[0]);
			}
		});
	});
}
module.exports.deleteReplySelected = (reqArray, cb)=>{
	pool.on('error',(err,client)=>{
		console.error('Unexpected err on idle clients',err);
		process.exit(-1);
	});
	pool.connect((err,client,done)=>{
		if(err) throw err;
		client.query('DELETE FROM public.replyblog WHERE rblognum=$1 and rblogpassword = $2 returning *;',[reqArray.rNum,reqArray.rInPwd],(err,res)=>{
			done();
			if(err){
				console.log(err);
				cb(err,null);
			}else if(!res.rows[0]){
				console.log('wrong pw');
				cb('wrong pw',null);
			}else{
				cb(null,res.rows[0]);
			}
		});
	});
}

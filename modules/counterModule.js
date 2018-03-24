var poolSql = require('./poolsql');
module.exports.callCount = (cb)=>{
    poolSql.pool.on('error',(err,client)=>{
		console.error('Unexpected err on idle clients',err);
		process.exit(-1);
	});
	poolSql.pool.connect((err,client,done)=>{
		if(err) throw err;
		client.query('select visitcount as count from visitcounter;',(err,res)=>{
			done();
			if(err){
               cb(err,null);
			}else{
                var totalCount = 0;
				for(var i = 0 ; i < res.rows.length ; i++){
                    totalCount+= res.rows[i].count;
                }
                cb(null,totalCount);
			}
		});
	});
}
module.exports.countIncrease = (date,cb)=>{
    poolSql.pool.on('error',(err,client)=>{
		console.error('Unexpected err on idle clients',err);
		process.exit(-1);
	});
	poolSql.pool.connect((err,client,done)=>{
		if(err) throw err;
		client.query('select * from visitcounter where visitdate = $1;',[date],(err,res)=>{
			done();
			if(err){
                //console.log(err.stack);
                createDateRow(data,(err,result)=>{
                    if(err){
                        cb(err);
                    }else{
                        console.log('new table row createded, date is :'+result);
                        cb(null);
                    }
                })
			}else{
				increaseNum(date,(err,result)=>{
                    if(err){
                        cb('[countIncrease][increaseNum]sql error : '+err);
                    }else{
                        cb(null);
                    }
                })
			}
		});
	});
}
function increaseNum(date,cb){
    poolSql.pool.on('error',(err,client)=>{
		console.error('Unexpected err on idle clients',err);
		process.exit(-1);
	});
	poolSql.pool.connect((err,client,done)=>{
		if(err) throw err;
		client.query('UPDATE public.visitcounter SET  visitcount=visitcount + 1 WHERE visitdate = $1 returning visitdate;',[date],(err,res)=>{
			done();
			if(err){
				console.log(err.stack);
				cb(err,null);
			}else{
                cb(null,res.visitdate);
			}
		});
	});
}
function createDateRow(data,cb){
    poolSql.pool.on('error',(err,client)=>{
		console.error('Unexpected err on idle clients',err);
		process.exit(-1);
	});
	poolSql.pool.connect((err,client,done)=>{
		if(err) throw err;
		client.query('insert into visitcounter values(current_date) returning current_data;',(err,res)=>{
			done();
			if(err){
				console.log(err.stack);
				cb(err,null);
			}else{
                console.log(res.date+'|'+date);
                if(res.date === data){
                    cb(null,res.data);
                }else{
                    cb('[counterModule][createDateCol]sql date and server date is missmatch',null);
                }
			}
		});
	});
}

const poolSql = require('./poolsql');
const fs = require('fs');

module.exports.ipPerVisitChecker = (req,res,next) => {
    console.log('ip체크 함수 도달. 한 요청에 한번씩 돌아야되는데');
    var remoteIp = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress || 
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
        remoteIp = remoteIp.split(':').slice(-1)[0];
    if(remoteIp == '1')
        remoteIp = 'localhost';
    
    let today = new Date();
    today = today.setHours(0,0,0,0);

    if(!req.session.lastVisit | req.session.lastVisit != today){
        req.session.lastVisit = today;
        writeLog('[app][writeLog][INFO]['+remoteIp+']['+new Date()+']count plus\n',(err)=>{
            if(err){
                console.log('[app][writeLog][ERR]count plus :'+err);
            }
        });
    }else{
        writeLog('[app][writeLog][INFO]['+remoteIp+']['+new Date()+']access\n',(err)=>{
            if(err){
                console.log('[app][writeLog][ERR]write err :'+err);
            }
        });
        let todayDate = new Date().getFullYear()+'-'+((new Date().getMonth())+1)+'-'+new Date().getDate();
        this.countIncrease(todayDate,(err)=>{
            if(err){
                writeLog('[INFO]['+remoteIp+']['+new Date()+']access+logged\n',(err)=>{
                    if(err){
                        console.log('[app][writeLog]write err :'+err);
                    }
                });
            }else{
                writeLog('[ERR]['+remoteIp+']['+new Date()+']COUNTING VISITOR DB FAILED WITH ERR::\n::'+err,(err)=>{
                    if(err){
                        console.log('[app][writeLog]write err :'+err);
                    }
                });
            }
        })
    } 
    return next();
}

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
			if(err || !res.rows[0]){
                console.log(err);
                createDateRow(date,(err,result)=>{
                    if(err){
						console.log(err.stack);
                        cb(err);
                    }else{
                        console.log('new table row createded, date is :'+result);
                        cb(null);
                    }
                })
			}else{
				increaseNum(date,(err,result)=>{
                    if(err){
						console.log(err.stack);
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
		client.query('insert into visitcounter values(now() AT TIME ZONE \'Asia/Seoul\') returning now() AT TIME ZONE \'Asia/Seoul\' as curdate;',(err,res)=>{
			done();
			if(err){
				console.log(err.stack);
				cb(err,null);
			}else{
                cb(null,res.rows[0].curdate);
                
			}
		});
	});
}
function writeLog(logStr,cb){
    fs.appendFile('log.txt',logStr,(err)=>{
        if(err){
            cb(err);
        }else{
            cb(null);
        }
    });
}
const poolSql = require('./poolsql');
const fs = require('fs');

module.exports.ipPerVisitChecker = (req,res,next) => {
    /* 접속한 ip가 오늘 재 방문하였는지 여부를 파악하며, 첫 방문인 경우, db의 방문자 집계를 1 상승시킨다.
    이후, 이미 방문했음을 표시시킨다.*/
    let remoteIp = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress || 
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
        remoteIp = remoteIp.split(':').slice(-1)[0];
    if(remoteIp == '1') //local접속시에는 localhost로 로그에 찍힌다.
        remoteIp = 'localhost';
    
    let today = new Date();
    today = today.setHours(0,0,0,0); //date 이후 값, hour minuate, sec, millsec 는 항상 0으로 만든다. 중복 방문을 방지한다.

    if(!req.session.lastVisit | req.session.lastVisit != today){ //첫 방문시
        req.session.lastVisit = today;
        writeLog('[app][writeLog][INFO]['+remoteIp+']['+new Date()+']count plus\n',(err)=>{
            if(err){
                console.log('[app][writeLog][ERR]count plus :'+err);
            }
        });
    }else{  //이미 오늘 방문기록이 존재할때
        writeLog('[app][writeLog][INFO]['+remoteIp+']['+new Date()+']access\n',(err)=>{
            if(err){
                console.log('[app][writeLog][ERR]write err :'+err);
            }
        });
        let todayDate = new Date().getFullYear()+'-'+((new Date().getMonth())+1)+'-'+new Date().getDate(); //로그용 현제시간.
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

module.exports.callCount = (cb)=>{  //방문자 수를 확인하는 외부함수. page의 전체 방문자 수를 이 함수를 통해 통계낸다.
    poolSql.pool.on('error',(err,client)=>{
		console.error('Unexpected err on idle clients',err);
		process.exit(-1);
	});
	poolSql.pool.connect((err,client,done)=>{
		if(err) cb(err,null);
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
module.exports.countIncrease = (date,cb)=>{ //현제 날짜의 총 방문자 수를 표시한다. 현제는 에러 로그용으로만 쓰인다.
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
function increaseNum(date,cb){  //선택한 날짜의 방문자 수를 1 증가 시키는 외부함수.
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
function createDateRow(data,cb){    //오늘 기준의 날짜 row가 없을떄 작동되어, 새 row를 만든다.
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
function writeLog(logStr,cb){   //기본 로그 작성용. 추후 업데이트 목표.
    fs.appendFile('log.txt',logStr,(err)=>{
        if(err){
            cb(err);
        }else{
            cb(null);
        }
    });
}
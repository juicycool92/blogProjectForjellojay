const poolSql = require('./poolsql');
const bcrypt = require('bcrypt');
const saltRounds = 10;						//값을 적당히 정해서 fix할것.

module.exports.findOne = (reqId,cb)=>{		//id 존재유무 검사 함수(요청id)
    poolSql.pool.on('error',(err,client)=>{
		console.error('Unexpected err on idle clients',err);
		process.exit(-1);
	});
	
	poolSql.pool.connect((err,client,done)=>{
		if(err) throw err;
		client.query('Select userid from account where userid=$1;',[reqId],(err,res)=>{
			done();
			if(err){	//cb(err,가입가능한가,결과값);
                cb('[User.js][findOne][ERR]sending query failed, errlog :'+err,null,false);
			}else if(res.rows.length===0 || !res.rows){
                cb('[User.js][findOne][ERR]no id found',null,true);
            }else{
                cb(null,res.rows[0],false);
            }
		});
	});
};
module.exports.comparePassword = (reqId,reqPw,cb)=>{ // 로그인시 비밀번호 대조(요청id,요청pw)
    poolSql.pool.on('error',(err,client)=>{
		console.error('Unexpected err on idle clients',err);
		process.exit(-1);
	});
	
	poolSql.pool.connect((err,client,done)=>{
		if(err) throw err;
		client.query('Select userid, usersalt, userpw from account where userid=$1;',[reqId],(err,res)=>{
			done();
			if(err){
                cb('[User.js][comprePassword][ERR]sending query failed, errlog :'+err,null);
			}else{
				hashCompare(reqPw,res.rows[0].usersalt,res.rows[0].userpw,(err)=>{
					if(err){
						cb(err,null);
					}else{
						cb(null,true);
					}
				});
			}
		});
	});
};
module.exports.registAccount = (req,cb)=>{				//회원가입(요청)
    bcrypt.genSalt(saltRounds,(err,saltt)=>{			//솔트 생성
        if(err){										//솔트 생성 실패
            cb('[User.js][registAccount][ERR]generate salt failed! log : '+err,null);
        }
        bcrypt.hash(req.reqPw,saltt,(err,genhash)=>{	//해쉬 생성
            if(err){
                cb('[User.js][registAccount][ERR]password hashing failed! log : '+err,null);
            }else{										//해쉬 생성 성공
                registAccount(req,genhash,saltt,(err,result)=>{
                    if(err){
                        cb(err,null);
                    }else if(!result || req.reqId !== result){
                        cb('[User.js][registAccount][ERR][CRITICAL]returnning nothing, or req id mismatch!!',null);
                    }else{
                        cb(null,result);
                    }
                });
            }
        });
    });
    
};
function registAccount (req,hashpw,salt,cb){	//회원가입 내부함수(요청,해쉬비번,솔트)
    poolSql.pool.on('error',(err,client)=>{
		console.error('Unexpected err on idle clients',err);
		process.exit(-1);
	});
	
	poolSql.pool.connect((err,client,done)=>{
		if(err) throw err;
		client.query('insert into account values($1,$2,$3,$4,$5) returning userid;',[req.reqId,hashpw,req.reqName,req.reqMail,salt],(err,res)=>{
			done();
			if(err){
                cb('[User.js][registAccount][innerF][ERR]SQL failed, logs : '+err,null);
			}else if(!res.rows || res.rows.length === 0){
                cb('[User.js][registAccount][innerF][ERR]returnning nothing, it supposed to returning userid.',null);
			}else{								//가입 성공
                cb(null,res.rows[0].userid);
            }
		});
	});
}
function hashCompare(reqPw,salt,hash,cb){		//해시 비교 내부함수(입력한비번,솔트,실제해쉬값)
    bcrypt.hash(reqPw,salt,(err,actualHash)=>{	//입력한 비번과 솔트로 해싱코드 출력
        if(err){								//해슁실패
            cb('[User.js][hashCompare][innerF][ERR]password hashing failed! log : '+err);
        }else{
			if(actualHash === hash){			//대조성공
				cb(null);	
			}else{								//대조실패
				cb('[User.js][hashCompare][InnerF][ERR]password mismatch');
			}	
        }
    });
}
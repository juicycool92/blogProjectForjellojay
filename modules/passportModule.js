var LocalStrategy = require('passport-local').Strategy; //로컬 전략
module.exports = (passport,User)=>{     //req.logIn 시 실행되는 함수
    passport.serializeUser((user,done)=>{//called when strategy is successful
        done(null,user);//var user will be used first attribute for deserializeUser
    });
    passport.deserializeUser((id,done)=>{   //req.user 시 실행되는 함수.
        User.findOne(id.userid,(findErr,users)=>{
            done(null,users);    //var user will be send as req.user
        });
    });

    passport.use('local',new LocalStrategy({ // start of LocalStrategy
        usernameField: 'reqId',
        passwordField: 'reqPw',
        session: true,
        passReqCallback: true
        },(reqId,reqPw,done)=>{
            User.findOne(reqId,(findErr,user)=>{
                if(findErr){    //server side error
                    return done(findErr,null,{message:'Server connection failed!'});   
                }
                if(!user){      //account is not exist error, returning with msg
                    return done(null,null,{message:'ID not exist'});
                }
                return User.comparePassword(reqId,reqPw,(passErr,isMatch)=>{
                    if(passErr && !isMatch){
                        return done(passErr,null,{message:'ID not exist or Server connection failed'});
                    }else if(!passErr && isMatch===true){
                        return done(null,user,null);
                    }else if(!passErr&& isMatch===false){
                        return done(null,null,{message:'PW mismatch'});
                    }else{
                        return done('[Password.js][inUser.comparePassword][ERR]unsolved err',null,{message:'Server connection failed!'});
                    }
                });
            });
        }
    ));
}
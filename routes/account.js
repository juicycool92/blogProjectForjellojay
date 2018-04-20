module.exports = (app,jsonCreator,User,passport)=>{
    app.post('/Signin',(req,res)=>{
        
        User.findOne(req.body.reqId,(err,user,isNull)=>{
            if(isNull==false){
                res.status(400).json({message:"Givin ID is already Exist"});
                return;
            }else{
                User.registAccount(req.body,(err,result)=>{
                    if(err){
                        console.log(err);
                    }else if(!result){
                        console.log('[account.js][/Signin][ERR]err without log!');
                    }else{
                        res.json({"userId":result});
                        res.send();
                        return;
                    }
                    res.status(400).json({message:"Unexpected Error"});
                    return;
                });
            }
        });
    });

    app.post('/Login-local',(req,res,next)=>{
        console.log('req상태??'+req.isAuthenticated());
        passport.authenticate('local', {session: true},(err,user,info)=>{
            if(err || !user){//unhandled에러res.status(400).json(info);
                if(!info){
                    res.status(400).json({message:"Id or Pw mismatch!"});
                }else{
                    res.status(400).json({message:"Unexpected Error"});
                }
            }else{
                req.logIn(user,(err)=>{
                    if(err)
                        console.log('에러 '+err);
                    else
                        return res.status(200).json({message:req.user.userid});
                });
                
            }
            return;
            
        })(req,res,next);

    });

};
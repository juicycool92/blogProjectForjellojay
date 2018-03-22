module.exports = (app,blogModule,codeModule,jsonCreator)=>
{
    app.get('/readPost',(req,res)=>
	{
        var reqBoardNum = req.query.reqBoardNum;
        var reqBoardType = req.query.reqBoardType;
        switch(reqBoardType){
            case 'blog' : {
                getListFromBlog(reqBoardNum,(err,jsonResult)=>{
                    if(err){
                        console.log('[blog.js][/readPost]err at getListfromBlog'+err);
                    }else{
                        res.render('../views/blogPost.ejs',JSON.parse(jsonResult));
                        return;
                    }
                });
                break;
            }
            case 'code' : {
                getListFromCode(reqBoardNum,(err,jsonResult)=>{
                    if(err){
                        console.log('[blog.js][/readPost]err at getListFromCode'+err);
                    }else{
                        res.render('../views/blogPost.ejs',JSON.parse(jsonResult));
                        return;
                    }
                });
                break;
            }
            default : {}
        }
    });
    function getListFromBlog(reqBoardNum,cb){
        blogModule.callSelectedPost(reqBoardNum,(err,result)=>{
			if(err){
				cb(err,null);
			}else{
				blogModule.pickPrevNextPost(reqBoardNum,(err2,result2)=>{
					if(err2){
                        cb(err2,null);					
                    }else{
						jsonCreator.writeSinglePostandPN(result,result2,(err3,jsonResult)=>{
							if(err3){
								cb(err3,null);
							}else{
								cb(null,jsonResult);
							}
						});
					}
				});
			}
		})
    }
    function getListFromCode(reqBoardNum,cb){
        codeModule.callSelectedPost(reqBoardNum,(err,result)=>{
			if(err){
				cb(err,null);
			}else{
				blogModule.pickPrevNextPost(reqBoardNum,(err2,result2)=>{
					if(err2){
                        cb(err2,null);					
                    }else{
						jsonCreator.writeSinglePostandPN(result,result2,(err3,jsonResult)=>{
							if(err3){
								cb(err3,null);
							}else{
								cb(null,jsonResult);
							}
						});
					}
				});
			}
		})
    }
}
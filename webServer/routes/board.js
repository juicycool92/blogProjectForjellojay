module.exports = (app,blogModule,codeModule,jsonCreator)=>
{
    const getPostFromBlog =(reqBoardNum,reqBoardType,cb)=>{
        //Blog게시글 내용 출력
        blogModule.callSelectedPost(reqBoardNum,(err,result)=>{
			if(err){
				cb(err,null);
			}else{
				blogModule.pickPrevNextPost(reqBoardNum,(err2,result2)=>{
					if(err2){
                        cb(err2,null);					
                    }else{
						jsonCreator.writeSinglePostandPN(result,result2,reqBoardType,(err3,jsonResult)=>{
							if(err3){
								cb(err3,null);
							}else{
                                blogModule.countSelectPost(reqBoardNum);
								cb(null,jsonResult);
							}
						});
					}
				});
			}
        })     
    }

    const getPostFromCode = (reqBoardNum,reqBoardType,cb)=>{
        //Code게시글 내용 출력
        codeModule.callSelectedPost(reqBoardNum,(err,result)=>{
			if(err){
				cb(err,null);
			}else{
				codeModule.pickPrevNextPost(reqBoardNum,(err2,result2)=>{
					if(err2){
                        cb(err2,null);					
                    }else{
						jsonCreator.writeSinglePostandPN(result,result2,reqBoardType,(err3,jsonResult)=>{
							if(err3){
								cb(err3,null);
							}else{
                                codeModule.countSelectPost(reqBoardNum);
								cb(null,jsonResult);
							}
						});
					}
				});
			}
		})
    }

    app.get('/readPost',(req,res)=>
	{   //게시글 읽기 페이지
        const reqBoardNum = req.query.reqBoardNum;
        const reqBoardType = req.query.reqBoardType;
        res.render('../views/blogPost.ejs',{"reqBoardNum":reqBoardNum,"reqBoardType":reqBoardType});
    });
    app.post('/readPost',(req,res)=>{   //게시글 읽기 페이지의 데이터 
        const reqBoardNum = req.body.reqBoardNum;
        const reqBoardType = req.body.reqBoardType;
        
        switch(reqBoardType){
            case 'blog' : {
                getPostFromBlog(reqBoardNum,reqBoardType,(err,jsonResult)=>{
                    if(err){
                        console.log('[blog.js][/readPost]err at getListfromBlog'+err);
                    }else{
                        res.json(JSON.parse(jsonResult));
                        return;
                    }
                });
                break;
            }
            case 'code' : {
                getPostFromCode(reqBoardNum,reqBoardType,(err,jsonResult)=>{
                    if(err){
                        console.log('[blog.js][/readPost]err at getListFromCode'+err);
                    }else{
                        res.json(JSON.parse(jsonResult));
                        return;
                    }
                });
                break;
            }
            default : {}
            res.send();
        }
    });
}
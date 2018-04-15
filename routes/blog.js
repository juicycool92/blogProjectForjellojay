module.exports = (app,blogModule,jsonCreator)=>
{
	console.log('incomming req on blog ////////////////////');
	app.get('/bloglist',(req,res)=>
	{
		console.log('bloglist');
		let reqPage;
		if(!req.query.page || req.query.page<0)
			reqPage=0;
		else 
			reqPage=req.query.page;
		console.log('/bloglist?page='+reqPage);	
		blogModule.callBlogAtPageNum(reqPage,(err,result,boardSize)=>{
			if(err){
				console.log(err);
				res.render('../views/blogList');
			}else{
				jsonCreator.writeBlogList(result,reqPage,boardSize,(err2,jsonResult)=>{
					if(err2){
						console.log('[blog][/bloglist]error at jsonCreator cb'+err2);
						res.status(204);
						res.send();
					}else{
						console.log(jsonResult);
						res.render('../views/blogList',JSON.parse(jsonResult));
					}	
				})
			}
		});
	});
	// app.get('/postblog',(req,res)=>
	// {
	// 	var reqBoardNum = req.query.reqBoardNum;
	// 	blogModule.callSelectedPost(reqBoardNum,(err,result)=>{
	// 		if(err){
	// 			console.log('[blog.js]loading failed at /postblog err)'+err);
	// 			res.status(204);
	// 			res.send();
	// 		}else{
	// 			blogModule.pickPrevNextPost(reqBoardNum,(err2,result2)=>{
	// 				if(err2){
	// 					console.log('[blog.js]loading failed at /postblog err)'+err2);
	// 					res.status(204);
	// 					res.send();
	// 				}else{
	// 					jsonCreator.writeSinglePostandPN(result,result2,(err3,jsonResult)=>{
	// 						if(err3){
	// 							console.log('[blog.js]loading failed at /postblog err)'+err3);
	// 							res.status(204);
	// 							res.send();
	// 						}else{
	// 							console.log('[D1]'+jsonResult.toString());
	// 							console.log('[D2]'+JSON.stringify(jsonResult));
	// 							res.render('../views/blogPost.ejs',JSON.parse(jsonResult));
	// 						}
	// 					});
	// 				}
	// 			});
	// 		}
	// 	})
	// });
}
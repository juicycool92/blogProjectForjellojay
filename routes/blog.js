module.exports = (app,blogModule,jsonCreator)=>
{
	app.get('/bloglist',(req,res)=>
	{	//블로그 게시판 리스트
		res.render('../views/blogList');
	});
	app.post('/bloglist',(req,res)=>
	{	//블로그 게시판 리스트의 내용
		let reqPage;
		if(!req.body.page || req.body.page<0)
			reqPage=0;
		else 
			reqPage=req.body.page;	
		blogModule.callBlogAtPageNum(reqPage,(err,result,boardSize)=>{
			if(err){
				console.log(err);
				res.status(204);
				res.send();
			}else{
				jsonCreator.writeBlogList(result,reqPage,boardSize,(err2,jsonResult)=>{
					if(err2){
						console.log('[blog][/bloglist]error at jsonCreator cb'+err2);
						res.status(204);
					}else{
						res.json(JSON.parse(jsonResult));
					}	
					res.send();
				})
			}
		});
	});
}
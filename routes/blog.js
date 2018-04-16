module.exports = (app,blogModule,jsonCreator)=>
{
	console.log('incomming req on blog ////////////////////');
	app.get('/bloglist',(req,res)=>
	{
		res.render('../views/blogList');
	});
	app.post('/bloglist',(req,res)=>
	{
		let reqPage;
		if(!req.body.page || req.body.page<0)
			reqPage=0;
		else 
			reqPage=req.body.page;
		console.log('/bloglist?page='+reqPage);	
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
						console.log(jsonResult);
						res.json(JSON.parse(jsonResult));
					}	
					res.send();
				})
			}
		});
	});
}
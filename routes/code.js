module.exports = (app,codeModule,jsonCreator)=>
{
	console.log('incomming req on code ////////////////////');
	app.get('/codelist',(req,res)=>
	{
		res.render('../views/codeList');
	});
	app.post('/codelist',(req,res)=>
	{
		let reqPage;
		if(!req.query.page || req.query.page<0)
			reqPage=0;
		else 
			reqPage=req.query.page;
		console.log('/codelist?page='+reqPage);	
		codeModule.callcodeAtPageNum(reqPage,(err,result,boardSize)=>{
			if(err){
				console.log(err);
				res.status(204);
			}else{
				jsonCreator.writeCodeList(result,reqPage,boardSize,(err2,jsonResult)=>{
					if(err2){
                        console.log('[code][/codelist]error at jsonCreator cb : '+err2);
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
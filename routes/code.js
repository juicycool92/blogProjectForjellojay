module.exports = (app,codeModule,jsonCreator)=>
{
	app.get('/codelist',(req,res)=>
	{	//codeList페이지 로드
		res.render('../views/codeList');
	});
	app.post('/codelist',(req,res)=>
	{	//codeList 데이터
		let reqPage;
		if(!req.body.page || req.body.page<0)
			reqPage=0;
		else 
			reqPage=req.body.page;
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
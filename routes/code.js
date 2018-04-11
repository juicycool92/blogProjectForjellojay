module.exports = (app,codeModule,jsonCreator)=>
{
	console.log('incomming req on code ////////////////////');
	app.get('/codelist',(req,res)=>
	{
		console.log('codelist');
		var reqPage;
		if(!req.query.page || req.query.page<0)
			reqPage=0;
		else 
			reqPage=req.query.page;
		console.log('/codelist?page='+reqPage);	
		codeModule.callcodeAtPageNum(reqPage,(err,result,boardSize)=>{
			if(err){
				console.log(err);
				res.render('../views/codeList');
			}else{
				jsonCreator.writeCodeList(result,reqPage,boardSize,(err2,jsonResult)=>{
					if(err2){
                        console.log('[code][/codelist]error at jsonCreator cb : '+err2);
                        	
					}else{
						console.log(jsonResult);
						res.render('../views/codeList',JSON.parse(jsonResult));
					}	
				})
			}
		});
	});
	// app.get('/postcode',(req,res)=>
	// {
	// 	var reqBoardNum = req.query.reqBoardNum;
	// 	codeModule.callSelectedPost(reqBoardNum,(err,result)=>{
	// 		if(err){
	// 			console.log('[code.js]loading failed at /postcode err)'+err);
	// 			res.status(204);
	// 			res.send();
	// 		}else{
	// 			codeModule.pickPrevNextPost(reqBoardNum,(err2,result2)=>{
	// 				if(err2){
	// 					console.log('[code.js]loading failed at /postcode err)'+err2);
	// 					res.status(204);
	// 					res.send();
	// 				}else{
	// 					jsonCreator.writeSinglePostandPN(result,result2,(err3,jsonResult)=>{
	// 						if(err3){
	// 							console.log('[code.js]loading failed at /postcode err)'+err3);
	// 							res.status(204);
	// 							res.send();
	// 						}else{
	// 							console.log('[D1]'+jsonResult.toString());
	// 							console.log('[D2]'+JSON.stringify(jsonResult));
	// 							res.render('../views/post.ejs',JSON.parse(jsonResult));
	// 						}
	// 					});
	// 				}
	// 			});
	// 		}
	// 	})
		 
	// });
}
module.exports = (app,replyModule,jsonCreator)=>{
	app.get('/loadReply',(req,res)=>
	{	//댓글 호출
		const reqBoardType = req.query.reqBoardType;//blog ==0 ; code==1
		const reqBoard = req.query.reqBoardNum;
		if(!reqBoardType){
			console.log('[reply.js][/loadReply]err request boardType is null');
			res.status(204);
		}
		if(!reqBoard){
			console.log('[reply.js][/loadReply]err request num is null');
			res.status(204);
		}else{
			replyModule.callReplyFromSelectedBoard(reqBoardType,reqBoard,(err,result)=>{
				if(err){
					console.log('[reply.js][/loadReply]err sql err :'+err);
				}else{
					jsonCreator.writeAllReplyFromSelectedBoard(result,(err2,jsonString)=>{
						if(err2){
							console.log('[reply.js][/loadReply]err json :'+err2);
						}else{
							res.json(JSON.parse(jsonString));
						}
					})
				}
			})
		}
	}); 

	app.post('/addReply',(req,res)=>{
		//댓글 추가
		replyModule.appReplyFromSelectedBoard(req.body,(err,result)=>{
			if(err){
				console.log('[reply.js][/addReply]err :'+err);
				res.status(400);
				res.send();
			}else{
				replyModule.callReplyFromSelectedBoard(req.body.postType,req.body.postNum,(err2,result)=>{
					if(err2){
						console.log('[reply.js][/addReply]err :'+err2);
						res.status(400);
						res.send();
					}else{
						jsonCreator.writeAllReplyFromSelectedBoard(result,(err3,jsonString)=>{
							if(err3){
								console.log('[reply.js][/loadReply]err json :'+err3);
							}else{
								res.json(JSON.parse(jsonString));
							}
						});
					}
				});
			}
		});
	});

	app.post('/deleteReply',(req,res)=>
	{	//선택된 댓글 삭제
		replyModule.deleteReplySelected(req.body,(err,result)=>{
			if(err){
				if(err==='wrong pw'){
					res.status(403);
					res.send();
				}else{
					res.status(401);
					res.send();
				}
			}else{
				replyModule.callReplyFromSelectedBoard(req.body.postType,req.body.postNum,(err2,result)=>{
					if(err2){
						console.log('[reply.js][/addReply]err :'+err2);
						res.status(400);
						res.send();
					}else{
						jsonCreator.writeAllReplyFromSelectedBoard(result,(err3,jsonString)=>{
							if(err3){
								console.log('[reply.js][/loadReply]err json :'+err3);
							}else{
								res.json(jsonString).send();
								//res.send();
							}
						});
					}
				});
			}
		});
	});
}
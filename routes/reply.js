module.exports = (app,replyModule,jsonCreator)=>{
	app.get('/loadReply',(req,res)=>{
		var reqBoardType = req.query.reqBoardType;//blog ==0 ; code==1
		console.log('boardType'+reqBoardType);
		var reqBoard = req.query.reqBoardNum;
		console.log('[D]Helo'+reqBoard);
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
							console.log(jsonString);
							res.json(jsonString);
						}
					})
				}
			})
		}
	}); 
	app.post('/addReply',(req,res)=>{
		replyModule.appReplyFromSelectedBoard(req.body,(err,result)=>{
			if(err){
				console.log('[reply.js][/addReply]err :'+err);
				console.log('entering err');
				res.status(400);
				res.send();
			}else{
				replyModule.callReplyFromSelectedBoard(req.body.postType,req.body.postNum,(err2,result)=>{
					if(err2){
						console.log('[reply.js][/addReply]err :'+err2);
						console.log('entering err');
						res.status(400);
						res.send();
					}else{
						jsonCreator.writeAllReplyFromSelectedBoard(result,(err3,jsonString)=>{
							if(err3){
								console.log('[reply.js][/loadReply]err json :'+err3);
							}else{
								console.log(jsonString);
								res.json(jsonString);
							}
						});
					}
				});
			}
		});
	});
	app.post('/deleteReply',(req,res)=>{
		console.log('hey'+req.body.postNum);
		replyModule.deleteReplySelected(req.body,(err,result)=>{
			if(err){
				
				if(err==='wrong pw'){
					console.log(err);
					res.status(403);
					res.send();
				}else{
					console.log(err);
					res.status(401);
					res.send();
				}
			}else{
				replyModule.callReplyFromSelectedBoard(req.body.postType,req.body.postNum,(err2,result)=>{
					if(err2){
						console.log('[reply.js][/addReply]err :'+err2);
						console.log('entering err');
						res.status(400);
						res.send();
					}else{
						jsonCreator.writeAllReplyFromSelectedBoard(result,(err3,jsonString)=>{
							if(err3){
								console.log('[reply.js][/loadReply]err json :'+err3);
							}else{
								//console.log(jsonString);
								res.json(jsonString);
								res.send();
							}
						});
					}
				});
			}
		});
	});
}
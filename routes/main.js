module.exports = (app,counterModule,mainModule,jsonCreator,passport)=>
{
	app.get('/',(req,res)=>{
	    res.render('index');
	});
	app.post('/',(req,res)=>{
		mainModule.getNewAndHot(2,(err,rawData)=>{
			if(err){
				console.log('[/]'+err);
				res.status(204);
			}else{
				jsonCreator.writeNewAndHotPost(rawData,(err,jsonString)=>{
					if(err){
						console.log('[/][jsonCreator][writeNewAndHotPost][ERR]'+err);
						res.status(204);
					}else{
						console.log('req상태'+req.isAuthenticated());
						console.log('reqUser:'+req.user);
						res.json(JSON.parse(jsonString));
						return;
					}
				});
			}
			res.send();
		});
	});

	app.get('/about',(req,res)=>
	{
		console.log('/about');
		res.render('about');
	});

	app.get('/visitCounter',counterModule.ipPerVisitChecker,(req,res)=>
	{	//방문자 표시겸(임시?) 조회수 업데이트 함수도 작동한다.
		counterModule.callCount((err,count)=>{
			if(err){
				console.log('[main.js][/visitCounter]err'+err);
				res.status(204);
			}else{
				if(req.isAuthenticated()){
					res.json({visit:count,user:req.user.userid});
				}else{
					res.json({visit:count,user:""});
				}
				
			}
		});
	});

	app.get('/writePost',(req,res)=>{
		if(req.isAuthenticated()){
			if(req.user.userid==='admin'){
				res.render('editPage');
			}else{
				res.render('index');
			}
		}else{
			res.render('index');
		}
		
	    
	});
}
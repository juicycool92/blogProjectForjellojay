module.exports = (app,counterModule,mainModule,jsonCreator,passport,io,authServerSocket)=>
{
	app.get('/',(req,res)=>
	{	//메인 페이지 로드
		res.render('index');
		var testServerSocket = require('socket.io-client')('http://localhost:3000');
		
		//authServerSocket.callTest(req.sessionID);
	});

	app.post('/',(req,res)=>
	{	//메인 페이지 데이터 로드
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
						res.json(JSON.parse(jsonString));
						return;
					}
				});
			}
			res.send();
		});
	});

	app.get('/about',(req,res)=>
	{	//about 페이지 로드
		res.render('about');
	});

	app.get('/visitCounter',counterModule.ipPerVisitChecker,(req,res)=>
	{	//방문자 카운터의 값을 전달한다.
		//수정이 필요할거같은 부분. visit 카운터뿐만 아니라, right nav bar 기능들을 모두 요청하는데,
		//현제는 카운터+로그인정보 만 가져온다. 추후 right nav기능이 강화된다면, 기능 강화가 필요할 것.
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

	app.get('/writePost',(req,res)=>
	{	//어드민잔용 게시글 작성 페이지 로드
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

	app.get('/test',(req,res)=>
	{
		res.render('testPage');
	})
	app.get('/testRegister',(req,res)=>
	{
		res.render('testPageRegisterFaces');
	})
	app.get('/testLogin',(req,res)=>
	{
		res.render('testPageDetectFaces');
	})
	app.get('/testIos',(req,res)=>
	{
		res.render('testPageIOS');
	})
}
/*보내야하는 JSON으로 압축하는 외부/내부 함수들이 존재하며, 의존성이 없다.
받은 값을 JSON으로 만들어 돌려준다.*/
module.exports.writeNewAndHotPost=(raws,cb)=>{	//메인페이지의 new/hot topic의 결과값을 저장.
	let newPost = raws.new;
	let hotPost = raws.hot;
	if(!newPost && !hotPost){
		cb('new and hot is empty',null);
	}
	let jsonString = '{"newPost":[';
	if(newPost.length==0){
		jsonString =']';
	}
	for(let i = 0 ; i < newPost.length ; i ++){
		if(i == newPost.length-1){
			jsonString += '{"num":"'+newPost[i].num+'","title":'+JSON.stringify(newPost[i].title)+',"maincat":"'+newPost[i].maincat+'","sub":"'+(newPost[i].maincat+'/'+newPost[i].cat1+'/'+newPost[i].cat2)+'","thimg":'+JSON.stringify(newPost[i].img)+',"thtext":'+JSON.stringify(newPost[i].context)+'}]';
		}else{
			jsonString += '{"num":"'+newPost[i].num+'","title":'+JSON.stringify(newPost[i].title)+',"maincat":"'+newPost[i].maincat+'","sub":"'+(newPost[i].maincat+'/'+newPost[i].cat1+'/'+newPost[i].cat2)+'","thimg":'+JSON.stringify(newPost[i].img)+',"thtext":'+JSON.stringify(newPost[i].context)+'},';
		}
	}
	jsonString+=',"hotPost":[';
	if(hotPost.length==0){
		jsonString =']';
	}
	for(let i = 0 ; i < hotPost.length ; i ++){
		if(i == hotPost.length-1){
			jsonString += '{"num":"'+hotPost[i].num+'","title":'+JSON.stringify(hotPost[i].title)+',"maincat":"'+newPost[i].maincat+'","sub":"'+(hotPost[i].maincat+'/'+hotPost[i].cat1+'/'+hotPost[i].cat2)+'","thimg":'+JSON.stringify(hotPost[i].img)+',"thtext":'+JSON.stringify(hotPost[i].context)+'}]';
		}else{
			jsonString += '{"num":"'+hotPost[i].num+'","title":'+JSON.stringify(hotPost[i].title)+',"maincat":"'+newPost[i].maincat+'","sub":"'+(hotPost[i].maincat+'/'+hotPost[i].cat1+'/'+hotPost[i].cat2)+'","thimg":'+JSON.stringify(hotPost[i].img)+',"thtext":'+JSON.stringify(hotPost[i].context)+'},';
		}
	}
	jsonString+='}';
	cb(null,jsonString);
}

module.exports.writeBlogList=(raws,curPage,boardSize,cb)=>{//blog 게시글의 목록을 압축
	let postLen = raws.length;
	let jsonString = '{"boardSize":"'+boardSize+'","curPage":"'+curPage+'","pageSize":"';
	let pageSize;
	if(boardSize%10===0)
		pageSize = boardSize/10;
	else
		pageSize = Math.floor((boardSize/10)+1);
	jsonString +=pageSize+'","content":[';
	switch(postLen){
		case 0 : cb('[jsonCreator][writeBlogList]no raws. returning null',null); return;
		case 1 : {
			jsonString += '{"num":"'+raws[0].num+'","category1":"'+raws[0].category1+'","category2":"'+raws[0].category2+'","title":'+JSON.stringify(raws[0].title)+',"date":"'+raws[0].date+'"}]}';
			break;
		}
		default :{
			for(let i = 0 ; i < raws.length ; i++){
				if(i == raws.length-1){
					jsonString += '{"num":"'+raws[i].num+'","category1":"'+raws[i].category1+'","category2":"'+raws[i].category2+'","title":'+JSON.stringify(raws[i].title)+',"date":"'+raws[i].date+'"}]}';					
				}else{
					jsonString += '{"num":"'+raws[i].num+'","category1":"'+raws[i].category1+'","category2":"'+raws[i].category2+'","title":'+JSON.stringify(raws[i].title)+',"date":"'+raws[i].date+'"},';
				}
			}
			break;
		}
		
	}
	cb(null,jsonString);
}

module.exports.writeCodeList=(raws,curPage,boardSize,cb)=>{	//code 게시판의 목록을 압축한다.
	let postLen = raws.length;
	let jsonString = '{"boardSize":"'+boardSize+'","curPage":"'+curPage+'","pageSize":"';
	let pageSize;
	if(boardSize%10===0)
		pageSize = boardSize/10;
	else
		pageSize = Math.floor((boardSize/10)+1);
	jsonString +=pageSize+'","content":[';
	switch(postLen){
		case 0 : {
			jsonString += '{"num":"","category1":"","category2":"","title":"","date":""}]}';
			break;
		}
		case 1 : {
			jsonString += '{"num":"'+raws[0].num+'","category1":"'+raws[0].category1+'","category2":"'+raws[0].category2+'","title":'+JSON.stringify(raws[0].title)+',"date":"'+raws[0].date+'"}]}';
			break;
		}
		default :{
			for(let i = 0 ; i < raws.length ; i++){
				if(i == raws.length-1){
					jsonString += '{"num":"'+raws[i].num+'","category1":"'+raws[i].category1+'","category2":"'+raws[i].category2+'","title":'+JSON.stringify(raws[i].title)+',"date":"'+raws[i].date+'"}]}';					
				}else{
					jsonString += '{"num":"'+raws[i].num+'","category1":"'+raws[i].category1+'","category2":"'+raws[i].category2+'","title":'+JSON.stringify(raws[i].title)+',"date":"'+raws[i].date+'"},';
				}
			}
			break;
		}
		
	}
	cb(null,jsonString);
}

module.exports.writeSinglePost = (raws,cb)=>{	//단일 개시글을 압축한다. 현제 사용하지 않고있다.
	if(!raws){
		cb('[jsonCreator][writeSinglePost]raws are empty',null);
	}else{
		let jsonString = '{"num":"'+raws.num+'","category1":"'+raws.category1+'","category2":"'+raws.category2+'","title":'+JSON.stringify(raws.title)+',"date":"'+raws.date+'","context":'+JSON.stringify(raws.context)+'}';
		cb(null,jsonString);
	}
}

module.exports.writeSinglePostandPN = (raws,raws2,reqBoardType,cb)=>{ //단일게시글과 이전/이후 정보도 함꼐 압축한다.
	if(!raws){
		cb('[jsonCreator][writeSinglePostandPN]raws are empty',null);
	}else{
		let jsonString;
		switch(raws2.length){
			case 0 :{
				jsonString = '{"boardType":"'+reqBoardType+'","num":"'+raws.num+'","category1":"'+raws.category1+'","category2":"'+raws.category2+'","title":'+JSON.stringify(raws.title)+',"date":"'+raws.date+'","context":'+JSON.stringify(raws.context)+',"prevNum":"","prevTitle":"","nextNum":"","nextTitle":""}';	
				break;
			}
			case 1: {
				if(raws.num > raws2[0].num){//만일 한개의 게시물이 이전 게시물이면
					jsonString = '{"boardType":"'+reqBoardType+'","num":"'+raws.num+'","category1":"'+raws.category1+'","category2":"'+raws.category2+'","title":'+JSON.stringify(raws.title)+',"date":"'+raws.date+'","context":'+JSON.stringify(raws.context)+',"prevNum":"'+raws2[0].num+'","prevTitle":'+JSON.stringify(raws2[0].title)+',"nextNum":"","nextTitle":""}';					
				}else{//만일 한개의 게시물이 다음 게시물이면
					jsonString = '{"boardType":"'+reqBoardType+'","num":"'+raws.num+'","category1":"'+raws.category1+'","category2":"'+raws.category2+'","title":'+JSON.stringify(raws.title)+',"date":"'+raws.date+'","context":'+JSON.stringify(raws.context)+',"prevNum":"","prevTitle":"","nextNum":"'+raws2[0].num+'","nextTitle":'+JSON.stringify(raws2[0].title)+'}';
				}
				break;
			}
			case 2: {
				jsonString = '{"boardType":"'+reqBoardType+'","num":"'+raws.num+'","category1":"'+raws.category1+'","category2":"'+raws.category2+'","title":'+JSON.stringify(raws.title)+',"date":"'+raws.date+'","context":'+JSON.stringify(raws.context)+',"prevNum":"'+raws2[1].num+'","prevTitle":'+JSON.stringify(raws2[1].title)+',"nextNum":"'+raws2[0].num+'","nextTitle":'+JSON.stringify(raws2[0].title)+'}';			
				break;
			}
			default :{
				cb('[jsonCreator][writeSinglePostandPN]raws2 are empty or crazy number',null);
				break;
			}
		}
		cb(null,jsonString);
	}
}
module.exports.writeAllReplyFromSelectedBoard = (raws,cb)=>{	//선택된 게시물의 모든 덧글을 압축한다.
	let jsonString ='{"reply":[';
	if(!raws){
		cb('[jsonCreator][writeAllReplyFromSelectedBoard]raws are empty',null);
	}else{
		switch(raws.length){
			case 1:{
				jsonString += '{"rnum":"'+raws[0].rnum+'","rname":"'+raws[0].rname+'","rcontext":'+JSON.stringify(raws[0].rcontext)+',"rdate":"'+raws[0].rdate+'"}';
				break;
			}default :{
				for(let i = 0 ; i < raws.length ; i++){
					if(i===raws.length-1){
						jsonString += '{"rnum":"'+raws[i].rnum+'","rname":"'+raws[i].rname+'","rcontext":'+JSON.stringify(raws[i].rcontext)+',"rdate":"'+raws[i].rdate+'"}';
					}else{
						jsonString += '{"rnum":"'+raws[i].rnum+'","rname":"'+raws[i].rname+'","rcontext":'+JSON.stringify(raws[i].rcontext)+',"rdate":"'+raws[i].rdate+'"},';
					}
				}
				break;
			}
		}
		jsonString +=']}';
		cb(null,jsonString);
	}
}
module.exports.sortCategoryies = (rawString,cb)=>{	//각 카테고리의 프리셋들을 불러온다.
	if(rawString.length==0 || !rawString){
		cb('err? no row found, returning NULL','{"cat1":"[]","cat2":"[]"}');
	}else{
		let jsonString = '{';
		let jsonCat1 = new String('"cat1":['), jsonCat2 = new String('"cat2":[');
		for(let i = 0; i < rawString.length-1 ; i ++){
			if(rawString[i].cat1){
				if(jsonCat1.length == 8 ){
					jsonCat1 += '"' + rawString[i].cat1 +'"';
				}else{
					jsonCat1 += ',"' + rawString[i].cat1 +'"';	
				}
			}
				
			if(rawString[i].cat2){
				if(jsonCat2.length == 8 ){
					jsonCat2 += '"' + rawString[i].cat2 +'"';
				}else{
					jsonCat2 += ',"' + rawString[i].cat2 +'"';
				}
			}
				
		}
		if(jsonCat1.length == 8 ){
			jsonCat1 += '"' + rawString[rawString.length-1].cat1+'"'  ;
		}else{
			if(rawString[rawString.length-1].cat1)
				jsonCat1 += ',"' + rawString[rawString.length-1].cat1+'"'  ;
		}
		if(jsonCat2.length == 8 ){
			jsonCat2 += '"' + rawString[rawString.length-1].cat2+'"';
		}else{
			if(rawString[rawString.length-1].cat2)
				jsonCat2 += ',"' + rawString[rawString.length-1].cat2+'"';
		}
		jsonString += jsonCat1 +'],'+ jsonCat2 +']}';
		cb(null,jsonString);
	}
}
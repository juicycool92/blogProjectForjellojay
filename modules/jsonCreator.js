module.exports.writeBlogList=(raws,curPage,boardSize,cb)=>{
	var postLen = raws.length;
	var jsonString = '{"boardSize":"'+boardSize+'","curPage":"'+curPage+'","pageSize":"';
	var pageSize;
	if(boardSize%10===0)
		pageSize = boardSize/10;
	else
		pageSize = Math.floor((boardSize/10)+1);
	jsonString +=pageSize+'","content":[';
	switch(postLen){
		case 0 : cb('[jsonCreator][writeBlogList]no raws. returning null',null); return;
		case 1 : {
			jsonString += '{"num":"'+raws[0].num+'","category1":"'+raws[0].category1+'","category2":"'+raws[0].category2+'","title":"'+raws[0].title+'","date":"'+raws[0].date+'"}]}';
			break;
		}
		default :{
			for(var i = 0 ; i < raws.length ; i++){
				if(i == raws.length-1){
					jsonString += '{"num":"'+raws[i].num+'","category1":"'+raws[i].category1+'","category2":"'+raws[i].category2+'","title":"'+raws[i].title+'","date":"'+raws[i].date+'"}]}';					
				}else{
					jsonString += '{"num":"'+raws[i].num+'","category1":"'+raws[i].category1+'","category2":"'+raws[i].category2+'","title":"'+raws[i].title+'","date":"'+raws[i].date+'"},';
				}
			}
			break;
		}
		
	}
	cb(null,jsonString);
}
module.exports.writeCodeList=(raws,curPage,boardSize,cb)=>{
	var postLen = raws.length;
	var jsonString = '{"boardSize":"'+boardSize+'","curPage":"'+curPage+'","pageSize":"';
	var pageSize;
	if(boardSize%10===0)
		pageSize = boardSize/10;
	else
		pageSize = Math.floor((boardSize/10)+1);
	jsonString +=pageSize+'","content":[';
	switch(postLen){
		case 0 : {
			jsonString += '{"num":"","category1":"","category2":"","title":"","date":""}]}';
			break;
		}//cb('[jsonCreator][writeCodeList]no raws. returning null',null); return;
		case 1 : {
			jsonString += '{"num":"'+raws[0].num+'","category1":"'+raws[0].category1+'","category2":"'+raws[0].category2+'","title":"'+raws[0].title+'","date":"'+raws[0].date+'"}]}';
			break;
		}
		default :{
			for(var i = 0 ; i < raws.length ; i++){
				if(i == raws.length-1){
					jsonString += '{"num":"'+raws[i].num+'","category1":"'+raws[i].category1+'","category2":"'+raws[i].category2+'","title":"'+raws[i].title+'","date":"'+raws[i].date+'"}]}';					
				}else{
					jsonString += '{"num":"'+raws[i].num+'","category1":"'+raws[i].category1+'","category2":"'+raws[i].category2+'","title":"'+raws[i].title+'","date":"'+raws[i].date+'"},';
				}
			}
			break;
		}
		
	}
	cb(null,jsonString);
}
module.exports.writeSinglePost = (raws,cb)=>{
	if(!raws){
		cb('[jsonCreator][writeSinglePost]raws are empty',null);
	}else{
		var jsonString = '{"num":"'+raws.num+'","category1":"'+raws.category1+'","category2":"'+raws.category2+'","title":"'+raws.title+'","date":"'+raws.date+'","context":'+JSON.stringify(raws.context)+'}';
		console.log('[jsonCreator][writeSinglePost]debug : '+jsonString);
		cb(null,jsonString);
		//JSON.stringify(raws.context)
	}
}
module.exports.writeSinglePostandPN = (raws,raws2,reqBoardType,cb)=>{
	if(!raws){
		cb('[jsonCreator][writeSinglePostandPN]raws are empty',null);
	}else{
		var jsonString;
		switch(raws2.length){
			case 0 :{
				jsonString = '{"boardType":"'+reqBoardType+'","num":"'+raws.num+'","category1":"'+raws.category1+'","category2":"'+raws.category2+'","title":"'+raws.title+'","date":"'+raws.date+'","context":'+JSON.stringify(raws.context)+',"prevNum":"","prevTitle":"","nextNum":"","nextTitle":""}';	
				break;
			}
			case 1: {
				if(raws.num > raws2[0].num){//만일 한개의 게시물이 이전 게시물이면
					jsonString = '{"boardType":"'+reqBoardType+'","num":"'+raws.num+'","category1":"'+raws.category1+'","category2":"'+raws.category2+'","title":"'+raws.title+'","date":"'+raws.date+'","context":'+JSON.stringify(raws.context)+',"prevNum":"'+raws2[0].num+'","prevTitle":"'+raws2[0].title+'","nextNum":"","nextTitle":""}';					
				}else{//만일 한개의 게시물이 다음 게시물이면
					jsonString = '{"boardType":"'+reqBoardType+'","num":"'+raws.num+'","category1":"'+raws.category1+'","category2":"'+raws.category2+'","title":"'+raws.title+'","date":"'+raws.date+'","context":'+JSON.stringify(raws.context)+',"prevNum":"","prevTitle":"","nextNum":"'+raws2[0].num+'","nextTitle":"'+raws2[0].title+'"}';
				}
				break;
			}
			case 2: {
				jsonString = '{"boardType":"'+reqBoardType+'","num":"'+raws.num+'","category1":"'+raws.category1+'","category2":"'+raws.category2+'","title":"'+raws.title+'","date":"'+raws.date+'","context":'+JSON.stringify(raws.context)+',"prevNum":"'+raws2[1].num+'","prevTitle":"'+raws2[1].title+'","nextNum":"'+raws2[0].num+'","nextTitle":"'+raws2[0].title+'"}';			
				break;
			}
			default :{
				cb('[jsonCreator][writeSinglePostandPN]raws2 are empty or crazy number',null);
				break;
			}
		}
		console.log('[jsonCreator][writeSinglePostandPN]'+jsonString);
		cb(null,jsonString);
	}
	//	var jsonString = '{"num":"'+raws.num+'","category1":"'+raws.category1+'","category2":"'+raws.category2+'","title":"'+raws.title+'","date":"'+raws.date+'","context":"'+JSON.stringify(raws.context)+'","prevNum":"'+raws[1].num+'","prevTitle":"'+raws[1].title+'","nextNum":"'+raws[0].num+'","nextTitle":"'+raws[1].title+'"}';
	
}
module.exports.writeAllReplyFromSelectedBoard = (raws,cb)=>{
	var jsonString ='{"reply":[';
	if(!raws){
		cb('[jsonCreator][writeAllReplyFromSelectedBoard]raws are empty',null);
	}else{
		switch(raws.length){
			case 1:{
				jsonString += '{"rnum":"'+raws[0].rnum+'","rname":"'+raws[0].rname+'","rcontext":"'+(raws[0].rcontext).replace(/"/g, '\\"')+'","rdate":"'+raws[0].rdate+'"}';
				break;
			}default :{
				for(var i = 0 ; i < raws.length ; i++){
					if(i===raws.length-1){
						jsonString += '{"rnum":"'+raws[i].rnum+'","rname":"'+raws[i].rname+'","rcontext":"'+(raws[i].rcontext).replace(/"/g, '\\"')+'","rdate":"'+raws[i].rdate+'"}';
					}else{
						jsonString += '{"rnum":"'+raws[i].rnum+'","rname":"'+raws[i].rname+'","rcontext":"'+(raws[i].rcontext).replace(/"/g, '\\"')+'","rdate":"'+raws[i].rdate+'"},';
					}
				}
				break;
			}
		}
		jsonString +=']}';
		cb(null,jsonString);
	}
}
module.exports.sortCategoryies = (rawString,cb)=>{
	if(rawString.length==0 || !rawString){
		cb('err? no row found, returning NULL','{"cat1":"[]","cat2":"[]"}');
	}else{
		var jsonString = '{';
		var jsonCat1 = new String('"cat1":['), jsonCat2 = new String('"cat2":[');
		for(let i = 0; i < rawString.length-1 ; i ++){
			if(rawString[i].cat1){
				console.log('cat1 length :'+jsonCat1.length);
				if(jsonCat1.length == 8 ){
					jsonCat1 += '"' + rawString[i].cat1 +'"';
				}else{
					jsonCat1 += ',"' + rawString[i].cat1 +'"';	
				}
			}
				
			if(rawString[i].cat2){
				console.log('cat2 length :'+jsonCat2.length);
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
		console.log('baked jsonString is : \n'+jsonString);
		cb(null,jsonString);
	}
}
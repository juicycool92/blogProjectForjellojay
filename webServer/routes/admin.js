module.exports = (app,mainModule,jsonCreator)=>{
    //subCategory들을 목록화 하여 출력한다.
    app.post('/loadSubCateAll',(req,res)=>{
        console.log(req.body.postType);
        mainModule.searchSelectedSubCategory(req.body.postType,(err,rawResult)=>{
            if(err){
                console.log('[admin.js][/loadSubCateAll][ERR]err at mainModule : \n'+err);
            }else{
                jsonCreator.sortCategoryies(rawResult,(err,jsonString)=>{
                    if(err){
                        console.log('[admin.js][/loadSubCateAll][ERR]err at jsonCreator.sortCategoryies: \n'+err);
                    }
                    res.json(jsonString);
                    return;        
                });
            }
            res.status(400);
            res.send();
        });
    });

    app.post('/appendPost',(req,res)=>{ //게시물을 업로드 한다.
        mainModule.appendNewPost(req.body,(err)=>{
            if(err){
                console.log('[admin.js][/appendPost][ERR]'+err);
                res.status(401);
            }else{
                res.status(201);
            }
            res.send();
        });
    });
}
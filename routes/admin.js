module.exports = (app,mainModule,jsonCreator)=>{
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
                    res.send();
                    return;        
                });
            }
            res.status(400);
            res.send();
        });
    });

    app.post('/appendPost',(req,res)=>{
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
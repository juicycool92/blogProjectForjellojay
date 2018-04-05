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
        
        var mainCategory = req.body.mainCategory;
        var subCategory1 = JSON.stringify(req.body.subCategory1);
        var subCategory2 = JSON.stringify(req.body.subCategory2);
        var contextText = req.body.contextText;
        console.log(mainCategory);
        console.log(subCategory1);
        console.log(subCategory2);
        console.log(contextText);
    });
}
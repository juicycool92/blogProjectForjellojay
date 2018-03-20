module.exports = (app)=>
{
	app.get('/',(req,res)=>{
	    res.render('index');
	});
	app.get('/about',(req,res)=>
	{
		console.log('/about');
		res.render('about');
	});
}
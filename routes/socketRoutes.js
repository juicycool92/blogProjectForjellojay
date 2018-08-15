module.exports = (app,io,socketModule) =>{
    io.on('connection',(socket)=>{
        console.log('io on connection ')
    });
}
exports.auth=(req,res,next)=>{
    if(req.user){
        next()
    }else{
        res.render("errors/404")
    }
}

exports.onlyUser=(req,res,next)=>{
 if(req.user){
        next()
    }else{
        res.render("errors/only-user")
    }
}
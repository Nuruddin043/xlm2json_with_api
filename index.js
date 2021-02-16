const express=require('express')
const app=express()

const PORT=process.env.PORT || 5000;
require('./database/database')

const mainRouter=require('./src/router/main')
app.use(mainRouter)


app.get('/',(req,res,next)=>{
    res.send({
        success:true
    })
})

/////error handling route
app.use((req,res,next)=>{
    const error=new Error(`Not found -${req.originalUrl}`)
    res.status(404)
    next(error)
})
app.use((error,req,res,next)=>{
   
    res.send({
        success:false,
        error:error.message
    })
})

app.listen(PORT,(()=>{
    console.log('server running at port',PORT)
}))
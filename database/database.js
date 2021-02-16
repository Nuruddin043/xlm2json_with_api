const mongoose=require('mongoose')
const mongodb_url="mongodb+srv://test_user:test_password@cluster0.wjzs9.mongodb.net/json_file?retryWrites=true&w=majority"
mongoose.connect(mongodb_url,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true,
    useFindAndModify: false 
},()=>{
    console.log('database connected')
})

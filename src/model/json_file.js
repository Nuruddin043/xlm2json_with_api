const mongoose=require('mongoose')

const jsonSchema=new mongoose.Schema({
    file_name:{
        type:String,
        required:true,
        unique:true
    },
    file:{
        type:Object
    }
})


const JsonFile=mongoose.model('JsonFile',jsonSchema)


module.exports=JsonFile
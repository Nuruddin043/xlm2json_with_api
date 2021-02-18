const express=require('express')
const router=express.Router()
const convert=require('../controllers/convert')

router.get('/create_sim_json',convert.xmltojson)

router.get('/fetch_sim_json/:file_name',convert.getJSONfile)


router.get('/delete_sim_json/:file_name',convert.deleteJsonfile)
module.exports=router
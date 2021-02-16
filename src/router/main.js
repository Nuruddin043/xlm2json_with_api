const express=require('express')
const router=express.Router()
const convert=require('../controllers/convert')

router.get('/create_sim_json',convert.xmltojson)

module.exports=router
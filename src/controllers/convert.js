const fs = require('fs');
const parser = require('fast-xml-parser');
const he = require('he');
const axios = require('axios');
const url = require('url');

const JsonFile = require('../model/json_file')

const options = {
    attributeNamePrefix: "@_",
    attrNodeName: "attr", //default is 'false'
    textNodeName: "#text",
    ignoreAttributes: false,
    ignoreNameSpace: false,
    allowBooleanAttributes: false,
    parseNodeValue: true,
    parseAttributeValue: false,
    trimValues: true,
    cdataTagName: "__cdata", //default is 'false'
    cdataPositionChar: "\\c",
    parseTrueNumberOnly: false,
    arrayMode: false, //"strict"
    attrValueProcessor: (val, attrName) => he.decode(val, { isAttributeValue: true }),//default is a=>a
    tagValueProcessor: (val, tagName) => he.decode(val), //default is a=>a
    stopNodes: ["parse-me-as-string"]
};

function fullUrl(req) {
    return url.urlObject({
        protocol: req.protocol,
        host: req.get('host')
    });
}

////main enpoints- controllers-------------------------------------------------

exports.xmltojson = async (req, res, next) => {
    try {
        let xml_link;
        ///getting input from query parameters---------------------------------
        if (req.query.xml_link) {
            xml_link = req.query.xml_link
        } else {
            next({ message: "Porvide valid xml_link" })
        }
        let filter_fields = []
        if (req.query.remove_fields) {
            filter_fields = req.query.remove_fields
            filter_fields = filter_fields.split(',')
        }
        ///--------------------------------------------------------------------
        let { data } = await axios.get(xml_link)

        let arr = xml_link.split('/')
        let file_name = arr[arr.length - 1]
        file_name=file_name.replace('.xml','')


        if (parser.validate(data) === true) { //optional (it'll return an object in case it's not valid)
            var jsonObj = parser.parse(data, options);
        }

        var tObj = parser.getTraversalObj(data, options);
        var jsonObj = parser.convertToJson(tObj, options);


        if (filter_fields.length > 0) {
            filter_fields.forEach(filter => {
                if (filter === "Stream") {
                    delete jsonObj.rFactorXML.RaceResults.Race.Stream
                }
                if (filter === "Lap") {
                    jsonObj.rFactorXML.RaceResults.Race.Driver.forEach((obj, index) => {
                        delete jsonObj.rFactorXML.RaceResults.Race.Driver[index].Lap
                    })
                }
                if (filter === "isPlayer") {
                    jsonObj.rFactorXML.RaceResults.Race.Driver.forEach((obj, index) => {
                        delete jsonObj.rFactorXML.RaceResults.Race.Driver[index].isPlayer
                    })
                }
                if (filter === "ControlAndAids") {
                    jsonObj.rFactorXML.RaceResults.Race.Driver.forEach((obj, index) => {
                        delete jsonObj.rFactorXML.RaceResults.Race.Driver[index].ControlAndAids
                    })
                }
            });
        }


        const file = await JsonFile.findOne({ file_name: file_name })

        if (file) {
            file.file = jsonObj
            await file.save()
        } else {
            let newFile = new JsonFile({
                file_name: file_name,
                file: jsonObj
            })
            await newFile.save()
        }


        res.send({
            file_link: req.protocol + '://' + req.hostname + '/fetch_sim_json/' + file_name
        })


        





    } catch (e) {
        next(e)
    }
}






exports.getJSONfile=async(req,res,next)=>{
    try{
        const file_name=req.params.file_name

        const file=await JsonFile.findOne({file_name:file_name})

        res.send(file)

    }catch(e){
        next(e)
    }
}

exports.deleteJsonfile=async(req,res,next)=>{
    try{
        const file_name=req.params.file_name

        const file=await JsonFile.findOneAndDelete({file_name:file_name})
        if(file){
            return res.send({
                success:true
            })
        }
        res.send({
            success:false
        })
        

    }catch(e){
        next(e)
    }
}









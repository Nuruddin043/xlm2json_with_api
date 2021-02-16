const fs = require('fs');
const parser = require('fast-xml-parser');
const he = require('he');
const axios = require('axios');

const options = {
    attributeNamePrefix: "@_",
    attrNodeName: "attr", //default is 'false'
    textNodeName: "#text",
    ignoreAttributes: true,
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
        // if (parser.validate(data) === true) { //optional (it'll return an object in case it's not valid)
        //     var jsonObj = parser.parse(data, options);
        // }

        var tObj = parser.getTraversalObj(data, options);
        var jsonObj = parser.convertToJson(tObj, options);
        

        if(filter_fields.length>0){
            filter_fields.forEach(filter => {
                if(filter==="Stream"){
                    delete jsonObj.rFactorXML.RaceResults.Race.Stream
                }
                if(filter==="Lap"){
                    jsonObj.rFactorXML.RaceResults.Race.Driver.forEach((obj,index)=>{
                        delete jsonObj.rFactorXML.RaceResults.Race.Driver[index].Lap
                    })
                }
                if(filter==="isPlayer"){
                    jsonObj.rFactorXML.RaceResults.Race.Driver.forEach((obj,index)=>{
                        delete jsonObj.rFactorXML.RaceResults.Race.Driver[index].isPlayer
                    })
                }
                if(filter==="ControlAndAids"){
                    jsonObj.rFactorXML.RaceResults.Race.Driver.forEach((obj,index)=>{
                        delete jsonObj.rFactorXML.RaceResults.Race.Driver[index].ControlAndAids
                    })
                }
            });
        }
 


        res.send(jsonObj)


        

    } catch (e) {
        next(e)
    }
}
















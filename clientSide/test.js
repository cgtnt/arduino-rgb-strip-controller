const fs = require("fs");

let JSONcontent = JSON.parse(fs.readFileSync("appData/data.json"))

for(var id in JSONcontent){
    console.log(JSONcontent[id])
}

function relayInfo(element){
    let typeIndex = element.parentNode.parentNode.name;
    let index = element.name;

    let transmissionData = JSONcontent[typeIndex][index]
    console.log(transmissionData);
}
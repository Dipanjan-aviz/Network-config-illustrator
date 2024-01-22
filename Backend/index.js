// index.js

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const yaml = require('js-yaml');
// const expressFileUpload = require('express-fileupload')

const app = express();
const port = 8085;

app.use(express.json())

// const bodyParser = require('body-parser');
// app.use(bodyParser())

const cors = require('cors');

app.use(cors());
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});


app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './assets');
  },
  filename: function (req, file, cb) {
    cb(null,  "input.yaml");
  },
});

const upload = multer({ storage: storage });

const convertYamlToJson = (yamlFilePath, jsonFolderPath) => {
  const jsonData = readYamlFile(yamlFilePath);
  
  if (jsonData) {
    try {
      const jsonFileName = `${jsonFolderPath}/output.json`;
      const jsonString = JSON.stringify(jsonData, null, 2);
      console.log(jsonString,jsonFileName)
      fs.writeFileSync(jsonFileName, jsonString);
      console.log(`Conversion successful. JSON file saved at: ${jsonFileName}`);
      return jsonString;
    } catch (error) {
      console.error('Error writing JSON file:', error.message);
    }
  } else {
    console.error('Unable to convert YAML to JSON.');
  }
};

const readYamlFile = (filePath) => {
  try {
    const yamlData = fs.readFileSync(filePath, 'utf8');
    return yaml.load(yamlData);
  } catch (error) {
    console.error('Error reading YAML file:', error.message);
    return null;
  }
};


app.post('/uploadfile',upload.single('file'),(req, res)=>{
  const jsonData = JSON.parse(convertYamlToJson(`./assets/input.yaml`,`./jsonfolder`))
  createTopologyfromJson(jsonData);
  // const requiredData = jsonData
  res.send({nodes: nodes, links: links});
  fs.truncate(`./assets/input.yaml`, 0, (err) => {
    if (err) {
      console.error(`Error clearing file: ${err.message}`);
    } else {
      console.log('File cleared successfully.');
    }
  });
  fs.truncate(`./jsonfolder/output.json`, 0, (err) => {
    if (err) {
      console.error(`Error clearing file: ${err.message}`);
    } else {
      console.log('File cleared successfully.');
    }
  });
})


app.get('/*', (req, res) => {
  res.send({
    message: "get yourself a server first!!"
  });
});

var nodes = [];
var links = [];

const insertNode = (details) => {
    let isPresent = false;
    let currentID = details.id;
    for(let i = 0;  i < nodes.length; i++){
        if(nodes[i].id === currentID){
            isPresent = true;
            nodes[i] = {...nodes[i], ...details};
            return;
        }
    }
    if(!isPresent) nodes.push(details);
}

const insertLink = (startSwitch, endSwitch, start, end, linkDataString) => {
    let isPresent = false;
    let linkName = "";
    let direction = {};
    let dashes = linkDataString.includes("MC-LAG");
    let color = linkDataString.includes("MC-LAG") ? "#7D3C98" : "#3498DB";
    if(start < end){
      linkName = start + " <-> " + end;
      direction = {from: startSwitch, to: endSwitch};
    }
    else{
      linkName = end + " <-> " + start;
      direction = {from: startSwitch, to: endSwitch}
    }
    for(let i = 0;  i < links.length; i++){
        if(links[i].linkName === linkName){
            isPresent = true;
            links[i] = {...direction, ...links[i],dashes: dashes, color: color, linkName: linkName, title: linkDataString};
            return;
        }
    }
    if(!isPresent) links.push({...direction, linkName: linkName, title: linkDataString, arrows: "null",dashes: dashes, color: color});
}

const switchShortHand = (nodeType, switchName) => {
  let shortName = "";
  if(nodeType === "SSpine") shortName += "SS";
  if(nodeType === "Spine") shortName += "S";
  if(nodeType === "Leaf") shortName += "L";
  if(nodeType === "Tor") shortName += "T";
  if(nodeType === "Host") shortName += "H";
  let splitName = switchName.split('-');
  return shortName + splitName[splitName.length - 1];
}

const linkSeperator = (linkName) => {
  let [start, end] = linkName.split("|").map(item => item.trim());
  let [startSwitch, startPort] = start.split("_");
  let [endSwitch, endPort] = end.split("_");
  const allSwitches = [];
  nodes.forEach(item => allSwitches.push(Object.keys(item)[0]));
  if(!allSwitches.includes(startSwitch)) insertNode({id: startSwitch, label: startSwitch});
  if(!allSwitches.includes(endSwitch)) insertNode({id: endSwitch, label: endSwitch});
  return [startSwitch, endSwitch, start, end];
}

const colorCode = (nodeType, details) => {
  if(details && details.includes("MC-LAG:")) return "#7d3c98";
  if(nodeType === "SSpine" || nodeType.slice(0,2) === "SS") return "#f5b7b1";
  if(nodeType === "Spine" || nodeType.slice(0,1) === "S") return "#3498db";
  if(nodeType === "Leaf" || nodeType.slice(0,1) === "L") return "#1abc9c";
  if(nodeType === "Tor" || nodeType.slice(0,1) === "T") return "#d35400";
  if(nodeType === "Host" || nodeType.slice(0,1) === "H") return "#f5b041";
}

const createTopologyfromJson = (data) => {
    for(let nodeType in data.Connectivity){
        for (let switches of data.Connectivity[nodeType]){
            const switchShortName = switchShortHand(nodeType, switches.switchName);
            let switchData = {
                switchId: switches?.switchId,
                switchName: switches?.switchName,
                ipAddress: switches?.ipAddress,
                ASN: switches?.ASN,
                Username: switches.Credentials.user,
                Password: switches.Credentials.password,
            }
            let switchDataString = "";
            for(let key in switchData) switchDataString += `${key}: ${switchData[key]}\n`;
            if(switches.mclag) {
              switchDataString += "\n\n\nMC-LAG:\n";
              for(let key in switches.mclag) switchDataString += `${key}: ${switches.mclag[key]}\n`;
            }
            insertNode({
              id: switchShortName,
              label: switchShortName,
              title: switchDataString,
            });
            if(switches.Links){
                for(let connection of switches.Links){
                    let [startSwitch, endSwitch, start, end, ] = linkSeperator(connection.link);
                    let linkDataString = "";
                    for(let key in connection.properties) linkDataString += `${key}: ${connection.properties[key]}\n`;
                    insertLink(startSwitch, endSwitch, start, end, linkDataString);
                }
            }
        }
    }
    for(let i = 0; i < nodes.length; i++){
      nodes[i] = {...nodes[i], color: colorCode(nodes[i].id, nodes[i].title)};
    }
}
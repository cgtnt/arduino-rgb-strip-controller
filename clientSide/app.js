const http = require("http");
const fs =  require("fs");
const open = require('open');
const SerialPort = require('serialport');
const parsers = SerialPort.parsers;

let JSONContent = JSON.parse(fs.readFileSync("appData/data.json"))

console.log("Arduino LED Strip Controller \n The application is running, please do not close the console window while using the software. \n Closing the console window shuts down the program")

const parser = new parsers.Readline({
    delimiter: '\r\n'
});

const delay = async (ms = 1000) =>
  new Promise(resolve => setTimeout(resolve, ms));

const app = http.createServer(function(req, res){
    if (req.url==="/controller.html?"){
        const resFile = fs.createReadStream("frontend/controller.html");
        resFile.pipe(res);
        res.writeHead(200, {'Content-Type':'text/html'});
    } else if (req.url==="/editor.html?"){
        const resFile = fs.createReadStream("frontend/editor.html");
        resFile.pipe(res);
        res.writeHead(200, {'Content-Type':'text/html'});
    } else if (req.url==="/menu.html?"){
        const resFile = fs.createReadStream("frontend/menu.html");
        resFile.pipe(res);
        res.writeHead(200, {'Content-Type':'text/html'});
    } else {
        const resFile = fs.createReadStream("frontend/input.html");
        resFile.pipe(res);
        res.writeHead(200, {'Content-Type':'text/html'});
    }
});

const io = require("socket.io").listen(app);

var port;
let currentInterval;
let colorinprogress;
let seqQueue = [];

let changeColor = function(clr){
    port.write(clr.r+","+clr.g+","+clr.b);
}


io.on('connection', function(socket){
    socket.emit("populate", JSONContent);

    socket.on("comPort",function(data){
        portInput = data;

        port = new SerialPort(portInput,function(err){if (err){return socket.emit("confirm","fail")}else{socket.emit("confirm", "success")}},{
            bandRate: 9600,
            dataBits: 8,
            parity: 'none',
            stopBits: 1,
            flowControl: false,
        });
        port.pipe(parser);
    });

    socket.on("appendObj", function(data){
        let content = data["content"];
        let target = data["target"];

        let newProp = Object.assign(JSONContent[target],content);
        JSONContent[target] = newProp;
        fs.writeFileSync("appData/data.json",JSON.stringify(JSONContent));
    });

    socket.on("removeObj", function(data){
        let content = data["content"];
        let target = data["target"];
        
        delete JSONContent[target][content];
        fs.writeFileSync("appData/data.json",JSON.stringify(JSONContent));
    })
    
    socket.on("rgbLights", function(data){
        let JSONCategory = JSONContent[data.typeindex];
        clearInterval(currentInterval);
        colorinprogress=data.index;

        if (data.typeindex=="sequences"){
            let sequence = JSONCategory[data.index];
            for (const task in seqQueue){
                clearTimeout(task);
            }
            let forF = async function(){
                for(const element of sequence){
                
                    let color = JSONContent["colors"][element.color];
                    let duration = element.duration;

                    if(data.index==colorinprogress){
                        changeColor(color);
                    }else{break;}
                    await delay(duration);
                };
                if(data.index==colorinprogress){
                    forF();
                }
            }
            forF();
        }
        if (data.typeindex=="colors"){
            let color = JSONCategory[data.index];
            changeColor(color);
        }
        if (data.typeindex=="gradients"){
            let gradient = JSONCategory[data.index];
            let color1 = JSONContent["colors"][gradient.color1];
            let color2 = JSONContent["colors"][gradient.color2];
            
            port.write(color1.r+","+color1.g+","+color1.b+","+"gr"+","+color2.r+","+color2.g+","+color2.b);
        }
    });
});

process.stdin.resume();
process.on('SIGINT',function(){
    port.write("08");
    process.exit();
});

process.on("uncaughtException", (err) => {
    console.log(`Uncaught Exception: ${err.message}`);
    port.write("08");
    process.exit(1);
});

app.listen(3000, function(){
    open('http://localhost:3000');
});
const http = require("http");
const fs =  require("fs");
const open = require('open');
const SerialPort = require('serialport');
const { fileURLToPath } = require("url");
const parsers = SerialPort.parsers;

const parser = new parsers.Readline({
    delimiter: '\r\n'
});

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

io.on('connection', function(socket){
    socket.on("comPort",function(data){
        portInput = data.status;

        port = new SerialPort(portInput,function(err){if (err){return socket.emit("confirm", {status:"fail"})}else{socket.emit("confirm", {status:("success")})}},{
            bandRate: 9600,
            dataBits: 8,
            parity: 'none',
            stopBits: 1,
            flowControl: false,
        });
        port.pipe(parser);
    });
    
    socket.on("rgbLights", function(data){
        port.write(data.status);
        console.log(data);
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
const http = require("http");
const fs =  require("fs");
const open = require('open');
const prompt = require("prompt-sync")({ sigint: true });

const hinterface = fs.readFileSync("index.html");
 
const SerialPort = require('serialport');
const parsers = SerialPort.parsers;

const portInput = prompt("Unesi USB port: ");
console.log("Ne zatvaraj konzolu - Zatvaranje konzole gasi server")

const parser = new parsers.Readline({
    delimiter: '\r\n'
});

const port = new SerialPort(portInput,{
    bandRate: 9600,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false,
});

port.pipe(parser);

const app = http.createServer(function(req, res){
    res.writeHead(200, {'Content-Type':'text/html'});
    res.end(hinterface);
    
});

const io = require("socket.io").listen(app);

io.on('connection', function(socket){
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
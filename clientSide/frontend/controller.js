var socket = io();

document.querySelectorAll('.iButton').forEach(button => {
    button.disabled = true;
});

function relayInfo(element){
    console.log((element.parentNode.parentNode.id + element.name));
    socket.emit("rgbLights", {status:(element.parentNode.parentNode.id + element.name)});
}

function relayCOMport(form){
    const el = form.parentNode;
    const port = document.getElementById("port").value;

    const processTextnode = document.createElement("h6");
    const pT = document.createTextNode("Processing...");
    processTextnode.setAttribute("id","processT")
    processTextnode.appendChild(pT);

    el.appendChild(processTextnode);
    console.log(port);
    socket.emit("comPort", {status:(port)});
    socket.on("confirm", function(data){
        if (data.status=="fail"){
            document.getElementById('processT').innerText = "Invalid port, try again";
        } else {
            document.getElementById('Success!').innerText = "Invalid port, try again";
            document.querySelectorAll('.iButton').forEach(button => {
                button.disabled = false;
            });
        }
    })
}

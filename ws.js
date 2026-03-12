const socket=new WebSocket("wss://your-server/tpms")

socket.onmessage=e=>{

const data=JSON.parse(e.data)

updateWheel(data)

}

socket.onclose=()=>{

setTimeout(()=>{

location.reload()

},3000)

}
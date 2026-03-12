function updateWheel(data){

const psi=document.getElementById("psi"+data.wheel)
const temp=document.getElementById("temp"+data.wheel)
const card=document.getElementById(data.wheel)

psi.innerText=data.psi+" PSI"
temp.innerText=data.temp+" °C"

card.style.background=pressureColor(data.psi)

}
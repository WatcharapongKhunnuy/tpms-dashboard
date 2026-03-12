const ctx=document.getElementById("historyChart")

new Chart(ctx,{

type:"line",

data:{

labels:["1","2","3","4","5"],

datasets:[{

label:"Front Left PSI",

data:[32,33,31,34,32]

}]

}

})
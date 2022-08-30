//On crée une variable qui contient l'id "orderId"
let orderId = document.getElementById("orderId");
//On vide l'interieur de l'id car elle contient un numero d'exemple
orderId.innerText=""
function showIdOrder (){
//On utilise URL Search Params l'url apres le ?;
var urlParams = new URLSearchParams(location.search);
// On utilise la variable avec urlParams pour selectionner orderID qui se situe apres le ?
let order = urlParams.get('orderId');
console.log(order);
//On remplis l'interieur du span orderID avec le numéro de commande qui a été pris sur l'URL
orderId.innerText = order;
}
showIdOrder()
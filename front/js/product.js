const productImg = document.querySelector('.item__img')
var urlParams = new URLSearchParams(location.search);
let id = urlParams.get('id');

//Appel de l'api 
fetch(`http://127.0.1:3000/api/products/${id}`)
    .then(function (response) {

        return response.json();
    })
    .then(function (data) {
        //On insert tout les éléments nécéssaires à l'affichage de la page produit
        productImg.innerHTML = ""
        let descriptionProduit = document.getElementById('description');
        let priceProduit = document.getElementById('price');
        let imgProduit = document.createElement('img');
        let titleProduit = document.querySelector('title');
        let titleH1Produit = document.querySelector('h1');
        titleProduit.innerText = data.name;
        titleH1Produit.innerText = data.name;
        imgProduit.src = data.imageUrl;
        productImg.appendChild(imgProduit);
        descriptionProduit.innerText = data.description;
        priceProduit.innerText = data.price;
        let produitColor = '<option value="">--SVP, choisissez une couleur --</option>';
        for (color of data.colors) {
            produitColor += `<option value="${color}">${color}</option>`;
        }
        document.getElementById('colors').innerHTML = produitColor;


        document.getElementById('addToCart').addEventListener('click', ajoutproductCart);


        //Création d'une fonction qui permet d'ajouter les produits au productCart
        function ajoutproductCart() {
           //Création de deux variable qui stock les valeur de la couleur et de la quantité
            let colorValue = document.getElementById("colors").value;
            let itemQuantity = document.getElementById("quantity").value;
            //Création d'une variable avec l'id , la couleur et la quantié des produits 
            var productCart = { id: data._id, color: colorValue, quantity: itemQuantity};
            //Si la quantité est inférieur ou égal à zero affiché le message suivant 
            if (itemQuantity <= 0) {
                alert('La quantité dois être strictement supérieur a zéro');
            }
            //Sinon vérifié la couleur
            else {
                //Si la couleur est vide alors affiché le message suivant
                if (colorValue == "") {
                    alert('La couleur doit être choisis');

                }
                //Sinon créer 2 variable 
                else {
                    //une qui récupere le string JSON
                    var jsonString = localStorage.getItem("productCart");
                    //cette variable re-parse le JSON en Objet JS
                    var retrievedObject = JSON.parse(jsonString);
                    // Si le retrievedObject est égale a zero ou est indéfini , crée un tableau
                    if (!retrievedObject || retrievedObject === 0) {
                        retrievedObject = [];

                    }
                    // créer un tableau vide pour stocker le localStorage
                    let producToSave = [];
                    // Variablé créé pour stocker la longueur 
                    let retrievedObjectNumbers = retrievedObject.length;
                    // Si retrievedObjectNumbers est supérieur a zero
                    if (retrievedObjectNumbers > 0) {
                        var updateCart = false;
                        //créé  une boucle 
                        for (let i = 0; i < retrievedObjectNumbers; i++) {
                            //Stockage de retrieve Object 
                            let produit = retrievedObject[i]
                            //Si l'objet existe deja dans le panier
                            if ((produit.id == productCart.id) && (produit.color == productCart.color)) {
                                //On ajoute la quantité au produit existant
                                productCart.quantity = parseInt(productCart.quantity) + parseInt(produit.quantity);
                                producToSave.push(productCart);
                                updateCart = true;
                            }
                            else {

                                producToSave.push(produit);

                            }


                        }
                        if (updateCart == false) { producToSave.push(productCart) }

                    } else { producToSave.push(productCart) };
                    if (confirm("Votre produit a été ajouté, voulez vous continuer vers votre panier ?") == true) {
                        window.location.href = "cart.html";
                    } else {
                        window.location.href = "index.html";
                    }


                    localStorage.setItem("productCart", JSON.stringify(producToSave));


                }
            }
        }


    })

    .catch(function (error) {
        console.log(error);
        console.log('error API');
        alert('Le serveur est indisponible pour le moment');
    })
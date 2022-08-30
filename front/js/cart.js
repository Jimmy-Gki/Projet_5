//Recuperer l'ID cart__items
const cartItems = document.getElementById("cart__items");

//Vérifier si le panier existe
const existingBasket = () => {
var productSaved = JSON.parse(localStorage.getItem('productCart'));
console.log(productSaved);

    //Si le localStorage est null ou vide
    if (productSaved === null || productSaved === [] || productSaved.length < 1) {
        return true;
    } else {
        return false;
    }
};
//Afficher le texte si le panier est vide
const emptyBasket = () => {
    let emptyText = document.createElement('p');
    emptyText.textContent = "Veuillez ajouter des articles au panier";
    cartItems.appendChild(emptyText)
}

//Retrouver les éléments de chaque items
const retrieveItemImage = (item) =>
  fetch(`http://localhost:3000/api/products/${item.id}`)
    .then((res) => res.json())
    .then((data) => data.imageUrl)
    .catch((err) => console.log("Il y a une erreur: ", err));

const retrieveItemTitle = (item) =>
  fetch(`http://localhost:3000/api/products/${item.id}`)
    .then((res) => res.json())
    .then((data) => data.name)
    .catch((err) => console.log("Il y a une erreur: ", err));

const retrieveItemPrice = (item) =>
  fetch(`http://localhost:3000/api/products/${item.id}`)
    .then((res) => res.json())
    .then((data) => data.price)
    .catch((err) => console.log("Il y a une erreur: ", err));

//Insérer les éléments dans le Dom
//Appeller l'image
const buildImageComponent = async (parent, itemToBuild) => {
    const imageWrapper = document.createElement("div");
    imageWrapper.classList.add("cart__item__img");
    
    const image = document.createElement("img");
    const itemImage = await retrieveItemImage(itemToBuild);
    image.setAttribute("src", itemImage);
    image.setAttribute("alt", "photographie d'un canapé");
    
    imageWrapper.appendChild(image);
    parent.appendChild(imageWrapper);
    };

//Construction des informations de l'article
const buildInfoDescriptionComponenent = async (parent, itemToBuild) => {
    const infoDescription = document.createElement("div");
    infoDescription.classList.add("cart__item__content__description");
    const infoTitle = document.createElement("h2");
    infoTitle.textContent = await retrieveItemTitle(itemToBuild);
    const infoColor = document.createElement("p");
    infoColor.textContent = itemToBuild.color;
    const infoPrice = document.createElement("p");
    infoPrice.textContent = `${
        (await retrieveItemPrice(itemToBuild)) * itemToBuild.quantity
    } €`;
    
    infoDescription.appendChild(infoTitle);
    infoDescription.appendChild(infoColor);
    infoDescription.appendChild(infoPrice);
    
    parent.appendChild(infoDescription);
};
    
//On ajoute les composants
const buildInfoSettingsComponent = (parent, itemToBuild) => {
    const infoSettings = document.createElement("div");
    infoSettings.classList.add("cart__item__content__settings");
    
    const settingsQuantity = document.createElement("div");
    settingsQuantity.classList.add("cart__item__content__settings__quantity");
    
    const settingsQuantityDisplay = document.createElement("p");
    settingsQuantityDisplay.textContent = `Quantité :`;
    
    const settingsQuantityDisplayInput = document.createElement("input");
    settingsQuantityDisplayInput.setAttribute("type", "number");
    settingsQuantityDisplayInput.classList.add("itemQuantity");
    settingsQuantityDisplayInput.setAttribute("name", "ItemQuantity");
    settingsQuantityDisplayInput.setAttribute("min", "1");
    settingsQuantityDisplayInput.setAttribute("max", "100");
    settingsQuantityDisplayInput.setAttribute("value", `${itemToBuild.quantity}`);
    
    settingsQuantity.appendChild(settingsQuantityDisplay);
    settingsQuantity.appendChild(settingsQuantityDisplayInput);
    
    const settingsDelete = document.createElement("div");
    settingsDelete.classList.add("cart__item__content__settings__delete");
    
    const settingsDeleteDisplay = document.createElement("p");
    settingsDeleteDisplay.classList.add("deleteItem");
    settingsDeleteDisplay.textContent = "Supprimer";
    
    settingsDelete.appendChild(settingsDeleteDisplay);
    
    infoSettings.appendChild(settingsQuantity);
    infoSettings.appendChild(settingsDelete);
    
    parent.appendChild(infoSettings);
};
    
/** Assembler la composition de l'article **/
const createItem = async (item) => {
    /** 1 - Construction du Wrapper principal **/
    const wrapper = document.createElement("article");
    wrapper.classList.add("cart__item");
    wrapper.setAttribute("data-id", item.id);
    wrapper.setAttribute("data-color", item.color);
    
    /** 2 - Construire et joindre l'image **/
    await buildImageComponent(wrapper, item);
    
    /** 3 - Création du wrapper info **/
    const infoWrapper = document.createElement("div");
    infoWrapper.classList.add("cart__item__content");
    
    /** 4 - On créer et on ajoute les infos du composant [description] **/
    await buildInfoDescriptionComponenent(infoWrapper, item);
    
    /** 5 - On créer et on ajoute les infos du composant [settings] **/
    buildInfoSettingsComponent(infoWrapper, item);
    
    /** 6 - On ajoute l'info Wrapper au wrapper principal et on insert les composants **/
    wrapper.appendChild(infoWrapper);
    cartItems.appendChild(wrapper);
};
    
//La logique du panier
const updateLocalStorage = (item) => {
    //On récupère le local storage
    const getLocalStorage = JSON.parse(localStorage.productCart);
    //On cherche l'élément correspondant via son id et sa couleur
    const elementToDelete = getLocalStorage.find((element) => element.id === item.id && element.color === item.color);
    const deleteIndex = getLocalStorage.indexOf(elementToDelete);
    getLocalStorage.splice(deleteIndex, 1);
    getLocalStorage.push(item);
    localStorage.setItem('productCart', JSON.stringify(getLocalStorage));
};

//Fonction qui permet de changer la quantité d'un article
const changeQuantity = async(element) => {
    const inputQuantity = parseInt(element.value);
    
    if(inputQuantity > 0) {
        //Variable qui contient 3 clés
        const object = {
            id: element.closest("article").dataset.id.toString(),
            quantity: inputQuantity.toString(),
            color: element.closest("article").dataset.color.toString(),
        }

        //On affiche la quantité
        const objectQuantityDisplay = element.closest("div").childNodes[0];
        objectQuantityDisplay.textContent = `Quantité: `;
        
        let articlePrice = parseInt(await retrieveItemPrice(object));
        const articlePriceDisplay = element.closest("div.cart__item__content").childNodes[0].childNodes[2];
        //On affiche le prix
        articlePriceDisplay.textContent = `${articlePrice * inputQuantity} €`;

        updateLocalStorage(object);

        calculPrixTotal();
    }
    else {
        window.alert("veuillez entrer une quantité valide ou supprimez l'article");
    }
};

    



//Création d'une fonction qui calcul le prix total du panier
const calculPrixTotal = async() => {

    const totalPrice = document.getElementById('totalPrice');
    const totalQuantity = document.getElementById('totalQuantity');
    
    //On attribut une valeur numérique de départ(donc 0) a total et qteTotal
    let panierTotalPrice = 0;
    let qteTotalpanierQuantitéTotale = 0;

    //On récupère le tableau du local storage
    const panierActuel = JSON.parse(localStorage.productCart);
    //On attend la réponse du panier pour modifier le contenu de l'item
    const arrayPrice = await panierActuel.map(async (item) => {
        const articlePrice = await retrieveItemPrice(item);
        //On parse la quantité pour la multiplier avec le prix pour avoir le prix total
        item.totalPrice = articlePrice * parseInt(item.quantity);
        console.log(item);
        return item;
        });

        //On créer une boucle for
    for (let i = 0; i < (await arrayPrice.length); i++) {
        //On attend la réponse de arrayPrice
        const element = await arrayPrice[i];
        //On ajoute le prix total de l'article au prix total du panier
        panierTotalPrice += element.totalPrice;
        //Même procédé avec la quantitée
        qteTotalpanierQuantitéTotale += parseInt(element.quantity);
        
    }

    totalQuantity.textContent = qteTotalpanierQuantitéTotale;
    totalPrice.textContent = panierTotalPrice;
        
    return totalPrice;

};

//Création d'une fonction qui permet d'enlever un produit du panier
const deleteElement = (element) => {
    const panier = JSON.parse(localStorage.getItem('productCart'));
    //On cible l'id et la couleur avec closest
    const articleDeleteId = element.closest("article").dataset.id;
    const articleDeleteColor = element.closest("article").dataset.color;

    //On cherche l'élément du panier correspondant avec l'élément présent dans le local storage
    const articleDelete = panier.find((element) => element.id === articleDeleteId && element.color === articleDeleteColor);
    //On supprime le produit sélectionné avec splice
    panier.splice(panier.indexOf(articleDelete), 1);
    //On vide le local storage
    localStorage.clear();

    localStorage.setItem("productCart", JSON.stringify(panier));

    //On cible le noeud entier pour pouvoir le retirer
    alert("Le produit a bien été supprimé du panier")
    element.closest("article").remove();

    if(localStorage.productCart === "[]") {
        emptyBasket();
    }

    calculPrixTotal();

}


//////////FORMULAIRE//////////

//On créé des Regex spécifique 
let regexEmail = new RegExp('^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$');
let regexAdress = new RegExp("^[0-9]{1,3}(?:(?:[,. ]){1}[-a-zA-Zàâäéèêëïîôöùûüç]+)+");
let regexCity = new RegExp("^[a-zA-Z ,.'-]+$");
let regexName = new RegExp("^[a-zA-Z ,.'-]+$");
let regexLastname = new RegExp("^[a-zA-Z ,.'-]+$");

//On récupère les ID correspondant aux éléments nécéssaires à l'envoie du formulaire
let firstName = document.getElementById("firstName");
let lastName = document.getElementById("lastName");
let adress = document.getElementById("address");
let city = document.getElementById("city");
let email = document.getElementById("email");

//On créé une variable qui permet de vérifier les champs et d'indiquer une erreur si les champs sont mal remplis
function formCheck() {

    ////On lui attribut un event Listener avec l'attribut "change" qui appelle les fonctions suivante et qui active le check de chaque champs
    firstName.addEventListener('change', function () {
        firstNameCheck(this)
    });

    lastName.addEventListener('change', function () {
        lastNameCheck(this)
    });

    adress.addEventListener('change', function () {
        adressCheck(this)
    });

    city.addEventListener('change', function () {
        cityCheck(this)
    });

    email.addEventListener('change', function () {
        emailCheck(this)
    });
    //Fonction qui contient une boucle qui permet de verifier via le regex si le champs est bien remplis avec les bon caractéres 
    function firstNameCheck(firstName) {
        let errorFirstName = document.getElementById("firstNameErrorMsg")
        if (regexName.test(firstName.value)) {
            errorFirstName.innerHTML = '';
        }
        //Sinon il affiche un message d'erreur dans le champs html error
        else {
            errorFirstName.innerHTML = 'Veuillez entrer votre prénom (uniquement en lettre)'       
        }
    };

    function lastNameCheck(lastName) {
        let errorLastName = document.getElementById("lastNameErrorMsg")
        if (regexLastname.test(lastName.value)) {
            errorLastName.innerHTML = '';
        }
        else { errorLastName.innerHTML = 'Veuillez entrer votre nom (uniquement en lettre)' }
    }

    function adressCheck(adress) {
        let errorAdress = document.getElementById("addressErrorMsg");
        if (regexAdress.test(adress.value)) {
            errorAdress.innerHTML = ''
        }
        else { errorAdress.innerHTML = 'Veuillez entrer votre adresse (ex:12 Rue Dupont)' }
    }

    function cityCheck(city) {
        let errorCity = document.getElementById("cityErrorMsg");
        if (regexCity.test(city.value)) {
            errorCity.innerHTML = ''
        }
        else { errorCity.innerHTML = 'Veuillez entrer votre ville (ex:  Marseille)' }
    }


    function emailCheck(email) {
        let errorEmail = document.getElementById("emailErrorMsg");
        if (regexEmail.test(email.value)) {
            errorEmail.innerHTML = ''
        }
        else { errorEmail.innerHTML = 'Veuillez entrer votre email (ex:Jean.Dupont@live.fr)' }
    }

}
formCheck()

//On créer une fonction permettant la validation du formulaire pour envoyer l'utilisateur vers la page confirmation
function formValidator(){

//On crée un addEventListener au click la fonction suivante se déclenche
document.getElementById("order").addEventListener("click", (e) =>{
    e.preventDefault();
    if (JSON.parse(localStorage.getItem('productCart')) === null || JSON.parse(localStorage.getItem('productCart')) === [] || JSON.parse(localStorage.getItem('productCart')).length < 1) {
        alert("Le panier est vide, veuillez ajouter des articles pour confirmer la commande");
    }
    else if (
        !regexName.test(firstName.value) ||
        !regexLastname.test(lastName.value) ||
        !regexEmail.test(email.value) ||
        !regexCity.test(city.value) ||
        !regexAdress.test(adress.value)
      ) {
        alert('Veuillez remplir correctement tous les champs du formulaire');
      }
    
    else {
//Création d'un tableau vide
let productFinal = [];
//On crée l'array depuis productSaved(localStorage)
for (let i in existingBasket){
productFinal.push(existingBasket[i].id);}

//on Créé une constante ou contenant l'objet contact et products (qui correspond au tableau productFinal)
const order = {
    contact : {
        firstName: firstName.value,
        lastName: lastName.value,
        address: adress.value,
        city: city.value,
        email: email.value,
    },
    products: productFinal,
} ;
//On créé une constante qui contient la methode Post pour l'utiliser dans l'API
const options = {
    method: "POST",
    body: JSON.stringify(order),
    headers: {
        'Accept': 'application/json', 
        "Content-Type": "application/json" },
  };
//On fait l'appel a L'api pour effectuer une requete de type POST avec la constante options
  fetch("http://127.0.1:3000/api/products/order", options)
  .then((response) => response.json())
  .then((data) => {
    //On vide le local storage
    localStorage.clear();
    //Utilisation de l'URL pour afficher l'ID du produit
    document.location.href = "confirmation.html?orderId="+data.orderId;
  })
  .catch((err) => {
    alert("Erreur survenue : " + err);
  });
}})
}

formValidator();


//On créer les event listener

const setQuantityModifiers = () => {
    const quantityModifiers = document.querySelectorAll(".itemQuantity");
    for (let i = 0; i < quantityModifiers.length; i++) {
        const element = quantityModifiers[i]
        element.addEventListener('change', () => changeQuantity(element));
    }

};
const setDeleteButton = () => {
    const deleteButtons = document.querySelectorAll(".deleteItem");
    for (let i = 0; i < deleteButtons.length; i++ ) {
        const element = deleteButtons[i];
        element.addEventListener("click", () => deleteElement(element));
    }
};


//Page builder

const pageBuilder = async() => {
    panier = JSON.parse(localStorage.productCart);
    for (let i = 0; i < panier.length; i++) {
        const element = panier[i];
        await retrieveItemImage(element);
        await createItem(element);
    }
};

//Création d'une fonction qui renvoie l'affichage général de la page
const main = async () => {
    //Si le panier existe alors on appelle les fonctions d'affichage
    if(existingBasket() === false) { 
        await pageBuilder();
        setQuantityModifiers();
        setDeleteButton();
        calculPrixTotal();
    }
    //Sinon, on affiche un message pour indiquer que le panier est vide
    else {
        emptyBasket();
    }
};
main();
  
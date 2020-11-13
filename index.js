
//initializing the variables
const cartButton=document.querySelector(".cart-btn");//selecting the cart button
const closeCart=document.querySelector(".close-cart");//selecting the element to close the cart

const clearCartButton=document.querySelector(".clear-cart");//to clear the cart data
const cartData=document.querySelector(".cart-elements");
const cartAside=document.querySelector(".cart-aside");
const cartTotal=document.querySelector(".cart-total");
const cartItemsNum=document.querySelector(".cart-item");
const cartContent=document.querySelector(".cart-content");
const productsData=document.querySelector(".products-view");
let cart=[]//the available cart data
let cartButtonData=[];
async function getProducts(){//get the product data
try{
   let result=await fetch('products.json')
   let data=await result.json();
   let products=data.items;
   products=products.map(item=>{
       const {title,price}=item.fields;
       const {id}=item.sys;
       const image=item.fields.image.fields.file.url;
       return {title,price,id,image}
   })
   return products;
}catch(error){
   console.log(error);
}
}


function displayProducts(products){//displaying the data of the products
let result='';
products.forEach(product=>{
   result+=`
   <div class="product-data">
               <div class="image-container">
                   <img class="product-img" src=${product.image} alt=${product.title}/>
                   <button class="add-to-cart-btn" id=${product.id}>
                       <img src="images/shopping-cart.svg" alt="Cart"/>
                       Add to Cart
                   </button>
               </div>
               <h3>
                   ${product.title}
               </h3>
               <h4>$ ${product.price}</h4>
           </div>
   `;
})
productsData.innerHTML=result;
}


function getCartButton(){
const addToCartBtn=[...document.querySelectorAll(".add-to-cart-btn")];
cartButtonData=addToCartBtn;
addToCartBtn.forEach(button=>{
   let id=button.id;
   let inCart=cart.find(item=>item.id===id);
   if(inCart){
       button.innerHTML='<img src="images/shopping-cart.svg" alt="Cart"/>In Cart';
       button.disabled=true;
   }
       button.addEventListener("click",()=>{
           event.target.innerHTML='<img src="images/shopping-cart.svg" alt="Cart"/>In Cart';
           event.target.disabled=true;

           //get the products from the localstorage
           let cartItem={...getProductsFromStorage(id),amount:1};
           //add to the cart array
           cart=[...cart,cartItem];
           //storing to the localStorage cart key
           saveToCartStorage(cart);
           //set the cart values
           setCartValues(cart);
           addCartItem(cartItem);
       })
})
}
function setCartValues(cart){
   let total=0;
   let itemTotal=0;
   cart.map(item=>{
       total+=item.price*item.amount;
       itemTotal+=item.amount
   })
   cartTotal.innerText=parseFloat(total.toFixed(2));
   cartItemsNum.innerText=itemTotal;
}

function addCartItem(item){
   const div=document.createElement("div");
   div.classList.add('cart-item-data');
   div.innerHTML=`
   <div class="details">
   <img src=${item.image} alt="cart data"/>
                   <div class="data-details">
                       <h4>${item.title}</h4>
                       <h5>$ ${item.price}</h5>
                       <span class="remove" data-id=${item.id}>remove</span>
                   </div></div>
                   <div class="update-cart"><img class="increment" data-id=${item.id} src="images/angle-up.svg"/>
                       <span class="cart-item-num">${item.amount}</span>
                       <img class="decrement" data-id=${item.id} src="images/angle-down.svg"/>
                   </div>
   `;
   cartContent.appendChild(div);
   showCart();
}
function setUpApp(){
   cart=getProductsFromCart();
   setCartValues(cart);
   populateCart(cart);
   closeCart.addEventListener("click",()=>{
       cartAside.classList.remove('transparentBcg');
   cartData.classList.remove('showCart');
   })
}
function showCart(){
   cartAside.classList.add('transparentBcg');
   cartData.classList.add('showCart');
}
cartButton.addEventListener("click",()=>{
   cartAside.classList.add('transparentBcg');
   cartData.classList.add('showCart');
});
function populateCart(cart){
   cart.forEach(item=>{
       addCartItem(item)
   })
}

function cartLogic(){
clearCartButton.addEventListener("click",()=>{
   //clear the cart
   let cartItems=cart.map(item=>item.id)
   cartItems.forEach(id=>removeItem(id));
   while(cartContent.children.length>0){
       cartContent.removeChild(cartContent.children[0])
   }
   cartAside.classList.remove('transparentBcg');
   cartData.classList.remove('showCart');
})

cartContent.addEventListener("click",event=>{
   if(event.target.classList.contains("remove")){
       let removeItemElement=event.target;
       let id=removeItemElement.dataset.id;
       cartContent.removeChild(removeItemElement.parentElement.parentElement.parentElement)
       removeItem(id);
   }
  else if(event.target.classList.contains("increment")){
       let increment=event.target;
       let id=increment.dataset.id;
       let tempItem=cart.find(item=>item.id===id);
       tempItem.amount=tempItem.amount+1;
       saveToCartStorage(cart);
       setCartValues(cart);
       increment.nextElementSibling.innerText=tempItem.amount;
   }
   else if(event.target.classList.contains("decrement")){
       let decrement=event.target;
       let id=decrement.dataset.id;
       let tempItem=cart.find(item=>item.id===id);
       tempItem.amount=tempItem.amount-1;
       if(tempItem.amount>0){
           saveToCartStorage(cart);
           setCartValues(cart);
           decrement.previousElementSibling.innerText=tempItem.amount;
           }
           else{
               cartContent.removeChild(decrement.parentElement.parentElement)
               removeItem(id);
           }
   }
})
}

function removeItem(id){
   cart=cart.filter(item=>item.id!==id);
   setCartValues(cart)
   saveToCartStorage(cart)
   let buttons=getSingleButton(id);
   buttons.disabled=false;
   buttons.innerText="Add to Cart"
}
function getSingleButton(id){
    return cartButtonData.find(button=>button.id===id);
}
function saveProducts(products){
   localStorage.setItem("products",JSON.stringify(products))
}


function getProductsFromStorage(id){
   let products=JSON.parse(localStorage.getItem("products"))
   return products.find(product=>product.id===id);
}

function saveToCartStorage(cart){
   localStorage.setItem("cart",JSON.stringify(cart))
}

function getProductsFromCart(){
  return localStorage.getItem("cart")?JSON.parse(localStorage.getItem("cart")):[];
}
document.addEventListener("DOMContentLoaded",()=>{
    getProducts().then(products=>{
        displayProducts(products);
        saveProducts(products);
        setUpApp();
    }).then(()=>{   
        getCartButton();
        cartLogic();
    })
})
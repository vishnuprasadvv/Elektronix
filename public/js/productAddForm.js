const addProductForm = document.getElementById('addProductForm');
const productName = document.getElementById('productName');
    const errorMsgName= document.getElementById('errorMsgName');
    const qty= document.getElementById('qty');
    const errorMsgQty= document.getElementById('errorMsgQty');
    const sellingPrice= document.getElementById('price');
    const errorMsgPrice= document.getElementById('errorMsgPrice');
    const orgPrice= document.getElementById('orgPrice');
    const errorMsgOrgPrice= document.getElementById('errorMsgOrgPrice');
    const brand= document.getElementById('brand');
    const errorMsgBrand= document.getElementById('errorMsgBrand');
    const color= document.getElementById('color');
    const errorMsgColor= document.getElementById('errorMsgColor');
    const description= document.getElementById('description');
    const errorMsgDescription= document.getElementById('errorMsgDescription');

addProductForm.addEventListener('submit',(e)=>{
   
    if(productName.value.length<=0){
        e.preventDefault();
        errorMsgName.innerText= 'Please enter product name';
    }else{
        errorMsgName.innerText= '';  
    }
    if(qty.value<=0){
        e.preventDefault();
        errorMsgQty.innerText= "Please enter a valid quantity";
    }else{
        errorMsgQty.innerText= "";
    }
    if(sellingPrice.value<=0){
        e.preventDefault();
        errorMsgPrice.innerText= "Please enter a valid price";
    }else{
        errorMsgPrice.innerText= ""; 
    }
    
    if(orgPrice.value<=0){
        e.preventDefault();
        errorMsgOrgPrice.innerText="Please enter a valid price"
    }
    if(parseInt(orgPrice.value)<parseInt(sellingPrice.value)){
        e.preventDefault();
        errorMsgPrice.innerText= "Selling price is higher than original price"
    }else{
        errorMsgPrice.innerText= "";
    }

    if(brand.value.length<=0){
        e.preventDefault();
        errorMsgBrand.innerText= 'Please enter the brand name'
    }else{
        errorMsgBrand.innerText= "";
    }

    if(color.value.length<=0 ){
        e.preventDefault()
        errorMsgColor.innerText= "Please enter the colour";
    }else{
        errorMsgColor.innerText= "";
    }

    if(description.value.length<=0){
        errorMsgDescription.innerText= "Please enter the description of the product"
    }else{
        errorMsgDescription.innerText= ""
    }

})

function CheckName(elem){
    if(elem.value.length<=0){
        errorMsgName.innerText="Please enter product name"
    }else{
        errorMsgName.innerText=""
    }
}



setError = (element, message) => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector(".warn");
    errorDisplay.innerText = message;
  };

const allowedExtensions = /(\.jpg|\.jpeg|\.png|\.webp)$/i;
let imageIn = false;

// Check if at least one file is selected
for (const img of document.querySelectorAll('#photoProduct')) {
  if (img.files.length > 0) {
    imageIn = true;
    break;
  }
}

if (!imageIn) {
  setError(photo, "This field is empty");
  error = true;
} else {
  for (const img of document.querySelectorAll('#photoProduct')) {
    if (!allowedExtensions.test(img.files[0].name)) {
      setError(photo, 'Invalid file type. Allowed file types are: JPG, JPEG, PNG, and WEBP');
    } else {
      setError(photo, '');
    }
  }
}
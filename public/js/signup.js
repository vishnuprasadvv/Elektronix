const signupFormSubmit = document.getElementById('signupFormSubmit');

signupFormSubmit.addEventListener('submit',(e)=>{
 const email = document.getElementById('email');
 const password = document.getElementById('password');  
 const errorMsgPass = document.getElementById('alert-password')
 const name= document.getElementById('name')
 const errorMsgName = document.getElementById('errorMsgName')
const mobile = document.getElementById('mobile');
const errorMsgMobile = document.getElementById('errorMsgMobile');
 if(name.value.length<=0 ){
   e.preventDefault()
  errorMsgName.innerText = " Please enter your name";
 }
 if( email.value.length <= 0 ){
  e.preventDefault();
  document.getElementById('errorMsgEmail').innerText= "Please enter email address";
}

 if( mobile.value.length <= 0 ){
  e.preventDefault();
  errorMsgMobile.innerText= "Please enter your mobile number";
}

if(password.value.length <=0 ){
  e.preventDefault()
  document.getElementById('alert-password').innerText= "Please enter password";
}
if(document.getElementById('confirm-password').value.length <=0 ){
  e.preventDefault()
  document.getElementById('alert').innerText = 'Please fill the field'
}
if(document.getElementById('errorMsgEmail').innerText || document.getElementById('alert-password').innerText){
  e.preventDefault();
}
}
)

function nameValidation (elem){
  if(elem.value.length<=0){
    document.getElementById('errorMsgName').innerText= "Please enter your name"
  }else{
    document.getElementById('errorMsgName').innerText= ""
  }
}

function mobileValidation (elem) {
  const phoneNumber = elem.value.trim();
  const pattern = /^\d{10}$/;
  const isValid = pattern.test(phoneNumber);
  document.getElementById('errorMsgMobile').innerText = isValid ? '' : 'Please enter a valid 10-digit phone number.';
  
}

let password= document.getElementById('password')
  function check(elem){
      if(elem.value.length>0){
        if(elem.value!=password.value){
          document.getElementById('alert').innerText= "Confirm password does not match";
        }else{
          document.getElementById('alert').innerText= "";
        }
      }

}
function passwordCheck(elem){
  if(elem.value.length<6){
        document.getElementById('alert-password').innerText= "Password length must be minimum 6 characters";
      }else if (elem.value.length>15){
        document.getElementById('alert-password').innerText= "Password length must be in between 6-15 characters";
      } else if(elem.value.search(/[a-z]/) < 0) { 
        document.getElementById('alert-password').innerText= "Password must contain lowecase letter";
        } else if(elem.value.search(/[A-Z]/) < 0) { 
        document.getElementById('alert-password').innerText= "Password must contain at least one uppercase letter";
        } else if(elem.value.search(/[0-9]/) < 0) { 
          document.getElementById('alert-password').innerText= "Password must contain at least one number";
        } else{
          document.getElementById('alert-password').innerText= "";
        }
}


function validateEmailInput() {
  const emailInput = document.getElementById('email').value;
  const errorMsgEmail = document.getElementById('errorMsgEmail');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   
  if (emailRegex.test(emailInput)) {
    errorMsgEmail.innerText = ""; // Email is valid
  } else {
    errorMsgEmail.innerText = "Please enter a valid email address.";
  }
}

const icon = document.getElementById('togglePassword');

/* Event fired when <i> is clicked */
icon.addEventListener('click', function() {
  if(password.type === "password") {
    password.type = "text";
    icon.classList.add("fa-eye");
    icon.classList.remove("fa-eye-slash");
  }
  else {
    password.type = "password";
    icon.classList.add("fa-eye-slash");
    icon.classList.remove("fa-eye");
  }
});




 
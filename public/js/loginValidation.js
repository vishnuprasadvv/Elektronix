const formSubmit = document.getElementById('formSubmit')

formSubmit.addEventListener ('submit', (e)=>{
  const email= document.getElementById('email');
  const password = document.getElementById('password')
  
  if( email.value.length <= 0 ){
    e.preventDefault();
    document.getElementById('errorMsgEmail').innerText= "Please enter email address";
  }
  if(password.value.length<=0){
    e.preventDefault()
    document.getElementById('alert-password').innerText= "Please enter password";
  }

  if(document.getElementById('errorMsgEmail').value.length>0 && document.getElementById('alert-password').value.length>0){
    e.preventDefault();
  }
})

function passwordCheckLogin(elem){
    if(elem.value.length<=0){
          document.getElementById('alert-password').innerText= "Please enter your password";
        }else{
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
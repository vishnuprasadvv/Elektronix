
		 const numbersOnlyRegex = /^[0-9]/ ;
		 const form = document.getElementById('addAddressForm');
		 const name = document.getElementById('name');
		 const mobile = document.getElementById('mobile');
		 const address = document.getElementById('address');
		 const pincode = document.getElementById('pincode');
		 const locality = document.getElementById('locality');
		 const district = document.getElementById('district');
		 const state = document.getElementById('state');
		 const country = document.getElementById('country');

		 form.addEventListener('submit',(e)=>{
			
			
			const nameVal = name.value.trim();
			const mobileVal = mobile.value.trim();
			const addressVal = address.value.trim();
			const pincodeVal = pincode.value.trim();
			const localityVal = locality.value.trim();
			const districtVal = district.value.trim();
			const countryVal = country.value.trim();
			const stateVal = state.value.trim();
            let isError = false;
			//first name
            e.preventDefault()
			if(nameVal===''){
				setErrorMsg(name,'Please enter name')
                isError = true;
			}else{
				setErrorMsg(name,'')
			}

			//mobile
			let mobileRegex = /^\d{10}$/;
			if(mobileVal ===''){
				setErrorMsg(mobile,'Please enter a mobile number')
				isError = true;
			}else if(!mobileRegex.test(mobileVal)){
				setErrorMsg(mobile,'Please enter a valid number')
				isError = true;
			}else{
				setErrorMsg(mobile,'');
                
			}
			

			//pincode 
			if(pincodeVal===''){
				setErrorMsg(pincode,'Enter a pincode');
				isError = true;
			}else if(!numbersOnlyRegex.test(pincodeVal)){
				setErrorMsg(pincode,'Please enter a valid pincode');
				isError = true;
			}else{
				setErrorMsg(pincode,'')
			}
			//locality 
			if(localityVal ==''){
				setErrorMsg(locality,'Please enter locality');
				isError= true;
			}else{
				setErrorMsg(locality,'')
			}
			//address
			if(addressVal ==''){
				setErrorMsg(address,'Please enter address');
				isError= true;
			}else{
				setErrorMsg(address,'')
			}

			//district 
			if(districtVal ==''){
				setErrorMsg(district,'Please enter district');
				isError= true;
			}else{
				setErrorMsg(district,'')
			}
			//state 
			if(stateVal ===''){
				setErrorMsg(state,'Please enter state');
				isError= true;
			}else{
				setErrorMsg(state,'')
			}
			
			//country
			if(countryVal ===''){
				setErrorMsg(country,'Please enter country');
				isError= true;
			}else{
				setErrorMsg(country,'')
			}


            if(!isError){
                form.submit()
            }
            
		 });

		 function setErrorMsg (element,message){
			const inputParentDiv = element.parentElement;
			const displayErrorMsg = inputParentDiv.querySelector('.errorMsg');
			displayErrorMsg.innerText = message;
		 }

		 


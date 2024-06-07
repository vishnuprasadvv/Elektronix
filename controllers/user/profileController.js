const UserCollection = require('../../models/user')
const AddressCollection= require('../../models/address')
const OrdersCollection= require('../../models/orders')
const ProductVariationCollection = require('../../models/productVariation')
const bcrypt = require('bcrypt')
const handleGetProfile = async(req,res)=>{
    try {
        const userLogged= req.session.isAuth;
        const userId= req.session.user
        const user = await UserCollection.findById(userId)
        
        res.render('profile' ,{title:"Profile",userLogged,user})
    } catch (error) {
        console.log(error) 
    }
}
//address
const handleGetAddresses = async (req,res)=>{
    const userLogged= req.session.isAuth;
    const userId= req.session.user
    const user = await UserCollection.findById(userId)
    const addresses= await AddressCollection.find({user:userId})
    const success = req.flash('success')
    const alert = req.flash('alert')
    res.render('profile-address' , {title:"Addresses", success,userLogged,user,addresses,alert})
}
const handleGetAddAddress= async (req,res)=>{
    const userLogged= req.session.isAuth;
    const user = await UserCollection.findById(req.params.id)
    
    res.render('add-address',{title:"Add-Address",userLogged,user})
}

const handlePostAddAddress=async(req,res)=>{
    const {name,mobile,address,pincode,locality,district,state,activeradio,country} = req.body
    try {
        let address_type;
        if(activeradio=='home'){
            address_type= 'home'
        }else{
            address_type= 'work'
        }
        const userAddress = new AddressCollection({
            name,mobile,address,pincode,locality,district,state,address_type,user:req.params.id,country
        })

        const userAddressData = await userAddress.save();
        req.flash('success', "New address added successfully!")
        res.redirect('/profile/addresses')

    } catch (error) {
        console.log(error)
    }
}

//edit address
const handleGetEditAddress = async (req,res)=>{
    const userLogged= req.session.isAuth;
    const address = await AddressCollection.findById(req.params.id).populate('user')
    
    res.render('profile-address-edit',{title:"Edit Address", userLogged,address})
}
const handlePostEditAddress = async (req,res)=>{
    const {name,mobile,address,pincode,locality,district,state,activeradio,country} = req.body;
    let address_type;
    if( activeradio =='home'){
        address_type='home'
    }else{
        address_type='work'
    }
    try {
        const addressId = req.params.id;
        const addressUpdate = await AddressCollection.findByIdAndUpdate(addressId,{name,mobile,address,pincode,locality,district,state,address_type,country},{upsert:true})
        console.log('address updated success')
        req.flash('success','Address updated!')
        res.redirect('/profile/addresses')
    } catch (error) {
        console.log(error)
    }
}

const handleDeleteAddress = async(req,res)=>{
    const {id} = req.params;
    try {
        await AddressCollection.findByIdAndDelete(id);
        console.log('address deleted');
        req.flash('success','Address deleted successfully');
        res.redirect('/profile/addresses')
        
    } catch (error) {
        console.log(error)
    }
}
const handleGetSecurity = async(req,res)=>{
    const userId = req.session.user;
    const userLogged= req.session.isAuth;
    const user= await UserCollection.findById(userId)
    const alert = req.flash('alert')
    const success = req.flash('success')
    res.render('profile-security',{title:'Security',user,userLogged,alert,success})
}

const handlePostSecurity = async(req,res)=>{
    const {currentPassword, newPassword,confirmPassword} = req.body;
    const findUser = await UserCollection.findById(req.params.id);
    try {
        
        let checkIsPassMatch = await bcrypt.compare(currentPassword, findUser.password)
        if(checkIsPassMatch){
            //check new password and confirm password
            if( newPassword != confirmPassword){
                console.log('password mismatch')
                res.redirect('/profile/security')
            }else{
                const hashedNewPass = await bcrypt.hash(newPassword,5)
                const updatePass= await UserCollection.findByIdAndUpdate(req.params.id,{password :hashedNewPass},{upsert:true})
                console.log('password updated successfully')
                req.flash('success',"Password changed successfully!")
                res.redirect('/profile/security')
            }
        }else{
            console.log('invalid credentials')
            req.flash('alert', 'Invalid credentials')
            res.redirect('/profile/security')
        }
       

    } catch (error) {
        console.log(error)
    }
}



module.exports =  {handleGetProfile ,
    handleGetAddAddress,
    handlePostAddAddress,
    handleGetAddresses,
    handleGetEditAddress,
    handlePostEditAddress,
    handleGetSecurity,
    handlePostSecurity,
    handleDeleteAddress
   
}
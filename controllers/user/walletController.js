const WalletCollection = require('../../models/wallet')

//wallet 

const handleGetWallet = async(req,res)=>{
    const {user}= req.session;
    const wallet = await WalletCollection.findOne({user})
    
    //pagination
    let page=1;
    if(req.query.page){
        page = parseInt(req.query.page);
    }
   
    //set item limits per page
    const limit = 6;
    const totalItemsCount = await WalletCollection.findOne({userId:user}).countDocuments();
 
    const success= req.flash('success')
    const userLogged= req.session.isAuth;
    res.render('profile-wallet',{title:'Wallet',success,userLogged,wallet,totalPages : Math.ceil(totalItemsCount/limit),
    currentPage : page,
    totalItemsCount,
    limit,})
}

module.exports={
    handleGetWallet
}
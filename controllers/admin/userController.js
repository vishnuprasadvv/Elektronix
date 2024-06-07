const userCollection = require('../../models/user')

const handleGetUser = async(req,res)=>{

    const alert =req.flash('alert')
    const success = req.flash('success')
    //pagination 
    
    let page=1;
    if(req.query.page){
        page = parseInt(req.query.page);
    }
   
    //set item limits per page
    const limit = 6;
    const totalItemsCount = await userCollection.find({}).countDocuments();
    const users = await userCollection.find({}).limit(limit).skip((page-1)*limit).exec();
   await res.render('admin/users',{title:'users list',users,alert,success,totalPages : Math.ceil(totalItemsCount/limit),
   currentPage : page,
   totalItemsCount,
   limit})
}

const handlePostUnblockUser= async(req,res)=>{
    const userId=req.params.id  
    try {
        const users = await userCollection.findByIdAndUpdate({_id:userId},{$set:{status:true}})  
        req.flash('success','user unblocked')
        res.redirect('/admin/users')
    } catch (error) {
        console.log(error)
    } 

}

const handlePostBlockUser=  async(req,res)=>{
    const userId= req.params.id    
 const users = await userCollection.findByIdAndUpdate({_id:userId},{$set:{status:false}})  
 req.flash('success','user blocked')
 res.redirect('/admin/users')
}

module.exports = {
    handleGetUser,
    handlePostUnblockUser,
    handlePostBlockUser
}
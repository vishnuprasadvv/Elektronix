const WishlistCollection= require('../../models/wishlist')
const ProductVarCollection = require('../../models/productVariation')


const handleGetWishlist =async (req,res)=>{
    const userLogged= req.session.isAuth;
    const {user} = req.session;
    //flash 
    const success = req.flash('success');
    const alert = req.flash('alert')
    const warning = req.flash('warning')
    const wishlistItems = await WishlistCollection.findOne({userId:user}).populate({path:'items.product_var_id',populate:{path:'product'}})
    res.render('wishlist' ,{title:"Wishlists",userLogged,wishlistItems,success,alert,warning})
    
}

const handlePostAddWishlist = async(req,res)=>{
    try {
        const product_var_id = req.params.id;
        const {user} = req.session;
        const productVar = await ProductVarCollection.findById(product_var_id).populate('product')
        const product_id = productVar.product._id;
        if(user){
            let wishlistitem = await WishlistCollection.findOne({userId:user});

            if(!wishlistitem){
              wishlistitem = new WishlistCollection({userId:user})
            }

             const existingProduct = wishlistitem.items.find(item=> item.product_var_id.equals(product_var_id));
             if(existingProduct){
                 console.log('product already wishlisted')
                 req.flash('warning','product already wishlisted!')
             }else{
                wishlistitem.items.push({product_var_id}); 
                 console.log('item added to wishlist');
                 req.session.wishlist_qty ++;
                 req.flash('success','product added to wishlist!')
                
             }
            await wishlistitem.save();
            
            res.redirect('/view?id='+product_id);
           
        }else{
            req.flash('alert','Please login')
            res.redirect('/login')
        }
   
    } catch (error) {
        console.log(error)
    }
}

const handleDeleteWishlist = async(req,res)=>{
    try {
        const {user}= req.session;
        const wishlist_item_id = req.params.id;
        const findWishlistItem = await WishlistCollection.findOneAndUpdate({userId:user},{$pull:{items:{_id:wishlist_item_id}}})
        console.log('item removed from wishlist');
        req.flash('warning','Item removed from wishlist!');
        req.session.wishlist_qty --;
       res.redirect('/wishlist');
    } catch (error) {
        console.log(error)
    }
}
module.exports = {handleGetWishlist,handlePostAddWishlist,handleDeleteWishlist}
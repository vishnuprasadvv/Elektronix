const ProductVarCollection = require('../../models/productVariation');
const CartCollection = require('../../models/cart');
const CouponCollection = require('../../models/coupons')
    
const handleGetCart = async(req,res)=>{
    const {coupon}= req.session
    const {user}= req.session;
    try {
        
        const cartItems = await CartCollection.findOne({userId:user}).populate({path:'items.product_var_id',populate:{path:'product'}});
        let cart;
        let totalEachItemPrice;
        if(!cartItems) {
            cart=[];
        }else{
            cart= cartItems.items;
            totalEachItemPrice = cart.map(item => item.product_var_id.product.price * item.quantity )
           
        }
        if(!totalEachItemPrice){
            totalEachItemPrice=[];
        }
        let subTotal = totalEachItemPrice.reduce((acc,val)=> val+acc,0)
//check out of stock products present or not
        let check_out_of_stock=1;
       for(let item of cart){
         check_out_of_stock  *= item.product_var_id.product.quantity 
       }
       //coupon apply 
       let discountAmount = 0;
       const findCoupon = await CouponCollection.findOne({code:coupon})
       
       if(!findCoupon){
           console.log('coupon not exist')
       }else{
        if(findCoupon.discountType=='percentage'){
            discountAmount= subTotal * (findCoupon.discountValue/100)
        }else{
            discountAmount = findCoupon.discountValue
        }
       }
       overallTotalPrice = subTotal - discountAmount;
       console.log(overallTotalPrice)
        
        const userLogged= req.session.isAuth;
        const success = req.flash('success') 
        const info = req.flash('info')
        const error = req.flash('error')
        res.render('cart' ,{title:"Cart",userLogged,cart,totalEachItemPrice,subTotal,overallTotalPrice,discountAmount,success,error,cartItems,check_out_of_stock,info})
    } catch (error) {
        console.log(error)
    }
    
}

const handlePostAddCart = async (req,res)=>{
    const userId  = req.session.user;
    const product_var_id = req.params.id;
    let quantity = req.body.quantity? req.body.quantity   : 1;
    const productVar = await ProductVarCollection.findById(product_var_id).populate('product')
    const product_id = productVar.product._id;

    //check product available qty 
    if(productVar.product.quantity < quantity){
        quantity= productVar.product.quantity
    }
     
    try {
        if(userId){
            let cart = await CartCollection.findOne({ userId })

            if (!cart) {
                cart = new CartCollection({ userId }); 
                console.log('new cart created')
            }
            const existingItem = cart.items.find(item => item.product_var_id.equals(product_var_id));
            //check cart item qunatity 
    
            if (existingItem ) {
                if(productVar.product.quantity<=existingItem.quantity){
                    req.flash('alert','Product stock limit exceeded, and product already in cart')
                    
                }else{

                    if(existingItem.quantity<10){
                        existingItem.quantity += parseInt(quantity);
                    }else{
                        existingItem.quantity = existingItem.quantity;
                    }
                    req.flash('success','Item already in cart, quantity increased!')
                }
                
            } else {
                
                cart.items.push({ product_var_id, quantity:parseInt(quantity) });
               
                req.session.cart_qty ++;
                req.flash('success','Item added to cart!')
            }
    
            await cart.save();
            console.log('Item added to cart');
            
            res.redirect('/view?id='+ product_id);
        }else{
            req.flash('alert',"Please login") 
            res.redirect('/login')
        }
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error adding item to cart' });
    }
}

const handleDeleteItemCart = async(req,res)=>{
    
    try {
        const userId = req.session.user
        const _id = req.params.item;
        const item = await CartCollection.findOneAndUpdate({userId},{$pull:{items:{_id}}})
        req.flash('info',"Item removed from cart!")
        req.session.cart_qty --;
        res.redirect('/cart')
        
    } catch (error) {
        console.log(error)
    }
}

const handleUpdateItemCart = async (req,res)=>{
    const _id = req.params.item;
    const userId= req.session.user;
    const action = req.query.action;
    console.log(action)
    try {
        const findCartItems = await CartCollection.findOne({userId}).populate({path:'items.product_var_id',populate:{path:'product'}})
        if(action == 'minus'){
            const findItem = findCartItems.items.find(item=>item._id.equals(_id));
            if(!findItem){
                console.log('item not found')
            }else if(findItem.quantity==1){
                 findCartItems.items.pull(findItem._id=_id)
                 await findCartItems.save();
                console.log('item deleted from cart')
                req.flash('success','Item deleted from cart')
                res.redirect('/cart')
            }
            else{
                findItem.quantity --;
                findCartItems.items[findItem._id==_id]=findItem
                await findCartItems.save()
                console.log(findCartItems)
                console.log('item minus')
                req.flash('success',"Item quantity changed");
                res.redirect('/cart')
            }
        }
        if(action == 'plus'){
            const findItem = findCartItems.items.find(item=>item._id.equals(_id));
            if(!findItem){
                console.log('item not found')
            }else{
                let productQty = findItem.product_var_id.product.quantity;
                if(productQty<=findItem.quantity){
                    req.flash('error','product is out of stock')
                    console.log('product is outofstock , cannot increment product qty')
                    res.redirect('/cart')
                }else{
                    findItem.quantity ++;
                    findCartItems.items[findItem._id==_id]=findItem;
                    await findCartItems.save()
                    console.log(findCartItems)
                    console.log('item plus');
                    req.flash('success',"Item quantity changed");
                    res.redirect('/cart')
                }
                
            }
        }
    } catch (error) {
        console.log(error)
    }
}
module.exports = {handleGetCart ,
    handlePostAddCart,
    handleDeleteItemCart,
    handleUpdateItemCart
}
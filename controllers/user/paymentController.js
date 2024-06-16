require('dotenv').config()
const {STRIPE_PUBLISHABLE_KEY,STRIPE_PRIVATE_KEY} = process.env
const CartCollection = require('../../models/cart')
const OrderCollection = require('../../models/orders')
const ProductsCollection = require('../../models/products')

const stripe = require('stripe')(STRIPE_PRIVATE_KEY) 

// const handleCreateCheckOut = async(req,res)=>{ 
   
   
// const storeItems = await CartCollection.findOne({userId:req.session.user}).populate({path:'items.product_var_id',populate:{path:'product'}})
// console.log(storeItems.items)    
// const session = await stripe.checkout.sessions.create({
//         payment_method_types:['card'],
//         mode:'payment',
//         line_items:storeItems.items.map(item=>{
//             console.log(item)
//             return {
//                 price_data:{
//                     currency:'inr',
//                     product_data: {
//                         name: item.product_var_id.product.name
//                     },
//                     unit_amount:item.product_var_id.product.price *100
//                 },
//                 quantity:item.quantity
//             }
//         }), 
//         success_url:'http://localhost:5000/success?session_id={CHECKOUT_SESSION_ID}',
//         cancel_url:'http://localhost:5000/cart',
//     })
//     res.json({url:session.url}) 
// }

const successPaymentRoute = async (req,res)=>{
    const { session_id ,order_id} = req.query;
    const cart_id = req.query.cart_id;
    console.log(session_id, order_id,cart_id)

    try {
        // Retrieve the checkout session from Stripe
        const session = await stripe.checkout.sessions.retrieve(session_id);
        const findOrder = await OrderCollection.findById(order_id)
        console.log(findOrder)
        if(findOrder){
            if(session.payment_status=='paid'){
                const order = await OrderCollection.findByIdAndUpdate(order_id,{payment_status:'completed',status:'placed'}).populate({path:'items.product_var_id',populate:{path:'product'}});
                console.log('order payment status updated')
                req.flash('success','order placed')
                //empty cart
                if(cart_id){
                    const removeCartItem = await CartCollection.findByIdAndUpdate(cart_id,{items:[]})
                    req.session.cart_qty=0;
                    //reduce product qty 
                    for( let product of order.items){
                     let reduceProductQty = await ProductsCollection.findByIdAndUpdate(product.product_var_id.product._id,{$inc:{quantity:-product.quantity}})
                    }
                    res.redirect('/cart')
                }else{
                    req.flash('success','Order payment completed')
                    res.redirect('/profile/orders')
                }
            }
        }

    } catch (error) {
        res.status(500).send({ error: error.message });
        console.log(error)
    }
}

//payment failed 
const paymentFailedRoute = async (req,res)=>{
    req.flash('alert','Order failed')
    const {order_id}= req.query;
    req.flash('payment failed for order ')
    res.redirect('/cart')
}

module.exports ={
    successPaymentRoute,
    paymentFailedRoute
} 
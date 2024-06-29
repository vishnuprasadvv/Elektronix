const CartCollection = require("../../models/cart");
const UserCollection = require('../../models/user')
const AddressCollection = require('../../models/address')
const OrdersCollection = require('../../models/orders')
const ProductsCollection = require('../../models/products')
const CouponCollection = require('../../models/coupons')
const WalletCollection = require('../../models/wallet')
require('dotenv').config()
const { STRIPE_PUBLISHABLE_KEY, STRIPE_PRIVATE_KEY } = process.env
const stripe = require('stripe')(STRIPE_PRIVATE_KEY)

const handleGetCheckout = async (req, res) => {
    const userLogged = req.session.isAuth;
    const cart = await CartCollection.findById(req.params.id).populate('userId').populate({ path: 'items.product_var_id', populate: { path: 'product' } })
    const user = await UserCollection.findById(cart.userId);
    const addresses = await AddressCollection.find({ user: cart.userId });
    
    const totalOfEachItem = cart.items.map(item => item.product_var_id.product.price * item.quantity);
    let subTotal = totalOfEachItem.reduce((acc, val) => val + acc, 0);

    const { coupon } = req.session
    //apply shipping charge 
    let overallTotalPrice;
    let shipping_charge;
    if (subTotal < 500) {
        shipping_charge = 50;
        overallTotalPrice = subTotal + shipping_charge;
    } else {
        shipping_charge = 0;
        overallTotalPrice = subTotal;
    }
    //coupon apply 
    let discountAmount = 0;
    const findCoupon = await CouponCollection.findOne({ code: coupon })
    let couponDescription = '';
    if (!findCoupon) {
        console.log('coupon not exist')
    } else {
        couponDescription = findCoupon.description;
        if (findCoupon.discountType == 'percentage') {
            discountAmount = overallTotalPrice * (findCoupon.discountValue / 100)
        } else {
            discountAmount = findCoupon.discountValue
        }
    }

    overallTotalPrice = overallTotalPrice - discountAmount;
    console.log(overallTotalPrice)

    const error = req.flash('error')
    const success = req.flash('success')

    //wallet 
    
    const wallet = await WalletCollection.findOne({user:user._id})
    
    res.render('checkout', { title: 'Checkout', userLogged, addresses, cart, subTotal, overallTotalPrice, discountAmount, couponDescription, error, success, walletAmount : wallet.balance })
}

const handlePostCheckout = async (req, res) => {
    
    try {
        const { coupon } = req.session
        const cartId = req.params.id;
        const cart = await CartCollection.findById(cartId).populate({ path: 'items.product_var_id', populate: { path: 'product' } });
        console.log(cart.items)
        const addressId = req.body.address;
        const payment_type = req.body.payment_type;

        const findAddress = await AddressCollection.findById(addressId);

        const check_out_of_stock = false;
        for (let item of cart.items) {
            if (item.product_var_id.product.quantity == 0) {
                check_out_of_stock = true;
                break;
            }
        }
        if (!check_out_of_stock) {
            const totalOfEachItem = cart.items.map(item => item.product_var_id.product.price * item.quantity);
            let sub_total = totalOfEachItem.reduce((acc, val) => val + acc, 0);
            console.log(totalOfEachItem)
            let total_amount;
            let shipping_charge;
            if (sub_total < 500) {
                shipping_charge = 50;
                total_amount = sub_total + shipping_charge;
            } else {
                shipping_charge = 0;
                total_amount = sub_total;
            }
            //coupon apply 
            let coupon_applied = '';
            let discountAmount = 0;
            const findCoupon = await CouponCollection.findOne({ code: coupon })
            let couponDescription = '';
            if (!findCoupon) {
                console.log('coupon not exist')
            } else {
                couponDescription = findCoupon.description;
                coupon_applied = coupon;
                if (findCoupon.discountType == 'percentage') {
                    discountAmount = total_amount * (findCoupon.discountValue / 100)
                } else {
                    discountAmount = findCoupon.discountValue
                }
            }

            total_amount = total_amount - discountAmount;
            //generate random orderid
            async function generateOrderId() {
                const randomNum = Math.floor(Math.random() * 100000000);
                const timestamp = Date.now()
                const orderId = (timestamp.toString().slice(0, 3) + randomNum.toString().padStart(6, '0')).slice(0, 12);
                let orderidstring = toString(orderId);
                return `OD${orderId}`;
            }

            //for cod
            if (payment_type == 'cod') {

                //check total amount and COD only available for amount below 1000

                if (total_amount < 1000) {
                    const order_id = await generateOrderId()

                    const order = new OrdersCollection({
                        order_id, user_id: cart.userId, items: cart.items, payment_type, shipping_address: findAddress, payment_status: 'pending',
                        sub_total, total_amount, shipping_charge, coupon_applied, discount_amount: discountAmount
                    });
                    //console.log(order)
                    const orderData = await order.save();
                    console.log('order saved to db');
                    const reduceProductQty = await ProductsCollection.findByIdAndUpdate()
                    for (let product of order.items) {

                        let reduceProductQty = await ProductsCollection.findByIdAndUpdate(product.product_var_id.product._id, { $inc: { quantity: -product.quantity } })

                    }

                    //remove cart items 
                    const removeCartItem = await CartCollection.findByIdAndUpdate(cartId, { items: [] })
                    req.session.cart_qty = 0;
                    //reduce and remove coupon 
                    await CouponCollection.findOneAndUpdate({ code: coupon }, { $inc: { usageCount: 1 } })
                    req.session.coupon = null;
                    req.flash('success', "Order placed successfully!")
                    res.redirect('/cart')
                } else {
                    req.flash('error', 'Cash on delivery not available for products price more than RS.1000')
                    res.redirect('/checkout/' + cartId)
                }

            } else if (payment_type == 'stripe') {
                const order_id = await generateOrderId()
                const order = new OrdersCollection({
                    order_id, user_id: cart.userId, items: cart.items, payment_type, shipping_address: findAddress, payment_status: 'pending',
                    sub_total, total_amount, shipping_charge, status: 'payment-failed', coupon_applied, discount_amount: discountAmount
                });
                const session = await stripe.checkout.sessions.create({
                    payment_method_types: ['card'],
                    mode: 'payment',
                    line_items: cart.items.map(item => {
                        let discount_amount = 0;
                        let item_price = item.product_var_id.product.price;
                        if (!findCoupon) {
                            console.log('coupon not exist')
                        } else {
                            if (findCoupon.discountType == 'percentage') {
                                discount_amount = item.product_var_id.product.price * (findCoupon.discountValue / 100)
                                item_price = (item.product_var_id.product.price - discount_amount);
                            } else {
                                discount_amount = (findCoupon.discountValue) / (item.length)
                            }
                        }
                        console.log(discount_amount)


                        return {
                            price_data: {
                                currency: 'inr',
                                product_data: {
                                    name: item.product_var_id.product.name
                                },
                                unit_amount: item_price * 100
                            },
                            quantity: item.quantity
                        }
                    }),
                    success_url: 'https://elektronix.co.in/success?session_id={CHECKOUT_SESSION_ID}&order_id=' + order._id + '&cart_id=' + cartId,
                    cancel_url: 'https://elektronix.co.in/failed?order_id=' + order._id
                })
                res.redirect(session.url)

                await order.save()
                //reduce and remove coupon 
                await CouponCollection.findOneAndUpdate({ code: coupon }, { $inc: { usageCount: 1 } })
                req.session.coupon = null;
                console.log("Order created in db with orderId , payment pending!!")


            } else if(payment_type == 'wallet'){
                //wallet 
                const wallet = await WalletCollection.findOne({user:req.session.user})
                if(total_amount > wallet.balance){
                    console.log('insufficient balance')
                    req.flash('error','Insufficient balance in wallet') 
                    res.redirect('/checkout/' + cartId)
                }else{
                    const order_id = await generateOrderId()

                    const order = new OrdersCollection({
                        order_id, user_id: cart.userId, items: cart.items, payment_type, shipping_address: findAddress, payment_status: 'completed',
                        sub_total, total_amount, shipping_charge, coupon_applied, discount_amount: discountAmount
                    });
                    //console.log(order)
                    const orderData = await order.save();
                    console.log('order saved to db');
                    const reduceProductQty = await ProductsCollection.findByIdAndUpdate()
                    for (let product of order.items) {

                        let reduceProductQty = await ProductsCollection.findByIdAndUpdate(product.product_var_id.product._id, { $inc: { quantity: -product.quantity } })

                    }

                    //remove cart items 
                    const removeCartItem = await CartCollection.findByIdAndUpdate(cartId, { items: [] })
                    req.session.cart_qty = 0;
                    //reduce and remove coupon 
                    await CouponCollection.findOneAndUpdate({ code: coupon }, { $inc: { usageCount: 1 } })
                    req.session.coupon = null;

                    //reduce wallet balance 
                    wallet.balance -= total_amount;
                    wallet.transactions.push({type:'debit', amount:total_amount})
                   await wallet.save();

                    req.flash('success', "Order placed successfully!")
                    res.redirect('/cart')
                }
                }else {
                console.log('other payment method')
            }

        } else {
            res.redirect('/cart')
        }



    } catch (error) {
        console.log(error)
    }

}

const handlePostAddNewAddress = async (req,res)=>{
 
   
    const {user}= req.session;
    const {cart_id} = req.query ;
    
    const {name,country,mobile,address,pincode,locality,district,state,activeradio} = req.body
    try {
        let address_type;
        if(activeradio=='home'){
            address_type= 'home'
        }else{
            address_type= 'work'
        }
        const userAddress = new AddressCollection({
            name,mobile,address,pincode,locality,district,state,address_type,user:user,country
        })

        const userAddressData = await userAddress.save();
        req.flash('success', "New address added successfully!")
        res.redirect('/checkout/'+cart_id)

    } catch (error) {
        console.log(error)
    }
}

// const handlePostApplyWallet = async (req,res)=>{
//     const cartId = req.params.id;
//     const cart = await CartCollection.findById(cartId);
    
// }
module.exports = {
    handleGetCheckout,
    handlePostCheckout,
    handlePostAddNewAddress
} 
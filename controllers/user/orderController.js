const UserCollection = require('../../models/user')
const OrdersCollection= require('../../models/orders')
const ProductVariationCollection = require('../../models/productVariation');
const WalletCollection = require('../../models/wallet')

require('dotenv').config()
const {STRIPE_PUBLISHABLE_KEY,STRIPE_PRIVATE_KEY} = process.env
const stripe = require('stripe')(STRIPE_PRIVATE_KEY) 

const handleGetOrders= async (req,res)=>{

    // pagination 
     
     let page=1;
     if(req.query.page){
         page = parseInt(req.query.page);
     }
    
     //set item limits per page
     const limit = 6;

    const userLogged= req.session.isAuth;
    const success = req.flash('success');
    const alert = req.flash('alert')
    const user = await UserCollection.findById(req.session.user);
    const Orders= await OrdersCollection.find({user_id:req.session.user}).populate({path:'items.product_var_id',populate:{path:'product'}}).sort({date_of_order:-1}).limit(limit).skip((page-1)*limit).exec();
    const products = Orders.map(item=>item.items)

    //find total count 

    const totalItemsCount = await OrdersCollection.find({user_id:req.session.user}).populate({path:'items.product_var_id',populate:{path:'product'}}).countDocuments();
   
    res.render('profile-orders',{title:'orders',userLogged,success,alert,Orders,products,totalPages : Math.ceil(totalItemsCount/limit),
    currentPage : page,
    totalItemsCount,
    limit,});

}
const handleGetOrder= async (req,res)=>{
    const order_id= req.params.id;
    const userLogged= req.session.isAuth;
    const order= await OrdersCollection.findById(order_id).populate({path:'items.product_var_id',populate:{path:'product'}});
    
    res.render('profile-orderdetails',{title:'Order details', order,userLogged})
}

const handlePostCancelOrder = async(req,res)=>{
    try {
        //wallet for cancel orders
        const {user}= req.session
        const cancellation_reason= req.body.cancelReason;
        
        const cancel_order = await OrdersCollection.findByIdAndUpdate(req.params.id,{status:'cancelled',date_of_cancel:Date.now(),cancellation_reason},{new:true});
        console.log('order cancelled');
        let wallet = await WalletCollection.findOne({user})
        if(wallet ==null){
            wallet = new WalletCollection({user});
            console.log('new wallet created')
        }
        if(cancel_order.payment_status=='completed'){ 
            wallet.balance += cancel_order.total_amount;
            wallet.transactions.push({type:'refund',amount:cancel_order.total_amount});
            console.log('amount added to wallet')
        }
        await wallet.save();
        
        req.flash('success', 'order cancelled')
        res.redirect('/profile/orders')
    } catch (error) {
        console.log(error)
    }
}

const handlePostReturnOrder = async(req,res)=>{
    try {
        const return_order = await OrdersCollection.findByIdAndUpdate(req.params.id,{status:'returned',date_of_return:Date.now()},{upsert:true});
        req.flash('success', 'order return request initiated');
        res.redirect('/profile/orders')
    } catch (error) {
        console.log(error)
    }
}

const handlePatchOrderPaynow = async(req,res)=>{
    const {id} = req.params;
    const findOrder = await OrdersCollection.findById(id).populate({path:'items.product_var_id',populate:{path:'product'}})
    console.log(findOrder)




    if(findOrder.payment_status=='pending'){
        const session = await stripe.checkout.sessions.create({
            payment_method_types:['card'],
            mode:'payment',
            
            line_items:[{
                    price_data:{
                        currency:'inr',
                        product_data: {
                            name: 'Total amount'
                        },
                        unit_amount: findOrder.total_amount *100,
                    },
                    quantity:1,
                }
                ], 
            success_url:'http://localhost:5000/success?session_id={CHECKOUT_SESSION_ID}&order_id='+id,
            cancel_url:'http://localhost:5000/failed?order_id='+id
        })
        res.redirect(session.url)
    }
}

// invoice download 
const handlePostInvoiceDownload = async (req,res)=>{
    const {id} = req.params;
    const path = require('path')
    const { createInvoice } = require('../../utils/invoice');
    const order = await OrdersCollection.findById(id).populate({path:'items.product_var_id','populate':{path:'product',populate:{path:'brand'}}})
   
    // Function to generate a timestamp-based invoice number
const generateInvoiceNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    
    return `INV-${year}${month}${day}${hour}${minute}${second}`;
  };
  //change date format
  function formatDate(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
  
    return year + "/" + month + "/" + day;
  }
    //invoice model
    const invoice = {
        shipping: {
            name: order.shipping_address.name,
            address: order.shipping_address.address,
            city: order.shipping_address.district,
            state: order.shipping_address.state,
            country: order.shipping_address.country,
            postal_code: order.shipping_address.pincode,
            phone: "**********"
        },
        items: order.items.map(item=>{
           return {
            product: item.product_var_id.product.name,
            brand:item.product_var_id.product.brand.name,
            color:item.product_var_id.color,
            storage:item.product_var_id.storage ? item.product_var_id.storage : "",
            ram:item.product_var_id.ram ? item.product_var_id.ram : '',
            quantity: item.quantity,
            amount: item.product_var_id.product.price,}
        }),
        subtotal: order.sub_total,
        total : order.total_amount,
        discount : order.discount_amount,
        payment_status: order.payment_status,
        
        invoice_nr: generateInvoiceNumber(),
        order_id:order.order_id,
        order_date:formatDate(order.date_of_order),
        invoice_date : formatDate(new Date())
    };

    
   createInvoice(invoice, 'invoice.pdf' ,res);

}

const handleGetCancelOrderConfirm = async(req,res)=>{
    const {id}= req.params;
    const order = await OrdersCollection.findById(id);
    const userLogged= req.session.isAuth;
    res.render('profile-order-cancellation',{title:'Order Cancellation',userLogged,order})
}


module.exports = {
    handleGetOrders,
    handleGetOrder,
    handlePostCancelOrder,
    handlePostReturnOrder,
    handlePatchOrderPaynow,
    handlePostInvoiceDownload,
    handleGetCancelOrderConfirm
}  
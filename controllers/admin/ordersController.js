const OrdersCollection = require('../../models/orders')

const handleGetOrders = async(req,res)=>{
    const success = req.flash('success')
    const alert = req.flash('alert')
    //pagination 
    
    let page=1;
    if(req.query.page){
        page = parseInt(req.query.page);
    }
   
    //set item limits per page
    const limit = 6;
    const totalItemsCount = await OrdersCollection.find().countDocuments();
    const orderslist = await OrdersCollection.find({}).populate('user_id').populate({path:'items.product_var_id',populate:{path:'product'}}).sort({date_of_order:-1}).limit(limit).skip((page-1)*limit).exec();
    res.render('admin/orders',{title:'orders',orderslist,success,alert,totalPages : Math.ceil(totalItemsCount/limit),
    currentPage : page,
    totalItemsCount,
    limit})
}

const handleGetOrderEdit = async (req,res)=>{
    const order_id = req.params.id;
    const success = req.flash('success')
    const order = await OrdersCollection.findById(order_id).populate({path:'items.product_var_id',populate:{path:'product'}})
    res.render('admin/order-edit',{title:'edit order',order,success})
}

const handlePatchChangeStatus = async(req,res)=>{
    try {
        const order_id = req.params.id;
        const order_status = req.body.order_status;
        switch (order_status) {
            case 'cancelled':
                const cancel_order = await OrdersCollection.findByIdAndUpdate(order_id,{status:'cancelled',date_of_cancel:Date.now()},{upsert:true});
                console.log('order cancelled');
                
                break;
            case 'delivered':
                const deliver_order = await OrdersCollection.findByIdAndUpdate(order_id,{status:'delivered',date_of_delivered:Date.now()},{upsert:true})
            break;
            case 'processed':
                const process_order = await OrdersCollection.findByIdAndUpdate(order_id,{status:'processed',date_of_processed:Date.now()},{upsert:true})
            break;
            case 'shipped':
                const shipped_order = await OrdersCollection.findByIdAndUpdate(order_id,{status:'shipped',date_of_shipped:Date.now()},{upsert:true})
            break;

            default:
                const placed_order = await OrdersCollection.findByIdAndUpdate(order_id,{status:'placed'},{upsert:true})
                break;
        }
        
        req.flash('success', 'order status changed')
                res.redirect('/admin/orders')
        
    } catch (error) {
        console.log(error)    
    }
}
module.exports = {
    handleGetOrders,
    handleGetOrderEdit,
    handlePatchChangeStatus
}
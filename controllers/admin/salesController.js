const { populate } = require('../../models/cart')
const OrderCollection = require('../../models/orders')


const handleGetSales = async (req,res)=>{
    
    try {

        const orders= await OrderCollection.find()
           
            
            res.render('admin/sales',{title:'Sales'})
            //res.json(orders)
        
    } catch (error) {
        console.log(error)
    }
    
}
const handleGetFilterSales = async (req,res)=>{
    const { startDate, endDate, period } = req.query;

    let matchCondition = {};

    if (startDate && endDate) {
        matchCondition.date_of_order = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    } else if (period) {
        let currentDate = new Date();
        switch (period) {
            case 'daily':
                matchCondition.date_of_order = {
                    $gte: new Date(currentDate.setDate(currentDate.getDate() - 1)),
                    $lte: new Date()
                };
                break;
            case 'weekly':
                matchCondition.date_of_order = {
                    $gte: new Date(currentDate.setDate(currentDate.getDate() - 7)),
                    $lte: new Date()
                };
                break;
            case 'monthly':
                matchCondition.date_of_order = {
                    $gte: new Date(currentDate.setMonth(currentDate.getMonth() - 1)),
                    $lte: new Date()
                };
                break;
            case 'yearly':
                matchCondition.date_of_order = {
                    $gte: new Date(currentDate.setFullYear(currentDate.getFullYear() - 1)), 
                    $lte: new Date()
                };
                break;
        }
    }
    try {
        const orderList = await OrderCollection.find(matchCondition).populate([{path:'user_id'},{path:'items.product_var_id','populate':{path:'product'}}])
        const orders= await OrderCollection.aggregate([{ $match: matchCondition },
            {
                $group: {
                       _id: null,
                       totalSales: { $sum: '$total_amount' },
                       totalDiscount: { $sum: '$discount_amount' },
                       orderCount: { $count: {} }
                   }
            }])
           const ordersSalesList = {orderList,orders} 
            console.log(ordersSalesList)
            res.json(ordersSalesList)
        console.log(orders)
    } catch (error) {
        console.log(error)
    }
}


module.exports={handleGetSales,
    handleGetFilterSales
}
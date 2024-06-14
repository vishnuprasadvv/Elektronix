const flash = require('connect-flash');
const express = require('express');
const app = express();
const OrderCollection = require('../../models/orders')
const ProductCollection = require('../../models/products')
const ProductVariationCollection = require('../../models/productVariation')
const UsersCollection = require('../../models/user')

const admin = {
  email: 'admin@gmail.com',
  password: '123456'
}

//flash for flash messages
app.use(flash());
//admin login GET route
const handleGetAdminLogin = async (req, res) => {
  const alert = req.flash('alert')
  const success = req.flash('success')
  res.render('admin/login', { title: "Admin login", alert, success })
}

//admin login POST route
const handlePostAdminLogin = async (req, res) => {
  const { email, password } = req.body; 
  if (email === admin.email && password === admin.password) {
    req.session.adminAuth = true;
    res.redirect("/admin/dashboard")
  } else {
    req.flash('alert', 'Invalid credentials')
    res.redirect("/admin/login")
  }
}

const handlePostAdminLogout = async (req, res) => {
  req.flash('success', 'Logged out successfully!')
  req.session.adminAuth = false;
  res.redirect('/admin/login')    

}

const handleGetAdminDashboard = async (req, res) => {

  try {
    const sales1 = await OrderCollection.aggregate([{ $match: { status: { $nin: ['cancelled', 'returned'] } } }, { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$date_of_order" } }, total: { $sum: '$total_amount' } } }, { $sort: { _id: 1 } }])

    const sales = JSON.stringify(sales1)     
    //total sales 
    const totalSalesAmount = sales1.reduce((acc, val) => val.total + acc, 0)
    //total product qty 
    const totalproductsvariation = await ProductCollection.aggregate([{ $match: { isDeleted: false } }, { $group: { _id: '$name' } }, { $count: 'total' }])

    //total active users 
    const totalActiveUsers = await UsersCollection.find({ status: true, isVerified: true }).countDocuments()

   // top 5 products 
     const topProducts = await OrderCollection.aggregate([{$match:{status:{$nin:['cancelled','returned']}}},{ $unwind: '$items' }, // Deconstruct the items array
      {
        $group: {
          _id: '$items.product_var_id',
          totalQuantity: { $sum: '$items.quantity' },
        },
      },
   
      {
        $lookup: {
          from: 'ProductVariation', 
          localField: '_id',
          foreignField: '_id',
          as: 'productVariationDetails',
        },
      }
      ]) 
      
     console.log('top products' ,topProducts)

    res.render('admin/dashboard', { title: "Dashboard", sales, totalSalesAmount, totalproductsvariation, totalActiveUsers });
  } catch (error) {
    console.log(error)
  }

}
const handlePostSalesChart = async (req, res) => {
  const { sales_filter } = req.query;
  console.log(sales_filter)
  let groupBy, dateFormat;

  switch (sales_filter) {
    case 'year':
      groupBy = { _id: { $dateToString: { format: "%Y", date: "$date_of_order" } }, total: { $sum: '$total_amount' } };
      dateFormat = "%Y";
      break;
    case 'month':
      groupBy = { _id: { $dateToString: { format: "%Y-%m", date: "$date_of_order" } }, total: { $sum: '$total_amount' } };
      dateFormat = "%Y-%m";
      break;
    case 'week':
      groupBy = { _id: { $dateToString: { format: "%Y-W%V", date: "$date_of_order" } }, total: { $sum: '$total_amount' } };
      dateFormat = "%Y-W%V";
      break;
    case 'day':
      groupBy = { _id: { $dateToString: { format: "%Y-%m-%d", date: "$date_of_order" } }, total: { $sum: '$total_amount' } };

      break;
    default:
      groupBy = { _id: { $dateToString: { format: "%Y-%m-%d", date: "$date_of_order" } }, total: { $sum: '$total_amount' } };
      dateFormat = "%Y-%m-%d";
  }


  try {
    const sales1 = await OrderCollection.aggregate([{ $match: { status: { $nin: ['cancelled', 'returned'] } } }, { $group: groupBy }, { $sort: { _id: 1 } }])
    console.log(sales1)

    const sales = JSON.stringify(sales1)
    res.json(sales)
  } catch (error) {
    console.log(error)
  }
}

module.exports = {
  handleGetAdminLogin,
  handlePostAdminLogin,
  handlePostAdminLogout,
  handleGetAdminDashboard,
  handlePostSalesChart
}
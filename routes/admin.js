const router= require('express').Router();
const {isAdminAuth,isAdminLogout}= require('../middlewares/session')
const path= require('path')
const {handleGetOrderEdit,
    handleGetOrders,handlePatchChangeStatus}= require('../controllers/admin/ordersController')

const {handleGetUser,
    handlePostUnblockUser,
    handlePostBlockUser}= require('../controllers/admin/userController')

const {handleGetCategory,
    handleGetAddCategory,
    handlePostAddCategory,
    handleGetEditCategory,
    handlePostEditCategory}= require('../controllers/admin/categoryController')

const {handleGetProduct,
    handleGetAddProduct,
    handlePostAddProduct,
    handlePostDeleteProduct,
    handleGetEditProduct,
    handlePostEditProduct}= require('../controllers/admin/productsController') 

const {handleGetAdminLogin,
    handlePostAdminLogin,
    handlePostAdminLogout,
    handleGetAdminDashboard,handlePostSalesChart}= require('../controllers/admin/adminController')

const {handleGetBrand,
    handleGetAddBrand,
    handlePostAddBrand,
    handleGetEditBrand,
    handlePostEditBrand} = require('../controllers/admin/brandsController')

const {handleGetCoupon,
    handleGetCreateCoupon,
    handlePostCreateCoupon,
    handleDeleteCoupon,
    handlePutEditCoupon,
    handleGetEditCoupon} = require('../controllers/admin/couponController')
const {handleGetSales,handleGetFilterSales} = require('../controllers/admin/salesController')
const {handleGetOffers,handlePostCreateCategory,
    handleGetCreateCategoryOffer,handleDeleteCategoryOffer,handlePutEditCategoryOffer,handleGetEditOfferCategory}= require('../controllers/admin/offersController')
//nocach for removing browser cache

//multer
const multer= require('multer');
const storage= multer.diskStorage({
    destination:function(req,file,cb){
        return cb(null,path.join(__dirname,'../public/productImages'))
    },
    filename:function(req,file,cb){
        const name= Date.now() +' '+ file.originalname;
      return cb(null,name);
    }
})
const upload= multer({storage:storage});

//admin login GET 
router.route('/login').get(isAdminLogout,handleGetAdminLogin)
.post(handlePostAdminLogin)
//admin logout
router.post('/logout',handlePostAdminLogout);

//admin dashboard
router.get('/dashboard',handleGetAdminDashboard)
//orders route
router.get('/orders',isAdminAuth,handleGetOrders)
router.get('/orders/:id/edit',isAdminAuth,handleGetOrderEdit) 
router.patch('/orders/:id/edit',isAdminAuth,handlePatchChangeStatus)

//users route
router.route('/users').get(isAdminAuth,handleGetUser)
//unblok users 
router.post('/users/:id/unblock',handlePostUnblockUser)
//block users 
router.post('/users/:id/block',handlePostBlockUser)

//category route
router.route('/category').get(isAdminAuth,handleGetCategory)
//add category GET route 
router.route('/category/add').get(isAdminAuth,handleGetAddCategory)
//add category POST route \
.post(handlePostAddCategory)
//edit category GET route
router.route('/category/:id/edit').get(isAdminAuth,handleGetEditCategory)
//edit category POST route
.post(handlePostEditCategory)
 
 
//brands route
router.route('/brands').get(isAdminAuth,handleGetBrand)
//add Brand GET route 
router.route('/brands/add').get(isAdminAuth,handleGetAddBrand)
//add Brand POST route \
.post(handlePostAddBrand)
//edit Brand GET route
router.route('/brands/:id/edit').get(isAdminAuth,handleGetEditBrand)
//edit Brand POST route
.post(handlePostEditBrand)

//products route
router.route('/products').get(isAdminAuth,handleGetProduct)
//add product GET route
router.route('/products/add').get(isAdminAuth,handleGetAddProduct)
//add product POST route
.post(upload.array('image',5),handlePostAddProduct) 
//delete product post 
router.route('/products/:id/delete').post(handlePostDeleteProduct)
//edit product route
router.route('/products/:id/edit').get(isAdminAuth,handleGetEditProduct)
//edit product POST route
.post(upload.array('image',5),handlePostEditProduct)

//coupon management 
router.get('/coupon',isAdminAuth,handleGetCoupon)
router.get('/coupon/add',isAdminAuth,handleGetCreateCoupon)
router.post('/coupon/add',handlePostCreateCoupon)
router.delete('/coupon/:id/delete',handleDeleteCoupon)
router.get('/coupon/:id/edit',handleGetEditCoupon)
router.put('/coupon/:id/edit',handlePutEditCoupon)

//sales 
router.get('/sales',handleGetSales)
router.get('/sales/filter',handleGetFilterSales)

//offers
router.get('/offers',isAdminAuth,handleGetOffers)
router.get('/offers/create',isAdminAuth,handleGetCreateCategoryOffer)
router.post('/offers/create-category-offer',handlePostCreateCategory)
router.patch('/offers/:id/delete-category-offer',handleDeleteCategoryOffer)
router.get('/offers/:id/edit-category-offer',isAdminAuth,handleGetEditOfferCategory)
router.put('/offers/:id/edit-category-offer',handlePutEditCategoryOffer)

//dashboard sales chart 
router.get('/sales-chart',handlePostSalesChart)

module.exports= router; 
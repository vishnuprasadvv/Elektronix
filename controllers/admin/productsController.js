const ProductsCollection = require('../../models/products');
const CategoryCollection= require('../../models/category')
const variationCollection= require('../../models/productVariation')
const BrandCollection= require('../../models/brands')
//products 
const handleGetProduct = async (req,res)=>{

     //pagination 
     
     let page=1;
     if(req.query.page){
         page = parseInt(req.query.page);
     }
    
     //set item limits per page
     const limit = 6;
     const totalItemsCount = await ProductsCollection.find({isDeleted:false}).countDocuments();
    const products = await ProductsCollection.find({isDeleted:false}).populate('category').sort({_id:-1}).limit(limit).skip((page-1)*limit)
    const success = req.flash('success')
    const alert = req.flash('alert')
    res.render('admin/products',{title:'products', products,success,alert,totalPages : Math.ceil(totalItemsCount/limit),
    currentPage : page,
    totalItemsCount,
    limit})
}
//add product get route
const handleGetAddProduct= async(req,res)=>{
    const category= await CategoryCollection.find({})
    const brands = await BrandCollection.find({})
    res.render('admin/addproduct',{title:'add product',category,brands})
}

//add product 
const handlePostAddProduct = async (req,res)=>{
    const {name,category,quantity,price,org_price,brand,color,storage,ram,description}= req.body;
    
    let images= req.files; 
    let image= images.map((value)=>value.filename)

        const findCat= await CategoryCollection.findById(category)
       const findBrand = await BrandCollection.findById(brand)
       console.log(findBrand)
       const product= new ProductsCollection({name,quantity,price,org_price,brand:findBrand,category:findCat,image,description})
       const produtData= await product.save()
       
       const productVariation= new variationCollection({color,storage,ram,product:produtData._id})
        const productVariationData= await productVariation.save()
        req.flash('success','New product added')
       res.redirect('/admin/products')
       console.log('product added successfully') 
}

const handlePostDeleteProduct= async (req,res)=>{
    try {
        
            const deleteProduct= await ProductsCollection.findByIdAndUpdate({_id:req.params.id},{$set:{isDeleted:true}})
            console.log('product deleted successfully')
            req.flash('success','Product deleted Successfully')
            res.redirect('/admin/products') 
       
    } catch (error) {
        console.log(error) 
    }
}

const handleGetEditProduct =async (req,res)=>{
    const categories = await CategoryCollection.find({})
    const brands = await BrandCollection.find({})
    const product = await ProductsCollection.findOne({_id:req.params.id}).populate('category')
       const productVar= await variationCollection.findOne({product:req.params.id})
       const productBrand= await product.populate('brand')
       
    res.render('admin/editproduct',{title:'edit product',product,productVar,productBrand,categories,brands})
}
 
const handlePostEditProduct=  async (req,res)=>{
    const {productName,category,quantity,price,org_price,brand,color,description,ram,storage}=req.body;
    let images= req.files; 
    
   let image= images.map((value)=>value.filename)
    const product = await ProductsCollection.findOneAndUpdate({_id:req.params.id},{$set:{name:productName,quantity,price,org_price,image,brand,category,description}})
    const variation = await variationCollection.findOneAndUpdate(({product:req.params.id},{color,ram,storage},{upsert:true}))
        console.log('product details updated')
        req.flash('success','Product details updated')
        res.redirect('/admin/products') 
}
module.exports= {
    handleGetProduct,
    handleGetAddProduct,
    handlePostAddProduct,
    handlePostDeleteProduct,
    handleGetEditProduct,
    handlePostEditProduct
}
const ProductCollection = require('../../models/products');
const CategoryCollection = require('../../models/category')
const BrandsCollection = require('../../models/brands')
const productVariationCollection = require ('../../models/productVariation');
const category = require('../../models/category');

//products list 
const handleGetProductsList = async(req,res)=>{

    // search items
    let modifiedsearch='';
    if(req.query.search){
        search = req.query.search;
         modifiedsearch = search.replace(/\s+/g, '\\s*');
    }
   
 //pagination 
    let page=1;
    if(req.query.page){
        page = parseInt(req.query.page);
    }
   
    //set item limits per page
    const limit = 6;
    
    //find brand
 const brands = await BrandsCollection.find({ 
   name:{ $regex:'.*' + modifiedsearch +'.*',$options:'i'}
    
    })
// find category 
const categories = await CategoryCollection.find({ 
    name:{ $regex:'.*' + modifiedsearch +'.*',$options:'i'}
     
 })


        // filter & sort 

    let sort = req.query.sort? req.query.sort : 'popularity';
    let filter_category  = req.query.categories ? req.query.categories.split(',') : ''; 
    let filter_brand = req.query.brands ? req.query.brands.split(',') : '';
    console.log(filter_brand,sort,filter_category) 

    //sorting 
    let sortby={};
    if(sort == 'low_to_high'){
        sortby.price= 1
    }else if( sort== 'high_to_low'){
        sortby.price= -1
    }else if( sort =='newest'){
        sortby.added_date = -1
    }else if(sort == 'a_to_z'){
        sortby.name = 1 
    }else if(sort == 'z_to_a'){
        sortby.name= -1
    }else if(sort == 'popularity'){
        sortby.added_date = 1
    }

    console.log(sortby)
    //find category for filter 
    let categoryByFilter=[]
    for ( let cat of filter_category ){
        categoryByFilter.push(await CategoryCollection.findOne({name:cat}))
        
    }
        if(categoryByFilter.length==0){
            categoryByFilter = await CategoryCollection.find()
        }
    //find brands for filter 
    let brandsByFilter=[]
    for ( let brand of filter_brand ){
        brandsByFilter.push(await BrandsCollection.findOne({name:brand}))
        
    }
        if(brandsByFilter.length==0){
            brandsByFilter = await BrandsCollection.find() 
        }
        

    const userLogged= req.session.isAuth;
    const products= await ProductCollection.find({isDeleted:false, 
        $or:[
        { name:{ $regex:'.*' + modifiedsearch +'.*',$options:'i'}},
        {brand: brands} ,
        {category: categories} 
        ] ,
        $and:[{category: categoryByFilter},{brand: brandsByFilter}]
       
}).populate(['category','brand']).sort(sortby)
.limit(limit).skip((page-1)*limit).exec();
  
  // total items count for pagination 
    const totalItemsCount= await ProductCollection.find({isDeleted:false, 
        $or:[
        { name:{ $regex:'.*' + modifiedsearch +'.*',$options:'i'}},
        {brand: brands} ,
        {category: categories} 
        ]
}).populate(['category','brand']).countDocuments()

    // total brand list for filter option
    const fullBrandsColl = await BrandsCollection.find({});
    //total cateories 
     const fullCategories  = await CategoryCollection.find({});
     const productListTab = true;

    res.render('list',{title:"Product-list",products,fullCategories,userLogged,fullBrandsColl,productListTab,
        totalPages : Math.ceil(totalItemsCount/limit),
        currentPage : page,
        totalItemsCount,
        limit,
        filter_brand,filter_category,sort
    })
}

//product view 
const handleGetProductView = async(req,res)=>{ 
    let id= req.query.id
    const product = await ProductCollection.findById(id).populate('category')
    const productVar= await productVariationCollection.findOne({product:id}).populate('product')
    const relatedProducts= await ProductCollection.find({category:product.category.id}).populate('category')
    const success = req.flash('success')
    const warning = req.flash('warning')
    const alert = req.flash('alert')
    
    const userLogged= req.session.isAuth; 
 
    res.render('product-view' ,{title:"Product-view",product,productVar,relatedProducts,userLogged,success,warning,alert})  
}




module.exports = { handleGetProductsList,
    handleGetProductView
}
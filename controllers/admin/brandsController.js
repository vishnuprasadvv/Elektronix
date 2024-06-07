const BrandsCollection= require('../../models/brands')


//brands get
const handleGetBrand= async (req,res)=>{
   
    //pagination 
    
    let page=1;
    if(req.query.page){
        page = parseInt(req.query.page);
    }
   
    //set item limits per page
    const limit = 6;
     const totalItemsCount = await BrandsCollection.find().countDocuments();
     const brands= await BrandsCollection.find({}).sort({_id:-1}).limit(limit).skip((page-1)*limit).exec();
    const alert = req.flash('alert')
    const success = req.flash('success')
    res.render('admin/brands',{title:'brands list',brands,success,alert,totalPages : Math.ceil(totalItemsCount/limit),
    currentPage : page,
    totalItemsCount,
    limit})
}

// add brand 
const handleGetAddBrand = (req,res)=>{
    const alert = req.flash('alert')
    res.render('admin/addbrands',{title:'Add brand',alert})
}

const handlePostAddBrand= async (req,res)=>{
    const {name,slug,activeradio}= req.body;
    let status;
    if(activeradio=='active'){
        status= true
    }else{
        status=false
    }
    //check already brand present or not
    const isBrandPresent= await BrandsCollection.findOne({name:name})
    console.log(isBrandPresent)
  if(isBrandPresent){
    req.flash('alert',"Brand name already present!")
    res.redirect('/admin/brand/add')
    console.log('brand already present')
  }else{
    const brand= new BrandsCollection({
        name:name,
        status:status
    })
    const brandData= await brand.save()
    req.flash('success',"New brand added successfully")
    res.redirect('/admin/brands')
  }
    
}

//edit brand
const handleGetEditBrand =  async (req,res)=>{
    const brand= await BrandsCollection.findOne({_id:req.params.id})
    const alert= req.flash('alert')
    res.render('admin/editbrands',{title:'edit brands',brand,alert})
}

const handlePostEditBrand = async (req,res)=>{
    const {name, slug,activeradio}=req.body;
    let status;
    if(activeradio =='active'){
        status=true
    }else{
        status= false
    }
    const checkBrands = await BrandsCollection.findOne({name:name})
   
    if(checkBrands){
        if(checkBrands._id== req.params.id){
            const editBrands= await BrandsCollection.findByIdAndUpdate({_id:req.params.id},{$set:{name,status}})
            res.redirect('/admin/brands')
        }else{
            req.flash('alert',"Brand name already present")
            res.redirect('/admin/brands/'+req.params.id+'/edit')
        }    
    }else{
        const editBrands= await BrandsCollection.findByIdAndUpdate({_id:req.params.id},{$set:{name,status}})
        res.redirect('/admin/brands')
    }
    
   
    
}

module.exports ={
    handleGetBrand,
    handleGetAddBrand,
    handlePostAddBrand,
    handleGetEditBrand,
    handlePostEditBrand
}
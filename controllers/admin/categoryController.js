const CategoryCollection= require('../../models/category')


//category get
const handleGetCategory= async (req,res)=>{
    const categories= await CategoryCollection.find({}).sort({_id:-1});

     //pagination 
    
     let page=1;
     if(req.query.page){
         page = parseInt(req.query.page);
     }

    const totalItemsCount = await CategoryCollection.find().countDocuments();
     //set item limits per page
     const limit = 6;
    const alert = req.flash('alert')
    const success = req.flash('success')
    res.render('admin/category',{title:'category list',categories,success
    ,totalPages : Math.ceil(totalItemsCount/limit),
    currentPage : page,
    totalItemsCount,
    limit
    })
}

// add category 
const handleGetAddCategory = (req,res)=>{
    const alert = req.flash('alert')
    res.render('admin/addcategory',{title:'category add',alert})
}

const handlePostAddCategory= async (req,res)=>{
    const {name,slug,activeradio}= req.body;
    let status;
    if(activeradio=='active'){
        status= true
    }else{
        status=false
    }
    //check already category present or not
    const isCatPresent= await CategoryCollection.findOne({name:name})
    console.log(isCatPresent)
  if(isCatPresent){
    req.flash('alert',"Category already present!")
    res.redirect('/admin/category/add')
    console.log('category already present')
  }else{
    const category= new CategoryCollection({
        name:name,
        status:status
    })
    const categoryData= await category.save()
    req.flash('success',"New category added successfully")
    res.redirect('/admin/category')
  }
    
}

//edit category
const handleGetEditCategory =  async (req,res)=>{
    const category= await CategoryCollection.findOne({_id:req.params.id})
    const alert= req.flash('alert')
    res.render('admin/editcategory',{title:'edit category',category,alert})
}

const handlePostEditCategory = async (req,res)=>{
    const {name, slug,activeradio}=req.body;
    let status;
    if(activeradio =='active'){
        status=true
    }else{
        status= false
    }
    const checkCategory = await CategoryCollection.findOne({name:name})
   
    if(checkCategory){
        if(checkCategory._id== req.params.id){
            const editCategory= await CategoryCollection.findByIdAndUpdate({_id:req.params.id},{$set:{name,status}})
            res.redirect('/admin/category')
        }else{
            req.flash('alert',"Category already present")
            res.redirect('/admin/category/'+req.params.id+'/edit')
        }    
    }else{
        const editCategory= await CategoryCollection.findByIdAndUpdate({_id:req.params.id},{$set:{name,status}})
        res.redirect('/admin/category')
    }
    
   
    
}

module.exports ={
    handleGetCategory,
    handleGetAddCategory,
    handlePostAddCategory,
    handleGetEditCategory,
    handlePostEditCategory
}
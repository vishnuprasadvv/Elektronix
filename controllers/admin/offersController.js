const CategoryOffersCollection = require('../../models/categoryOffers');
const CategoryCollection =  require('../../models/category');
const ProductsCollection =  require('../../models/products');

const handleGetOffers = async (req,res)=>{

    //pagination 
    let page=1;
    let limit = 6;
    if(req.query.page){
        page = parseInt(req.query.page);
    }
    const CategoryOffers = await CategoryOffersCollection.find({isDeleted:false}).sort({_id:-1})
    const totalItemsCount = await CategoryOffersCollection.find({isDeleted:false}).countDocuments();
    const success = req.flash('success')
    res.render('admin/offers',{title:'Offers',CategoryOffers,
    totalPages : Math.ceil(totalItemsCount/limit),success,
    currentPage : page,
    totalItemsCount,
    limit
    })
   
}
const handleGetCreateCategoryOffer = async (req,res)=>{
    const alert = req.flash('alert')
    const categories = await CategoryCollection.find({})
    res.render('admin/add-offer',{title:'Create offer',alert,categories})
}

const handlePostCreateCategory = async (req,res)=>{
    try {
        const {offerName,description,offerDiscountValue,category,startDate,endDate} = req.body;
        //check offer already applied to this category 
        const checkOfferApplied = await CategoryOffersCollection.findOne({category,isDeleted:false});
        if(checkOfferApplied){
            req.flash('error','Offer already applied to the category');
            //res.redirect('/admin/offers');
            console.log('offer already applied to this category')
            res.error('Offer already applied to the category')
            
        }else{
        const newCategoryOffer = new CategoryOffersCollection({
            offerDiscountValue:parseInt(offerDiscountValue),
            offerName,description,category,endDate,startDate,
            isDeleted:false
        });
        await newCategoryOffer.save(); 

        //update related products offer details in db
        const products = await ProductsCollection.find({isDeleted:false,category:{$in:newCategoryOffer.category}})
       
            
            if(products){
                for(let item of products){
                    const actualAmount = item.price;
                    //offer price calculation
                    const updatedPrice =  item.price - ((item.price*newCategoryOffer.offerDiscountValue)/100);
                    const discountAmount =  (item.price*newCategoryOffer.offerDiscountValue)/100;
                    if(!item.offer){
                        item.offer={};
                    }
                item.offer.actualAmount = actualAmount;
                item.offer.offerPrice = updatedPrice;
                item.offer.offerName = newCategoryOffer.offerName;
                item.offer.offerDiscount = discountAmount;
                item.offer.offerDiscountPercentage = newCategoryOffer.offerDiscountValue
            // update product original price with offer price
                    item.price = updatedPrice;
                
                item.save();
                }
            }
            req.flash('success','New offer added ')
            //res.redirect('/admin/offers')
            res.json('success')
        }

        
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const handleDeleteCategoryOffer = async(req,res)=>{
    const {id} = req.params;
    try {
        const findCategoryOffer = await CategoryOffersCollection.findById(id)
        if(findCategoryOffer){
            findCategoryOffer.isDeleted = true;
            findCategoryOffer.save();
            req.flash('success',"Offer deleted")
            res.redirect('/admin/offers')
            
        }else{
            console.log('cannot find the offerdata')
            res.status(404).json({message:'cannot find offerdata'})
        }
        
    } catch (error) {
        res.status(500).json({message:'Delete category offer failed'})
        console.log(error)
    }
}

const handlePutEditCategoryOffer = async(req,res)=>{
    const {id} = req.params;
    const {offerName,description,offerDiscountValue,category,startDate,endDate} = req.body;
    try {
        const findCategoryOffer = await CategoryOffersCollection.findById(id)
        if(findCategoryOffer){
            const updateOffer = await CategoryOffersCollection.findByIdAndUpdate(id,{offerName,description,offerDiscountValue:parseInt(offerDiscountValue),category,startDate,endDate},{upsert:true})
            if(updateOffer){
                req.flash('success',"Offer updated")
                console.log('offerupdated')
                res.redirect('/admin/offers')
            }else{
                console.log('update offer error')
                req.flash('alert','Edit offer details failed')
                res.redirect('/admin/offers/id/edit-category-offer')
            }
        }else{
            console.log('cannot find the offerdata')
            res.status(404).json({message:'cannot find offerdata'})
        }
        
    } catch (error) {
        res.status(500).json({message:'update category offer failed'})
        console.log(error)
    }
}

const handleGetEditOfferCategory = async(req,res)=>{
    const {id}= req.params;
    const alert = req.flash('alert')
    const getOffer = await CategoryOffersCollection.findById(id).populate('category')
    const categories = await CategoryCollection.find({status:true})
    console.log()
    
    res.render('admin/edit-offer',{title:'edit offer',alert,getOffer,categories})
}

module.exports= {
    handleGetOffers,
    handleGetCreateCategoryOffer,
    handlePostCreateCategory,
    handleDeleteCategoryOffer,
    handlePutEditCategoryOffer,
    handleGetEditOfferCategory
}
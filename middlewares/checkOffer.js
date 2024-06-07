const CategoryOffersCollection = require('../models/categoryOffers') ;
const CategoryCollection = require('../models/category');
const productsCollection = require('../models/products')
const mongoose = require('mongoose')

const updateOfferDetails = async (req,res,next)=>{
    try {
        const currentDate = new Date()
        const inValidCategoryOffers = await CategoryOffersCollection.find({expired:false,$or:[{startDate:{$gte: currentDate}}, {endDate:{$lte: currentDate}},{isDeleted:true}]})
       // console.log(inValidCategoryOffers)
        if(inValidCategoryOffers.length<=0){
            //console.log('not offers found')
        }else{
            
            const categoryIds = await inValidCategoryOffers.map(offer=> offer.category);
            
            const products = await productsCollection.find({isDeleted:false,category:{$in:categoryIds}})
            
            if(products){
                 for(let item of products){
                   
                    if(item.offer && item.offer instanceof mongoose.Document && Object.keys(item.offer.toObject()).length > 0){
                        const actualAmount =  Number(item.offer.actualAmount); 
                        if(isNaN(actualAmount)){
                            item.price = item.price  
                            
                        }else{ 
                            item.price = parseInt(actualAmount);
                        }
                        item.set('offer', undefined, { strict: false });
                          await item.save();
                          //console.log(item.offer) 
                        console.log('product data updated , applied offers removed')
                    }
                }
                for(offer of inValidCategoryOffers){
                    offer.expired = true;
                    await offer.save();
                    console.log('offer expired')
                }
            }

        }
        next()  
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    updateOfferDetails
}

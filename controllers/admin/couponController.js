const CouponCollection = require('../../models/coupons')

const handleGetCoupon =async  (req,res)=>{
    const success = req.flash('success')

  
    //pagination
    let page=1;
    if(req.query.page){
        page = parseInt(req.query.page);
    }
    //set item limits per page
    const limit = 6;
    const coupons = await CouponCollection.find({}).sort({_id:-1}).limit(limit).skip((page-1)*limit)
    const totalItemsCount = coupons.length;

    res.render('admin/coupons',{title:'Coupons',success,coupons,totalPages : Math.ceil(totalItemsCount/limit),
    currentPage : page,
    totalItemsCount,
    limit})
}

const handleGetCreateCoupon = async (req,res)=>{
    const alert = req.flash('alert')
    res.render ('admin/add-coupon',{title:'create coupon',alert})
}

const handlePostCreateCoupon = async (req,res)=>{
    const { code,description,discountType, discountValue, expirationDate, usageLimit} = req.body;
    try {
        const checkCouponAlreadyPresent = await CouponCollection.findOne({code:code});
        
        if(checkCouponAlreadyPresent!=null){
            console.log("coupon code already available",code)
            req.flash('alert','Coupon code already available')
            res.redirect('/admin/coupon/add')
        }else{
            const newCoupon = CouponCollection({code,
                description,discountType,discountValue,expirationDate,usageLimit
            })
            await newCoupon.save();
            req.flash('success','new coupon created')
            res.redirect('/admin/coupon')
        }
        
    } catch (error) {
        console.log(error)
    }
}

const handleDeleteCoupon = async(req,res)=>{
    const coupon_id = req.params.id
    const findCoupon = await CouponCollection.findByIdAndDelete(coupon_id);
    if(findCoupon==null){
        console.log('coupon not found')
        return res.status(404).json({ message: 'Coupon not found' })
    }else{
        console.log('coupon deleted')
        req.flash('success','coupon deleted successfully!')
        res.redirect('/admin/coupon') 
    }
}
const handleGetEditCoupon = async (req,res)=>{
    const {id} = req.params;
    const getCoupon = await CouponCollection.findById(id);
    console.log(getCoupon.expirationDate)
    const error = req.flash('alert');
    res.render('admin/edit-coupon',{title:'Edit coupon',getCoupon,error})
}

const handlePutEditCoupon = async(req,res)=>{
    const {code,description,discountType, discountValue, expirationDate, usageLimit} = req.body;
    const {id}= req.params;
    try {
        const updateCoupon = await CouponCollection.findByIdAndUpdate(id,{code,description,discountType, discountValue, expirationDate, usageLimit},{new:true});
        if(!updateCoupon){
            console.log('coupon not found')
            return res.status(404).json({ message: 'Coupon not found' });
        }
        req.flash('success','coupon updated successfully')
        res.redirect('/admin/coupon')
    } catch (error) {
        res.status(500).json({ message: 'Error updating coupon', error });
    }
    
}

module.exports={
    handleGetCoupon,
    handleGetCreateCoupon,
    handlePostCreateCoupon,
    handleDeleteCoupon,
    handleGetEditCoupon,
    handlePutEditCoupon
}
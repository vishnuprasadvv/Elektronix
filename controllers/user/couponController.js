const CouponCollection= require('../../models/coupons');

const handlePostApplyCoupon = async (req,res)=>{
 const {couponCode}= req.body;
 const {cartId} = req.query;
 
 const currentDate = new Date()

 try {
    const existsCoupon = await CouponCollection.findOne({code:couponCode,expirationDate: { $gt: currentDate }});
    if(!existsCoupon){
        req.flash('error','Coupon not valid or expired')
        res.redirect('/checkout/'+cartId)
    }else{
        if(existsCoupon.usageCount>=existsCoupon.usageLimit){
            req.flash('error','This coupon limit exceeded!')
            res.redirect('/checkout/'+cartId)
        }else{
            req.session.coupon=couponCode
            req.flash('success','Coupon applied successfully')
            res.redirect('/checkout/'+cartId)
        }
        
    }
 } catch (error) {
    res.status(500).json({ message: 'Error coupon', error });
 }
}

const handlePostCancelCoupon = async (req,res)=>{
    const {cartId} = req.query;
    const {coupon}= req.session;
    try {
        const findCoupon = await CouponCollection.findOne({code:coupon});
        console.log(findCoupon)
        if(findCoupon){
            req.session.coupon = null;
            req.flash('success','coupon removed')
            res.json(findCoupon)
           // res.redirect('/checkout/'+cartId)
        }else{
            console.log('coupon not found')
        }
    } catch (error) {
        res.status(404).json({message: "Coupon canclellation failed",error})
        console.log(error)
    }
   
}

module.exports = {
    handlePostApplyCoupon,
    handlePostCancelCoupon
}
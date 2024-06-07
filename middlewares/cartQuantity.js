module.exports = (req, res, next) => {
    if (req.session && req.session.cart_qty) {
        res.locals.cart_qty= req.session.cart_qty;
    } else {
        res.locals.cart_qty = 0;
    }
    next();
};
module.exports = (req, res, next) => {
    if (req.session && req.session.wishlist_qty) {
        res.locals.wishlist_qty= req.session.wishlist_qty;
    } else {
        res.locals.wishlist_qty = 0;
    }
    next();
};
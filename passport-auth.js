module.exports = {
    isLoggedIn: function(req,res,next) {
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash('error_message', 'Please log in to view that resource');
        res.redirect('/login');
    },
    isLoggedOut: function(req,res,next) {
        if (!req.isAuthenticated()) {
            return next();
        }
        res.redirect('/home');
    }
};

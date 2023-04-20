module.exports = function (app,fs) {
    var socks = [];
    var body = {};
    // normal routes ===============================================================
    // show the home page (will also have our login links)
    app.get('/', function (req, res) {
        res.render('index.ejs');
    });
    // PROFILE SECTION =========================
    app.get('/profile', function (req, res) {
        fs.readdir('url', function(error, file){
               res.render('profile.ejs', {
                   user: req.user
               });
        }); 
        
    });
    app.get('/editor', function (req, res) {
        res.render('editor.ejs', {
            user: req.user
        });
    });
    // LOGOUT ==============================
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}
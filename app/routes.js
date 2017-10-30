module.exports = function (app, passport, io, fs) {
    var socks = [];
    var body = {};
    // normal routes ===============================================================
    // show the home page (will also have our login links)
    app.get('/', function (req, res) {
        res.render('index.ejs');
    });
    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function (req, res) {
        fs.readdir('url', function(error, file){
           if(file.length > 0){
               res.render('profile.ejs', {
                   user: req.user,
                   fs: file
               });
           }
        }); 
        
    });
    app.get('/editor', isLoggedIn, function (req, res) {
        res.render('editor.ejs', {
            user: req.user
        });
    });
    // LOGOUT ==============================
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });
    // =============================================================================
    // AUTHENTICATE (FIRST LOGIN) ==================================================
    // =============================================================================
    // google ---------------------------------
    // send to google to do the authentication
    app.get('/auth/google', passport.authenticate('google', {
        hd: 'email',
        scope: ['profile', 'email']
    }));
    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));
    io.sockets.on('connection', function (socket) {
        socks.push(socket);

        socket.on('open', function (data) {
            var baseDir = '../clients/';
            var codeFile = '/code.js';
            var pathDir = baseDir + data.name;
            var fileDir = pathDir + codeFile;
            if (!fs.existsSync(pathDir)) {
                fs.mkdirSync(pathDir);
                fs.writeFileSync(fileDir, fs.readFileSync(baseDir + 'demo' + codeFile));
            }
            body[data.name] = fs.readFileSync(fileDir).toString();
            socket.emit('open', {
                body: body[data.name]
            });
        });

        socket.on('refresh', function (data) {
            body[data.name] = data.body;
        });

        socket.on('change', function (op) {
            console.log(op);
            if (op.origin == '+input' || op.origin == 'paste' || op.origin == '+delete') {
                socks.forEach(function (sock) {
                    if (sock != socket)
                        sock.emit('change', op);
                });
            };
        });

        socket.on('save', function (data) {
            console.log('SAVING');
            fs.writeFileSync('../clients/' + data.name + '/code.js', data.body, 'utf8');
        });

    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var setting = require('./setting');
var users = require('./routes/users');

var session = require('express-session');
var connect = require('connect');
var MongoStore = require('connect-mongo')(session);
var flash = require('connect-flash');
var multer = require('multer');


var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// cookie-parser
app.use(cookieParser());
// express-sessin
app.use(session({
  secret: setting.cookieSecret,
  key: setting.db,//cookie name
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
  store: new MongoStore({
    url: 'mongodb://localhost/blog'
  })
}));

// 消息通知
app.use(flash());

// 文件上传
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
var upload = multer({
    storage: storage
});

// 设置路由规则
app.get('/', routes.index);
// 用户的所有文章
app.get('/userarticle/:name', routes.userArticle);
// 单篇文章的页面
app.get('/onearticle/:name/:day/:title', routes.oneArticle);
// 注册页面
app.get('/reg', routes.checkNotLogin);
app.get('/reg', routes.reg);
// 执行注册
app.post('/reg', routes.checkNotLogin);
app.post('/reg', routes.doReg);
// 登录页面
app.get('/login', routes.checkNotLogin);
app.get('/login', routes.login);
// 执行登录
app.post('/login', routes.checkNotLogin);
app.post('/login', routes.doLogin);
// 文章发布页
app.get('/post', routes.checkLogin);
app.get('/post', routes.post);
// 执行文章发布
app.post('/post', routes.checkLogin);
app.post('/post', routes.doPost);
// 文章列表页
// app.get('/article', routes.checkLogin);
app.get('/article', routes.article);
// 执行文章发布
app.post('/article', routes.checkLogin);
app.post('/article', routes.doPost);
// 登出
app.get('/logout', routes.checkLogin);
app.get('/logout', routes.logout);
// 上传文件页面
// app.get('/upload', routes.checkLogin);
app.get('/upload', routes.upload);
// 执行文件上传
app.post('/upload', routes.checkLogin);
app.post('/upload', upload.array('field1', 5), routes.doUpload);
// 文章编辑
app.get('/edit/:name/:day/:title', routes.checkLogin);
app.get('/edit/:name/:day/:title', routes.edit);
// 保存编辑的文章
app.post('/edit/:name/:day/:title', routes.checkLogin);
app.post('/edit/:name/:day/:title', routes.updateArticle);
// 删除文章
app.get('/remove/:name/:day/:title', routes.checkLogin);
app.get('/remove/:name/:day/:title', routes.removeArticle);
// 发表评论
app.post('/onearticle/:name/:day/:title', routes.comment);
// 存档页
app.get('/archive', routes.getArchive);
// 标签
app.get('/tags', routes.tags);
// 全部标签文章
app.get('/tags/:tag', routes.tag);
// Seacrh
app.get('/search', routes.search);
// 404页面
app.use(routes.notfound);




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.listen(3000, function () {
    console.log('app.js running at port 3000');
});


module.exports = app;

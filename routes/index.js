// var express = require('express');
// var router = express.Router();
var crypto = require('crypto');
var setting = require('../setting');

var User = require('../models/user');
var Post = require('../models/post');
var Comment = require('../models/comment');

/* GET home page. */
exports.index = function (req, res) {
    res.render('index', {
        title: 'my blog',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    });
}

exports.userArticle = function (req, res) {
    User.find(req.params.name, function (err, user) {
        if (!user) {
            req.flash('error', '用户不存在');
            return res.redirect('/');
        }
        var page = parseInt(req.query.p, 10) || 1;
        Post.findTen(user.name, page, function (err, posts, total) {
            if (err) {
                posts = [];
            }
            res.render('userarticle', {
                title: '文章列表',
                user: req.session.user,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 10 + posts.length) == total,
                posts: posts,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });
}

exports.oneArticle = function (req, res) {
    Post.findOne(req.params.name, req.params.day, req.params.title, function (err, post) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        // req.flash('success', '查找成功');
        res.render('onearticle', {
            title: req.params.title,
            post: post,
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
}

exports.post = function (req, res) {
    res.render('post', {
        title: '发表文章',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    });
}

exports.doPost = function (req, res) {
    var currentUser = req.session.user;
    var tags = [req.body.tag1, req.body.tag2, req.body.tag3];
    var post = new Post(currentUser.name, req.body.title, req.body.post, tags);
    post.save(function (err) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        req.flash('success', '发表成功');
        return res.redirect('/article');
    });
}

// 文章列表页
exports.article = function (req, res) {
    var page = parseInt(req.query.p, 10) || 1;
    Post.findTen(null, page, function (err, posts, total) {
        if (err) {
            posts = [];
        }
        res.render('article', {
            title: '文章列表',
            user: req.session.user,
            page: page,
            isFirstPage: (page - 1) == 0,
            isLastPage: ((page - 1) * 10 + posts.length) == total,
            posts: posts,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
            
        });
    });
}

exports.reg = function (req, res) {
    res.render('reg', {
        title: '注册页面',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    });
}

exports.doReg = function (req, res) {
    if (req.body['password-repeat'] != req.body['password']) {
        // console.log('11');
        req.flash('error', '两次输入的密码不一致!'); 
        return res.redirect('/reg');
    }
    
    // 对密码进行加密
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');
    
    var newUser = new User({
        name: req.body.username,
        password: password
    });
    
    User.find(newUser.name, function (err, user) {
        if (user) {
            req.flash('error', '用户已存在!');
            return res.redirect('/reg');
        }
        else {
            newUser.save(function (err) {
                if (err) {
                    req.session.err = err;
                    req.flash('error', err);
                    return res.redirect('/reg');
                }
                req.session.user = newUser;
                req.flash('success', '注册成功');
                res.redirect('/');
                // console.log('注册成功');
            })
        }
    })
}

exports.login = function (req, res) {
    res.render('login', {
        title: '登录页面',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    });
}

exports.doLogin = function (req, res) {
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');
    
    User.find(req.body.username, function (err, user) {
        if (!user) {
            req.flash('error', '用户不存在!');
            return res.redirect('/login');
        }
        if (user.password != password) {
            req.flash('error', '密码输入错误!');
            return res.redirect('/login');
        }
        req.session.user = user;
        req.flash('success', '登录成功');
        res.redirect('/');
    })
}

exports.logout = function (req, res) {
    req.session.user = null;
    req.flash('success', '登出成功');
    res.redirect('/');
}

exports.checkLogin = function (req, res, next) {
    if (!req.session.user) {
        req.flash('error', '未登录');
        res.redirect('/login');
    }
    next();
}

exports.checkNotLogin = function (req, res, next) {
    if (req.session.user) {
        req.flash('error', '已登录');
        res.redirect('back');
    }
    next();
}

exports.upload = function (req, res) {
    res.render('upload', {
        title: '上传文件',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    });
}

exports.doUpload = function (req, res) {
    req.flash('success', '文件上传成功');
    return res.redirect('/upload');
}

exports.edit = function (req, res) {
    var currentUser = req.session.user;
    Post.edit(currentUser.name, req.params.day, req.params.title, function (err, post) {
        if (err) {
            req.flash('error',err);
            return res.redirect('/');
        }
        res.render('edit', {
            title: '编辑',
            post: post,
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    })
}

exports.updateArticle = function (req, res) {
    var currentUser = req.session.user;
    Post.update(currentUser.name, req.params.day, req.params.title, req.body.post, function (err) {
        var url = encodeURI('/edit/' + req.params.name + '/' + req.params.day + '/' + req.params.title);
        if (err) {
            req.flash('err', err);
            return res.redirect(url);
        }
        req.flash('success', '修改成功');
        return res.redirect(url);
    });
}

exports.removeArticle = function (req, res) {
    var currentUser = req.session.user;
    Post.remove(currentUser.name, req.params.day, req.params.title, function (err) {
        if (err) {
            req.flash('error', err);
            return res.redirect('back');
        }
        req.flash('success', '删除成功');
        return res.redirect('/article');
    })
}

exports.comment = function (req, res) {
    var date = new Date(),
    time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
            date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
    var comment = {
        name: req.body.name,
        email: req.body.email,
        website: req.body.website,
        time: time,
        content: req.body.content
    };
    var newComment = new Comment(req.params.name, req.params.day, req.params.title, comment);
    newComment.save(function (err) {
        if (err) {
            req.flash('error', err);
            return res.redirect('back');
        }
        req.flash('success', '留言成功');
        res.redirect('back');
    });
}

exports.getArchive = function (req, res) {
    Post.getArchive(function (err, posts) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        res.render('archive', {
            title: "存档页面",
            posts: posts,
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
}

exports.tags = function (req, res) {
    Post.getTags(function (err, posts) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        res.render('tags', {
            title: "标签",
            posts: posts,
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
}

exports.tag = function (req, res) {
  Post.getTag(req.params.tag, function (err, posts) {
    if (err) {
      req.flash('error',err); 
      return res.redirect('/');
    }
    res.render('tag', {
      title: 'TAG:' + req.params.tag,
      posts: posts,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
}

exports.search = function (req, res) {
    Post.search(req.query.keywords, function (err, posts) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        res.render('search', {
            title: "搜索结果：" + req.query.keywords,
            posts: posts,
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
}

exports.notfound = function (req, res) {
    res.render('404', {
        title: '404notfound',
        user: req.session.user
    })
}



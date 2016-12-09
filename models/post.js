var mongoDb = require('./db');
var markdown = require('markdown').markdown;

function Post(username, title, post, tags) {
    this.name = username;
    this.title = title;
    this.post = post;
    this.tags = tags;
}

Post.findTen = function (name, page, callback) {
    mongoDb.open(function (err, db) {
        if (err) {
            mongoDb.close();
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                mongoDb.close();
                return callback(err);
            }
            var query = {};
            if (name) {
                query.name = name;
            }
            collection.count(query, function (err, total) {
                collection.find(query, {
                    skip: (page - 1) * 10,
                    limit: 10
                }).sort({
                    time: -1
                }).toArray(function (err, docs) {
                    mongoDb.close();
                    if (err) {
                        callback(err);
                    }
                    docs.forEach(function (doc) {
                        doc.post = markdown.toHTML(doc.post);
                    });
                    callback(null, docs, total);
                });
            });
            // collection.find(query).sort({
            //     time: -1
            // }).toArray(function (err, docs) {
            //     mongoDb.close();
            //     if (err) {
            //         callback(err);
            //     }
            //     docs.forEach(function (doc) {
            //         doc.post = markdown.toHTML(doc.post);
            //     });
            //     callback(null, docs);
            // });
        });
    });
}

Post.findOne = function (name, day, title, callback) {
    mongoDb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                return callback(err);
            }
            collection.findOne({
                "name": name,
                "time.day": day,
                "title": title
            }, function (err, doc) {
                if (err) {
                    return callback(err);
                }
                if (doc) {
                    collection.update({
                        "_id": doc._id
                    }, {
                        "$inc": {"pv": 1}
                    }, function (err) {
                        if (err) {
                            mongoDb.close();                          
                            return callback(err.toString());
                        }
                    })
                    // 解析markdown为html
                    doc.post = markdown.toHTML(doc.post);
                    doc.comments.forEach(function (comment) {
                        comment.content = markdown.toHTML(comment.content);
                    });
                    callback(null, doc);
                }               
            });
        })
    })
}

// 保存文章
Post.prototype.save = function (callback) {
    var date = new Date();
    // 存储各种时间格式
    var time = {
        date: date,
        year: date.getFullYear(),
        month: date.getFullYear() + '-' + (date.getMonth() + 1 ),
        day: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate(),
        minute: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':'
                + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':' + date.getSeconds()
    }
    // 要存入数据库的文档
    var post = {
        name: this.name,
        time: time,
        title: this.title,
        post: this.post,
        tags: this.tags,
        pv: 0,
        comments: []
    }
    mongoDb.open(function (err, db) {
        if (err) {
            callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                mongoDb.close();
                callback(err);
            }
            collection.insert(post, {safe: true}, function (err) {
                mongoDb.close();
                if (err) {
                    callback(err);
                }
                callback(null);
            })
        })
    })
}
Post.edit = function (name, day, title, callback) {
    mongoDb.open(function (err, db) {
        if (err) {
            callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                mongoDb.close();
                callback(err);
            }
            collection.findOne({
                "title": title,
                "time.day": day,
                "name": name
            }, function (err, doc) {
                mongoDb.close();
                if (err) {
                    callback(err);
                }
                callback(null, doc);  // markdown格式
            });
        });
    });
}

Post.update = function (name, day, title, post, callback) {
    mongoDb.open(function (err, db) {
        db.collection('posts', function (err, collection) {
            if (err) {
                mongoDb.close();
                return callback(err);
            }
            collection.update({
                "name": name,
                "time.day": day,
                "title": title
            },{
                $set: {"post": post}
            }, function (err) {
                mongoDb.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    });
}

Post.remove = function (name, day, title, callback) {
    mongoDb.open(function (err, db) {
        if (err) {
            mongoDb.close();
            return callback(err);
        }
        db.collection("posts", function (err, collection) {
            if (err) {
                mongoDb.close();
                return callback(err);
            }
            collection.remove({
                "name": name,
                "time.day": day,
                "title": title
            },{
                w:1
            }, function (err) {
                mongoDb.close();                
                if (err) {
                    req.flash('error', err);
                    return callback(err);
                }
                callback(null);
                // return res.redirect('/');
            });
        });
    });
}

Post.getArchive = function (callback) {
    mongoDb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                mongoDb.close();
                return callback(err);
            }
            collection.find({}, {
                "name": 1,
                "time": 1,
                "title": 1
            }).sort({
                time: -1
            }).toArray(function (err, docs) {
                mongoDb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, docs);
            });
        });
    });
}

Post.getTags = function (callback) {
    mongoDb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                mongoDb.close();
                return callback(err);
            }
            collection.distinct("tags", function (err, docs) {
                mongoDb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, docs);
            });
        });
    });
}

Post.getTag = function(tag, callback) {
  mongoDb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function (err, collection) {
      if (err) {
        mongoDb.close();
        return callback(err);
      }
      //查询所有 tags 数组内包含 tag 的文档
      //并返回只含有 name、time、title 组成的数组
      collection.find({
        "tags": tag
      }, {
        "name": 1,
        "time": 1,
        "title": 1
      }).sort({
        time: -1
      }).toArray(function (err, docs) {
        mongoDb.close();
        if (err) {
          return callback(err);
        }
        callback(null, docs);
      });
    });
  });
}

Post.search = function (keywords, callback) {
    mongoDb.open(function (err, db) {
        if (err) {
            return callback(err.toString());
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                return callback(err.toString());
            }
            var pattern = new RegExp(keywords, 'i');
            collection.find({
                "title": {$regex: pattern}
            }, {
                "name": 1,
                "time": 1,
                "title": 1
            }).sort({
                time: -1
            }).toArray(function (err, docs) {
                mongoDb.close();
                if (err) {
                    return callback(err.toString());
                }
                callback(null, docs);
            })
        })
    })
} 

module.exports = Post;
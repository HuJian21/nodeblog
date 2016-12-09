var mongoDb = require('./db');

function User(user) {
    this.name = user.name;
    this.password = user.password;
} 

// 查找用户名
User.find = function (username, callback) {
    mongoDb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        
        db.collection('users', function (err, collection) {
            if (err) {
                mongoDb.close();
                return callback(err);
            }
            
            collection.findOne({name:username}, function (err, doc) {
                mongoDb.close();
                if (doc) {
                   var user = new User(doc);
                   callback(err, user);
                }
                else {
                    callback(err, null);
                }
            });
        }); 
    });
}

module.exports = User;

// 保存用户
User.prototype.save = function (callback) {
    var user = {
        name: this.name,
        password: this.password
    };
    // 打开数据库
    mongoDb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('users', function (err, collection) {
            if (err) {
                mongoDb.close();
                return callback(err);
            }
            collection.ensureIndex('name', {unique:true});
            collection.insert(user, {safe: true}, function (err) {
                mongoDb.close();
                callback(err);
            })
        })
    })
}
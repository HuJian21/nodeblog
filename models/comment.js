var mongoDb = require('./db');

function Comment(name, day, title, comment) {
    this.name = name;
    this.day = day,
    this.title = title,
    this.comment = comment
}

module.exports = Comment;

// save comment
Comment.prototype.save = function (callback) {
    var name = this.name;
    var day = this.day;
    var title = this.title;
    var comment = this.comment;
    
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
            collection.update({
                "name": name,
                "time.day": day,
                "title": title
            }, {
                $push: {"comments": comment}
            },
            function (err) {
                mongoDb.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    });
}
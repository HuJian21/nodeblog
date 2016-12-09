$(function () {
    init();
});

function init() {
    var article = {
        title: $('.article-title').val(),
        post: $('.article-conetnt').html()
    }
    $('.submit').click(function () {
        $.ajax({
            type: 'post',
            url: '/edit/' + post.name + '/' + post.time.day + '/' + post.title,
            dataType: 'json',
            data: article,
            success: function (data) {
                console.log(data);
            },
            error: function (data) {
                console.log('发送失败');
            }
        });
    });
}
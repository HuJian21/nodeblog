## Intro
学生时代的学习项目，原来在study_nodejs仓库下，现在把它单独拿出来准备重新写一下。
Node+Express+Jade+MongoDB

## Run
电脑要安装MongoDB并启动服务,数据库和端口号在setting.js里。

``` bash
# clone this repo
git clone git@github.com:HuJian21/nodeblog.git

# install deps
npm install (or use cnpm)

# run app.js
node app (supervisor app if you want debugging program)

```

## 目前已经完成的功能:
* 注册/登录
* 发表文章（标题，内容）
* 支持markdown格式
* flash通知
* 简单的文件上传
* 编辑、删除已发表的文章
* 页面权限控制（登录用户才可以访问）
* 用户文章汇总
* 简单分页
* 按年度文章存档
* 评论功能
* 评论统计和pv统计
* 文章标签功能
* 按关键字搜索文章标题
* 404页面

## 感想
这个项目可以说是好多坑踩过来的，原来博主的教程中许多地方都因为版本升级原因无法使用，我将模版引擎换成了Jade，Express也升级到了4。connect-mongo用起来也是痛苦之极，其实毕业半年，现在看起来似乎应该没当初那么艰难，但这个项目对当时对现代web开发一无所知的我来说显得弥足珍贵。

## more
因为学习和兴趣的缘故，我打算重写一下blog啦，正好最近一段时间在用vue做一些Angular1项目的重构，打算引入vue并且部署到线上去当做我的真正博客啦啦啦。

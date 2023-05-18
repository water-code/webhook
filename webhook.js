//webhook.js 
//测试连接github是否能够检测到代码更新并向webhook服务发送请求并【非完整版代码】
let http = require('http');
let server = http.createServer(function (req, res) {
    //判断github发送的是不是post 是不是webhook发送的请求
    console.log('检测到前端后端代码更新，github发来的请求信息如下：')
    console.log(req.method,req.url);
    if (req.method == 'POST' && req.url == '/webhook') {
        //设置github请求的请求头，设置返回数据的格式为json
        res.setHeader('Content-Type', 'application/json');
        //返回通知github请求已经成功
        res.end(JSON.stringify({ok:true}));
    } else {
        res.end('NOT Found');
    }
})
server.listen(4000, () => {
    console.log('webhook服务已经在4000端口启动');
})

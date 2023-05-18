//webhook.js
let http = require('http');
let cryto = require('crypto');
let SECRET = '123456';  //与在前后端项目github中设置的Secret相同
//生成签名算法
//根据SECRET字符串使用哈希算法生成十六进制的新的字符串
function sign(body) {
    return `sha1=` + cryto.createHmac('sha1', SECRET).update(body).digest('hex')
}
let server = http.createServer(function (req, res) {
    //判断github发送的是不是post 是不是webhook发送的请求
    console.log('检测到前端后端代码更新，github发来的请求信息如下：')
    console.log(req.method, req.url);
    if (req.method == 'POST' && req.url == '/webhook') {
        //拿到github传递过来的参数--对请求的github进行简单的验证
        let buffers = []
        req.on('data', function (buffer) {
            buffers.push(buffer)
        })
        req.on('end', function (buffer) {
            let body = Buffer.concat(buffers)
            //github传的值请求事件类型：push事件
            let event = req.headers['x-github-event']
            //github传递了请求体body,同时传递了签名，需要验证签名是否正确
            let signatrue = req.headers['x-hub-signatrue']
            if (signatrue !== sign(body)) {
                //sign不相等 直接返回错误
                return res.end('Not Allowed')
            }
            //sign相同 执行同意请求
            //设置github请求的请求头，设置返回数据的格式为json
            res.setHeader('Content-Type', 'application/json');
            //返回通知github请求已经成功
            res.end(JSON.stringify({ ok: true }));
        })
    } else {
        res.end('NOT Found');
    }
})

server.listen(4000, () => {
    console.log('webhook服务已经在4000端口启动');
})

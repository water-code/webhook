const http = require("http");	//http模块用来创建http服务
const createHandler = require("github-webhook-handler");//中间件，用来监听github的webHook的事件
const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");
const handler = createHandler({
    path: "/webhook",
    secret: "mySecretKiKoHashKey",
});//创建实例，path和secret是自定义的，后面在github上配置时需要保持一致

http.createServer(function (req, res) {
    handler(req, res, function () {
        res.statusCode = 200;
    });
}).listen(8082);//创建http服务并且监听8082端口

handler.on("push", function (event) {
    const projectDir = path.resolve(`./${event.payload.repository.name}`);
    const projectDirFront = path.resolve(`./${event.payload.repository.name}/xiangchengfront`);

    //拉取项目前先删除一次项目
  	if (fs.existsSync(projectDir)) {
        execSync(`rm -rf ${event.payload.repository.name}`, {
            stdio: "inherit",
        });
    }

    // 拉取仓库最新代码 
    execSync(
        `git clone git@github.com:water-code/xiangchengliangbanji.git ${projectDir}`,
        {
            stdio: "inherit",
        }
    );
    // 复制 Dockerfile 到项目目录
    fs.copyFileSync(
        path.resolve(`./Dockerfile`),
        path.resolve(projectDirFront, "./Dockerfile")
    );

    // 复制 .dockerignore 到项目目录
    fs.copyFileSync(
        path.resolve(`./.dockerignore`),
        path.resolve(projectDirFront, "./.dockerignore")
    );

    // 创建docker镜像 并将这个镜像标记为最新版本
    execSync(
        `docker build . -t ${event.payload.repository.name}-image:latest `,
        {
            stdio: "inherit",
            cwd: projectDirFront,
        }
    );

      // 销毁 docker 容器 在创建容器前先销毁上一次创建的容器
      execSync(
        `docker ps -a -f "name=^${event.payload.repository.name}-container" --format="{{.Names}}" | xargs -r docker stop | xargs -r docker rm`,
        {
            stdio: "inherit",
        }
    );
    
    // 创建docker容器 映射服务器的9527端口到 docker容器的80端口
    execSync(
        `docker run -d -p 9527:80 --name ${event.payload.repository.name}-container  ${event.payload.repository.name}-image:latest`,
        {
            stdio: "inherit",
        }
    );

    console.log("success");

})//监听github仓库的push事件

> [!TIP]
> 技术问题导致项目目前无法正常部署到ServerLess中，非Serverless可用，望大佬修复并放在issues里面

## File-Updata-Github
这是一个基于Node.js编写的一个工具，使用Github仓库作为储存，支持Serverless平台部署的私有化图床
>[TIP]
>这是一个基于Node.js编写的一个工具，可以快速列出，上传和打开特定Github仓库的文件，而且代码内置使用了 mirror.mengze2.cn 的gh代理，可以作为图床使用，因为Github当个文件最大25MB，所以不推荐当网盘，因为下载速度也不太行，但是作为图床是够够的。

## 部署方法
支持多平台部署，IaaS和大部分ServerLess平台都支持。

### 使用Vercel部署
使用Vercel一键部署：
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/MengZe2l/File-Updata-Github)
>[TIP]
>因为一些问题，Vercel部署需要等待下个版本

环境变量：
 **GITHUB_TOKEN** | Github个人访问令牌  
------|---
 **OWNER** | Github用户名  
 **REPO** | Github仓库名  
 **BRANCH** | main分支，默认(main)  
 
### IaaS基础设施部署
先克隆本仓库：
```shell
git clone https://github.com/MengZe2l/File-Updata-Github.git
```
再安装依赖：
```shell
npm i
```
然后创建`.env`环境配置文件，并输入如下内容
```env
GITHUB_TOKEN=Github个人访问令牌
OWNER=Github用户名
REPO=Github仓库名
BRANCH=main(分支，默认main)
```
完成之后运行：
```shell
npm run test
```
将在本地3008端口开启服务
你也可以尝试使用Nginx反向代理到80/443端口。

## LICENSE
本项目使用MIT LICENSE进行开源

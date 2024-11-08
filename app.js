require('dotenv').config();
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan'); // 请求日志中间件
const helmet = require('helmet'); // 安全中间件
const compression = require('compression'); // 压缩中间件

const app = express();
const upload = multer({ dest: 'uploads/' });

// 使用中间件
app.use(helmet()); // 增强 HTTP 头的安全性
app.use(compression()); // 启用响应压缩
app.use(morgan('combined', {
    skip: function (req, res) { return res.statusCode < 400; },
    stream: process.stdout,
    format: ':method :url :status :res[content-length] - :response-time ms 中文请求日志'
})); // 请求日志中间件，输出中文提示
app.use(express.static('public'));
app.use(express.json()); // 用于解析 JSON 格式的请求体
app.use(express.urlencoded({ extended: true })); // 用于解析 URL 编码的请求体

// 配置环境变量
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = process.env.OWNER;
const REPO = process.env.REPO;
const BRANCH = process.env.BRANCH;
const GITHUB_API_BASE = `https://mirror.mengze2.cn/proxy/api.github.com/repos/${OWNER}/${REPO}`;

// 设置视图引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'pages'));

// 首页路由，列出文件
app.get('/', async (req, res) => {
    try {
        const response = await axios.get(`${GITHUB_API_BASE}/contents/?ref=${BRANCH}`, {
            headers: {
                Authorization: `Bearer ${GITHUB_TOKEN}`,
            },
        });

        const files = response.data.map(file => {
            return {
                ...file,
                download_url: file.download_url ? `https://mirror.mengze2.cn/proxy/${file.download_url.replace(/^https?:\/\//, '')}` : null
            };
        });

        res.render('index', { files });
    } catch (error) {
        console.error('获取仓库文件列表时出错:', error.message);
        res.status(500).send('获取仓库文件列表时出错');
    }
});

// 文件上传路由
app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('未上传文件。');
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const fileContent = fs.readFileSync(filePath, { encoding: 'base64' });

    try {
        const response = await axios.put(
            `${GITHUB_API_BASE}/contents/${fileName}`,
            {
                message: `上传 ${fileName}`,
                content: fileContent,
                branch: BRANCH,
            },
            {
                headers: {
                    Authorization: `Bearer ${GITHUB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        fs.unlinkSync(filePath); // 删除临时文件
        res.redirect('/');
    } catch (error) {
        console.error('上传文件到 GitHub 时出错:', error.message);
        res.status(500).send('上传文件到 GitHub 时出错');
    }
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`服务器正在运行在 http://localhost:${PORT}`);
});

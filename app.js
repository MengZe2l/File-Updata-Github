require('dotenv').config();
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(helmet());
app.use(compression());
app.use(morgan('combined', {
    skip: function (req, res) { return res.statusCode < 400; },
    stream: process.stdout,
    format: ':method :url :status :res[content-length] - :response-time ms'
}));
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = process.env.OWNER;
const REPO = process.env.REPO;
const BRANCH = process.env.BRANCH;
const GITHUB_API_BASE = `https://mirror.mengze2.cn/proxy/api.github.com/repos/${OWNER}/${REPO}`;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'pages'));

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

        fs.unlinkSync(filePath);
        res.redirect('/');
    } catch (error) {
        console.error('上传文件到 GitHub 时出错:', error.message);
        res.status(500).send('上传文件到 GitHub 时出错');
    }
});

module.exports = app;

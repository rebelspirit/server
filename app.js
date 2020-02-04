const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
const config = require('config');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');

const httpsOptions = {
    cert: fs.readFileSync('./ssl/godsavethequeen_website.crt'),
    ca: fs.readFileSync('./ssl/godsavethequeen_website.ca-bundle'),
    p7b: fs.readFileSync('./ssl/godsavethequeen_website.p7b')
};

const app = express();
const httpServer = http.createServer(app);
const httpsServer = https.createServer(httpsOptions, app);

app.use((req, res, next) => {
   if(req.protocol === 'http') {
       res.redirect(301, `https://${req.headers.host}${req.url}`)
   }
});

app.use(cors());

app.use(express.json({extended: true}));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/collected', require('./routes/collectData.routes'));

if (process.env.NODE_ENV === 'production') {
    app.use('/', express.static(path.join(__dirname, 'client', 'build')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
    })
}

const PORT = config.get('port') || 5000;

const start = async () => {
    try {
        await mongoose.connect(config.get('mongoURL'), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });
        httpServer.listen(PORT, () => console.log(`App has been started on port ${PORT}..`));
        httpsServer.listen(8080, () => console.log(`App has been started on port 8080..`));
    } catch (e) {
        console.log('Server Error', e.message)
    }
};
start();


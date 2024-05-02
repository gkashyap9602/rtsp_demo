const express = require('express');
const WebSocket = require('ws');
const https = require('https');
const app = express();
require('dotenv').config();
const path = require('path')
const fs = require('fs');
const { proxy } = require('rtsp-relay')(app);

// Your SSL certificate and private key paths
const sslKey = fs.readFileSync('/etc/letsencrypt/live/rtsp.glenwoodsouth.com/privkey.pem');
const sslCert = fs.readFileSync('/etc/letsencrypt/live/rtsp.glenwoodsouth.com/cert.pem');

// HTTPS server options
const httpsOptions = {
  key: sslKey,
  cert: sslCert
};

// Create an HTTPS server
const server = https.createServer(httpsOptions, app);


// Initialize WebSocket server
const wss = new WebSocket.Server({ server });

const handler = (ws, url) => {
  const proxyFunction = proxy({
    url: url,
    verbose: false,
    transport: 'tcp'
  })

  proxyFunction(ws);
};

wss('/api/stream', (ws, req) => {
  handler(ws, req.query.url);
});

app.use(express.static(path.join(__dirname, './views')));

app.get('/', (req, res) => {
  res.sendFile(path.join('/index.html'));
});

app.get('/healthCheck', (req, res) => {
  res.status(200).send('Server is running and healthy');
});

const LOCAL_PORT = 6001;
const PORT = process.env.APP_PORT || LOCAL_PORT;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
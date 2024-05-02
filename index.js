const express = require('express');
const app = express();
require('dotenv').config();
const path = require('path')
const { proxy } = require('rtsp-relay')(app);

const handler = (ws, url) => {
  const proxyFunction = proxy({
    url: url,
    verbose: false,
    transport: 'tcp'
  })

  proxyFunction(ws);
};

app.ws('/api/stream', (ws, req) => {
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
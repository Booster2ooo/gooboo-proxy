const https = require('https'),
      //http = require('http'),
      fs   = require('fs'),
      path = require('path'),
      colors = require('colors'),
      express = require('express'),
      bodyParser = require('body-parser'),
      { createProxyMiddleware, responseInterceptor  } = require('http-proxy-middleware')
      certDir = path.join(__dirname, 'cert'),
      serverOpts = {
        key: fs.readFileSync(path.join(certDir, 'key.pem'), 'utf8'),
        cert: fs.readFileSync(path.join(certDir, 'cert.pem'), 'utf8')
      },
      saveFile = path.join(__dirname, 'save.file')
      ;
const app = express();

app.use(express.static('public'));
app.get('/save', (req, res) => {
  if (!fs.existsSync(saveFile)) {
    return res.end();
  }
  res.send(fs.readFileSync(saveFile));
});
app.post('/save', bodyParser.text({type: '*/*'}), (req, res) => {
  fs.writeFileSync(saveFile, req.body, { encoding:'utf8', flag:'w' });
  res.end();
});
app.use(
  '/',
  createProxyMiddleware({
    target: 'https://tendsty.github.io/gooboo/',
    changeOrigin: true,
    logger: console,
    followRedirects: true,
    selfHandleResponse: true,
    on: {
      proxyRes: responseInterceptor(async (buffer, proxyRes, req, res) => {
        let body = buffer.toString('utf8');
        if (res.statusCode === 200 && res.getHeader('content-type') === 'text/html; charset=utf-8') {
          body = body
            .replace(/\/gooboo/g, 'https://tendsty.github.io/gooboo')
            .replace('</body></html>', '<script defer="defer" src="/save-file-manager.js"></script></body></html>')
            ;
        }
        return body;
      })
    }
  }),
);

const httpsServer = https.createServer(serverOpts, app);
httpsServer.listen(8010);

console.log('https proxy server'.blue + ' started '.green.bold + 'on port '.blue + '8010'.yellow);

// Leave it empty ('') if you're serving the app straight away. I'm using a reverse proxy that serves the app under https//my-server.com/gooboo
const applicationPath = '/gooboo';

// Turn to true if you want to directly serve the app in https. Using a reverse proxy instead is recommanded.
const serveHttps = false;

// Impopts
const https = require('https'),
      fs   = require('fs'),
      path = require('path'),
      colors = require('colors'),
      express = require('express'),
      bodyParser = require('body-parser'),
      { createProxyMiddleware, responseInterceptor  } = require('http-proxy-middleware')
// "consts"
      certDir = path.join(__dirname, 'cert'),
      serverOpts = {
        key: fs.readFileSync(path.join(certDir, 'key.pem'), 'utf8'),
        cert: fs.readFileSync(path.join(certDir, 'cert.pem'), 'utf8')
      },
      saveFile = path.join(__dirname, 'save.file')
      ;

// Declare the proxy which injects our custom scripts
const proxy = createProxyMiddleware({
  target: 'https://tendsty.github.io/gooboo/',
  changeOrigin: true,
  logger: console,
  followRedirects: true,
  selfHandleResponse: true,
  pathRewrite: (path, req) => {
    if (!applicationPath) {
      return path;
    }
    return path.replace(applicationPath, '/');
  },
  on: {
    proxyRes: responseInterceptor(async (buffer, proxyRes, req, res) => {
      let body = buffer.toString('utf8');
      if (res.statusCode === 200 && res.getHeader('content-type') === 'text/html; charset=utf-8') {
        body = body
          .replace(/\/gooboo/g, 'https://tendsty.github.io/gooboo')
          .replace('</body></html>', `
          <script>
            const applicationPath = '${applicationPath}';
          </script>
          <script defer="defer" src="${applicationPath}/save-file-manager.js"></script>
          <script defer="defer" src="${applicationPath}/automations.js"></script>
          </body>
          </html>`)
          ;
      }
      return body;
    })
  }
});

// Define the Express pipeline
const app = express();
app.use(express.static('public')); // exposes the public/ directory containing our scripts
app.get('/save', (req, res) => { // exposes an API endpoint to gather the content of the save file
  if (!fs.existsSync(saveFile)) {
    return res.end();
  }
  res.send(fs.readFileSync(saveFile));
});
app.post('/save', bodyParser.text({type: '*/*'}), (req, res) => {  // exposes an API endpoint to update the content of the save file
  fs.writeFileSync(saveFile, req.body, { encoding:'utf8', flag:'w' });
  res.end();
});
app.use('/', proxy); // register the proxy middleware

// Serve the app
if (!serveHttps) {
  app.listen(8001);
  console.log('http proxy server'.blue + ' started '.green.bold + 'on port '.blue + '8001'.yellow);
}
else {
  const httpsServer = https.createServer(serverOpts, app);
  httpsServer.listen(8010);
  console.log('https proxy server'.blue + ' started '.green.bold + 'on port '.blue + '8010'.yellow);
}

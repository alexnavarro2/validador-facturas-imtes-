const https = require('https');

module.exports = function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, SOAPAction');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  const chunks = [];
  req.on('data', c => chunks.push(c));
  req.on('end', () => {
    const body = Buffer.concat(chunks);

    const options = {
      hostname: 'consultaqr.facturaelectronica.sat.gob.mx',
      path: '/ConsultaCFDIService.svc',
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': '"http://tempuri.org/IConsultaCFDIService/Consulta"',
        'User-Agent': 'Mozilla/5.0',
        'Content-Length': body.length,
      },
    };

    const satReq = https.request(options, satRes => {
      const parts = [];
      satRes.on('data', d => parts.push(d));
      satRes.on('end', () => {
        const result = Buffer.concat(parts).toString('utf-8');
        res.setHeader('Content-Type', 'text/xml; charset=utf-8');
        res.statusCode = 200;
        res.end(result);
      });
    });

    satReq.on('error', err => {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: err.message }));
    });

    satReq.setTimeout(20000, () => {
      satReq.destroy();
      res.statusCode = 504;
      res.end(JSON.stringify({ error: 'timeout' }));
    });

    satReq.write(body);
    satReq.end();
  });
};

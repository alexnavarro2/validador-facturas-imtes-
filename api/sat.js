// api/sat.js — Proxy SAT para Vercel (CommonJS)
const https = require('https');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, SOAPAction');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const body = await new Promise((resolve, reject) => {
      const chunks = [];
      req.on('data', chunk => chunks.push(chunk));
      req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
      req.on('error', reject);
    });

    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'consultaqr.facturaelectronica.sat.gob.mx',
        path: '/ConsultaCFDIService.svc',
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': '"http://tempuri.org/IConsultaCFDIService/Consulta"',
          'User-Agent': 'Mozilla/5.0',
          'Content-Length': Buffer.byteLength(body),
        },
      };

      const satReq = https.request(options, (satRes) => {
        const chunks = [];
        satRes.on('data', chunk => chunks.push(chunk));
        satRes.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
      });

      satReq.on('error', reject);
      satReq.setTimeout(20000, () => {
        satReq.destroy();
        reject(new Error('timeout'));
      });
      satReq.write(body);
      satReq.end();
    });

    res.setHeader('Content-Type', 'text/xml; charset=utf-8');
    return res.status(200).send(result);

  } catch (err) {
    console.error('SAT error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

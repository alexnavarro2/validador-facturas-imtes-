// api/sat.js — Proxy SAT para Vercel
// Ruta: /api/sat.js en tu repositorio GitHub

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, SOAPAction');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    // Leer body manualmente (bodyParser desactivado)
    const body = await new Promise((resolve, reject) => {
      const chunks = [];
      req.on('data', chunk => chunks.push(chunk));
      req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
      req.on('error', reject);
    });

    const SAT_URL = 'https://consultaqr.facturaelectronica.sat.gob.mx/ConsultaCFDIService.svc';

    const satRes = await fetch(SAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': '"http://tempuri.org/IConsultaCFDIService/Consulta"',
        'User-Agent': 'Mozilla/5.0 (compatible; IMTES/1.0)',
        'Accept': 'text/xml, application/xml',
      },
      body: body,
    });

    const text = await satRes.text();
    res.setHeader('Content-Type', 'text/xml; charset=utf-8');
    return res.status(200).send(text);

  } catch (err) {
    console.error('SAT proxy error:', err);
    return res.status(500).json({ error: err.message });
  }
}

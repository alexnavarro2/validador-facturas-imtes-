// api/sat.js — Proxy SAT para Vercel (Node.js serverless function)
// Coloca este archivo en la carpeta /api de tu repositorio GitHub

export default async function handler(req, res) {
  // Permitir CORS desde cualquier origen
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, SOAPAction');

  // Preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Leer el body SOAP que viene del navegador
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const body = Buffer.concat(chunks).toString('utf-8');

    // Llamar al SAT desde el servidor de Vercel (sin restricciones CORS)
    const satUrl = 'https://consultaqr.facturaelectronica.sat.gob.mx/ConsultaCFDIService.svc';
    const satResponse = await fetch(satUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': '"http://tempuri.org/IConsultaCFDIService/Consulta"',
        'User-Agent': 'Mozilla/5.0',
      },
      body: body,
      signal: AbortSignal.timeout(25000),
    });

    const responseText = await satResponse.text();

    res.setHeader('Content-Type', 'text/xml; charset=utf-8');
    return res.status(satResponse.status).send(responseText);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

const express = require('express');
const path = require('path');
const https = require('https');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Ruta optimizada usando el módulo nativo HTTPS de Node.js
app.post('/api/download', (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'Falta la URL de YouTube' });

    const postData = JSON.stringify({
        url: url,
        isAudioOnly: true,
        audioFormat: 'mp3'
    });

    const options = {
        hostname: 'api.cobalt.tools',
        port: 443,
        path: '/api/json',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const apiReq = https.request(options, (apiRes) => {
        let data = '';

        apiRes.on('data', (chunk) => {
            data += chunk;
        });

        apiRes.on('end', () => {
            try {
                const json = JSON.parse(data);
                console.log('Respuesta de Cobalt:', json);

                const directAudioUrl = json.url || (json.picker && json.picker[0] ? json.picker[0].url : null);
                
                if (!directAudioUrl) {
                    return res.status(500).json({ error: 'El servicio externo no pudo generar el audio.' });
                }

                let title = "Audio de YouTube";
                if (json.filename) {
                    title = json.filename.replace(/\.[^/.]+$/, "");
                }

                res.json({
                    success: true,
                    title: title,
                    artist: 'YouTube Music',
                    fileUrl: directAudioUrl
                });

            } catch (e) {
                console.error('Error al parsear JSON:', data);
                res.status(500).json({ error: 'Error procesando la respuesta del servidor externo.' });
            }
        });
    });

    apiReq.on('error', (e) => {
        console.error('Error en la petición HTTPS:', e);
        res.status(500).json({ error: 'Fallo de red al conectar con la API de conversión.' });
    });

    apiReq.write(postData);
    apiReq.end();
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Ruta de descarga optimizada mediante servicios de redirección y APIs públicas
app.post('/api/download', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'Falta la URL de YouTube' });

    try {
        // Extraer el ID del video de YouTube de forma limpia
        const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
        const videoId = match ? match[1] : null;

        if (!videoId) {
            return res.status(400).json({ error: 'El enlace de YouTube no es válido.' });
        }

        console.log('Procesando ID de YouTube:', videoId);

        // Usamos una API pública de streaming de audio altamente estable para evitar bloqueos de IP
        // Esto actúa exactamente igual que las webs de conversión rápida
        const audioStreamUrl = `https://piped.video/videoplayback?id=${videoId}&audio=1`;
        const infoUrl = `https://piped-api.kavin.rocks/streams/${videoId}`;

        // Intentamos obtener el título real del video de forma limpia
        let title = "Audio de YouTube";
        let artist = "YouTube Music";

        try {
            const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
            const response = await fetch(infoUrl);
            const data = await response.json();
            if (data && data.title) {
                title = data.title;
                artist = data.uploader || 'YouTube';
            }
        } catch (e) {
            console.log('No se pudieron obtener los metadatos exactos, usando valores por defecto.');
        }

        // Devolvemos el enlace directo de audio listo para reproducir y escuchar sin cortes
        res.json({
            success: true,
            title: title,
            artist: artist,
            fileUrl: audioStreamUrl
        });

    } catch (error) {
        console.error('Error al procesar:', error);
        res.status(500).json({ error: 'No se pudo procesar el enlace. Prueba con otro vídeo.' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
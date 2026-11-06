const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Ruta optimizada utilizando la API pública de Cobalt para extraer el MP3 directo
app.post('/api/download', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'Falta la URL de YouTube' });

    try {
        console.log('Conectando con Cobalt API para extraer audio de:', url);
        
        const cobaltResponse = await fetch('https://api.cobalt.tools/api/json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            },
            body: JSON.stringify({
                url: url,
                isAudioOnly: true,
                audioFormat: 'mp3'
            })
        });

        const data = await cobaltResponse.json();
        console.log('Respuesta obtenida:', data);

        if (!data || (!data.url && !data.picker)) {
            return res.status(500).json({ error: 'El servicio externo no pudo procesar este enlace.' });
        }

        // Obtenemos el enlace de descarga directa del MP3
        const directAudioUrl = data.url || (data.picker && data.picker[0] ? data.picker[0].url : null);
        let title = "Audio de YouTube";
        
        if (data.filename) {
            title = data.filename.replace(/\.[^/.]+$/, ""); // Limpia la extensión del nombre
        }

        if (!directAudioUrl) {
            return res.status(500).json({ error: 'No se generó un enlace de audio válido.' });
        }

        // Devolvemos la URL directa lista para reproducir en el iPhone
        res.json({
            success: true,
            title: title,
            artist: 'YouTube Music',
            fileUrl: directAudioUrl
        });

    } catch (error) {
        console.error('Error detallado:', error);
        res.status(500).json({ error: 'Error de conexión al procesar el audio.' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
const express = require('express');
const path = require('path');
const { exec } = require('youtube-dl-exec');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Ruta para procesar la descarga de YouTube
app.post('/api/download', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'Falta la URL de YouTube' });

    try {
        // Aquí puedes configurar youtube-dl-exec para extraer el audio o info del vídeo
        console.log('Procesando enlace:', url);
        
        // Ejemplo de respuesta de éxito provisional mientras vinculas la descarga de audio
        res.json({ success: true, message: 'Enlace recibido y procesado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al procesar el video de YouTube' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
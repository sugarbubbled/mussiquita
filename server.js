const express = theRequire = require('express');
const path = require('path');
const fs = require('fs');
const youtubedl = require('youtube-dl-exec');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir);
}
app.use('/downloads', express.static(downloadsDir));

app.post('/api/download', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'Falta la URL de YouTube' });

    try {
        console.log('Intentando procesar enlace con bypass de cliente:', url);
        
        // Forzamos el cliente de Android/iOS para evitar restricciones de IP de servidores cloud
        const outputTemplate = path.join(downloadsDir, '%(id)s.%(ext)s');
        
        const output = await youtubedl(url, {
            extractAudio: true,
            audioFormat: 'mp3',
            output: outputTemplate,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            // Truco crítico para servidores cloud: simular cliente de app móvil
            extractorArgs: 'youtube:player_client=android',
        });

        // Buscar el archivo generado recientemente en la carpeta downloads
        const files = fs.readdirSync(downloadsDir);
        // Extraemos el ID del video de la URL para localizar su archivo .mp3
        const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
        const videoId = match ? match[1] : null;

        if (!videoId) {
            throw new Error('No se pudo extraer el ID del video de la URL.');
        }

        const mp3FileName = `${videoId}.mp3`;
        const mp3FilePath = path.join(downloadsDir, mp3FileName);

        // Obtener título rápido
        const info = await youtubedl(url, { dumpSingleJson: true, noCheckCertificates: true, extractorArgs: 'youtube:player_client=android' });

        res.json({
            success: true,
            title: info.title || 'Audio de YouTube',
            artist: info.uploader || 'YouTube',
            fileUrl: `/downloads/${mp3FileName}`
        });

    } catch (error) {
        console.error('Error detallado de youtube-dl:', error);
        res.status(500).json({ error: 'YouTube bloqueó la petición desde el servidor. Prueba con otro enlace o video musical.' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
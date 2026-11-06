const express = require('express');
const path = require('path');
const fs = require('fs');
const youtubedl = require('youtube-dl-exec');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Crear carpeta de descargas si no existe
const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir);
}
// Permitir que el navegador reproduzca los archivos descargados
app.use('/downloads', express.static(downloadsDir));

// Ruta real para descargar MP3 de YouTube
app.post('/api/download', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'Falta la URL de YouTube' });

    try {
        console.log('Obteniendo información del video...');
        // Obtener metadatos del vídeo (título y autor)
        const info = await youtubedl(url, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
        });

        const videoId = info.id;
        const mp3FileName = `${videoId}.mp3`;
        const mp3FilePath = path.join(downloadsDir, mp3FileName);

        // Si ya se descargó antes, lo devolvemos directamente para ahorrar tiempo
        if (fs.existsSync(mp3FilePath)) {
            console.log('El archivo ya existe en caché:', mp3FileName);
            return res.json({
                success: true,
                title: info.title,
                artist: info.uploader || 'YouTube',
                fileUrl: `/downloads/${mp3FileName}`
            });
        }

        console.log('Descargando y convirtiendo a MP3:', info.title);
        // Descargar el audio en formato MP3 usando ffmpeg
        await youtubedl(url, {
            extractAudio: true,
            audioFormat: 'mp3',
            output: path.join(downloadsDir, `${videoId}.%(ext)s`),
            noCheckCertificates: true,
            noWarnings: true,
        });

        console.log('¡Descarga completada con éxito!');
        res.json({
            success: true,
            title: info.title,
            artist: info.uploader || 'YouTube',
            fileUrl: `/downloads/${mp3FileName}`
        });

    } catch (error) {
        console.error('Error detallado en la descarga:', error);
        res.status(500).json({ error: 'No se pudo descargar el video. Comprueba que el enlace sea correcto.' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
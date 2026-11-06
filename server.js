const express = require('express');
const path = require('path');
const app = express();

// Usar el puerto que asigne Railway automáticamente o el 3000 para local
const PORT = process.env.PORT || 3000;

// Servir los archivos estáticos de la interfaz
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Ruta de comprobación básica para verificar que el servidor vive
app.get('/api/test', (req, res) => {
    res.json({ status: 'online', mensaje: 'El servidor de música funciona perfectamente' });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
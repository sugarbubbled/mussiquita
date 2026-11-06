const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/api/test', (req, res) => {
    res.json({ status: 'online', mensaje: 'El servidor de música funciona perfectamente' });
});

// Añadimos '0.0.0.0' para que Railway pueda entrar desde fuera
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
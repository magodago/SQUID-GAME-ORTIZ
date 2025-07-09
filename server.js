const express = require('express');
const path = require('path');

const app = express();
const PORT = 8000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Route for the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`);
  console.log(`📁 Sirviendo archivos desde la carpeta: ${path.join(__dirname, 'public')}`);
  console.log(`🌐 Abre tu navegador y ve a: http://localhost:${PORT}`);
}); 
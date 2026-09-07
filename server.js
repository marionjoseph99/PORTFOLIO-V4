const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static assets with appropriate cache control
app.use(express.static(path.join(__dirname, '.'), {
    maxAge: '1h',
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.glb')) {
            res.setHeader('Content-Type', 'model/gltf-binary');
        }
    }
}));

// Fallback to index.html for any SPA navigation
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Portfolio server active at http://0.0.0.0:${PORT}`);
});

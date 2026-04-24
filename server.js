const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3007;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/products', async (req, res) => {
    try {
        const products = await db.getAllProducts();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

app.post('/api/products', async (req, res) => {
    const { name, price, stock } = req.body;
    if (!name || price == null || stock == null) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        const newProduct = await db.createProduct(name, price, stock);
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear producto' });
    }
});

app.put('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const { name, price, stock } = req.body;
    if (!name || price == null || stock == null) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        const updated = await db.updateProduct(id, name, price, stock);
        if (!updated) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json({ id: Number(id), name, price, stock });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = await db.deleteProduct(id);
        if (!deleted) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json({ message: 'Producto eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar producto' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:3007`);
});

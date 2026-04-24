const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const initialize = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    stock INTEGER NOT NULL
    )
    `;
    db.run(sql);
};

const getAllProducts = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM products ORDER BY id', (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

const createProduct = (name, price, stock) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO products (name, price, stock) VALUES (?, ?, ?)';
        db.run(sql, [name, price, stock], function (err) {
            if (err) return reject(err);
            resolve({ id: this.lastID, name, price, stock });
        });
    });
};

const updateProduct = (id, name, price, stock) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE products SET name = ?, price = ?, stock = ? WHERE id = ?';
        db.run(sql, [name, price, stock, id], function (err) {
            if (err) return reject(err);
            resolve(this.changes > 0);
        });
    });
};

const deleteProduct = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM products WHERE id = ?';
        db.run(sql, [id], function (err) {
            if (err) return reject(err);
            resolve(this.changes > 0);
        });
    });
};

initialize();

module.exports = {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
};

const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path'); // Agregado para manejar rutas de archivos

const app = express();
const port = 3000;

// Middleware para procesar datos de formularios y JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Sirve archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal que sirve el archivo index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Configura la conexión a la base de datos
const pool = new Pool({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'gym',
    password: 'toor',
    port: 5432,
});

// Ruta para el login
app.post('/login', async (req, res) => {
    const { correo, contraseña } = req.body;

    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);

        if (result.rows.length > 0) {
            const hashedPassword = result.rows[0].contraseña;
            const passwordMatch = await bcrypt.compare(contraseña, hashedPassword);

            if (passwordMatch) {
                // Redireccionar a menu.html en lugar de enviar un mensaje
                res.redirect('/menu.html');
            } else {
                res.status(401).send('Contraseña incorrecta.');
            }
        } else {
            res.status(404).send('Usuario no encontrado.');
        }
    } catch (err) {
        console.error('Error en el login:', err);
        res.status(500).send('Error interno del servidor.');
    }
});

// Ruta para el registro
app.post('/register', async (req, res) => {
    const { nombre, apellido, correo, contraseña, telefono, rol } = req.body;

    try {
        // Verificar si el usuario ya existe
        const userCheck = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
        
        if (userCheck.rows.length > 0) {
            return res.status(400).send('El correo ya está registrado.');
        }
        
        const hashedPassword = await bcrypt.hash(contraseña, 10);
        await pool.query(
            'INSERT INTO usuarios (nombre, apellido, correo, contraseña, telefono, rol) VALUES ($1, $2, $3, $4, $5, $6)',
            [nombre, apellido, correo, hashedPassword, telefono, rol]
        );
        res.send('Registro exitoso.');
    } catch (err) {
        console.error('Error en el registro:', err);
        res.status(500).send('Error interno del servidor.');
    }
});

// Manejo de errores para rutas no encontradas
app.use((req, res) => {
    res.status(404).send('Página no encontrada.');
});

// Inicia el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
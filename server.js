const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Simulação de um banco de dados
const users = [];

// Rota de registro
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    // Verifica se o usuário já existe
    const userExists = users.find(user => user.username === username);
    if (userExists) {
        return res.status(400).json({ message: 'Usuário já existe' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria e salva o usuário
    const newUser = { username, password: hashedPassword };
    users.push(newUser);

    res.status(201).json({ message: 'Usuário registrado com sucesso' });
});

// Rota de login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Verifica se o usuário existe
    const user = users.find(user => user.username === username);
    if (!user) {
        return res.status(400).json({ message: 'Credenciais inválidas' });
    }

    // Verifica a senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: 'Credenciais inválidas' });
    }

    // Gera um token JWT
    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });

    res.json({ message: 'Login bem-sucedido', token });
});

// Rota protegida
app.get('/protected', (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ message: 'Acesso permitido', user: decoded });
    } catch (err) {
        res.status(401).json({ message: 'Token inválido' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

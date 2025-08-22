const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('<h1>Aplicação em modo de Produção Utilizando Node!</h1>');
});

// Uma rota para simular a leitura das variáveis de ambiente
app.get('/config', (req, res) => {
    res.json({
        db_host: process.env.DB_HOST,
        db_user: process.env.DB_USER,
        db_name: process.env.DB_NAME,
        // NUNCA exponha a senha em uma rota real! Isto é apenas para teste.
        db_pass_exists: process.env.DB_PASSWORD ? 'Sim' : 'Não'
    });
});

app.listen(port, () => {
  console.log(`Aplicação de produção rodando na porta ${port}`);
});
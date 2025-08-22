const express = require('express');
const app = express();
const port = 3000;

// O HTML da nossa página
const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cortinas & Cia</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            color: #333;
        }
        .header {
            background-color: #5a3e36; /* Marrom escuro */
            color: white;
            padding: 20px 40px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
        }
        .container {
            padding: 20px;
            max-width: 1200px;
            margin: auto;
        }
        .product-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .product-card {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            overflow: hidden;
            text-align: center;
            padding-bottom: 15px;
        }
        .product-card img {
            width: 100%;
            height: 180px;
            object-fit: cover;
        }
        .product-card h3 {
            margin: 15px 0;
        }
        .product-card p {
            font-size: 1.2em;
            color: #2c5d63; /* Verde petróleo */
            font-weight: bold;
        }
        .footer {
            background-color: #333;
            color: white;
            text-align: center;
            padding: 20px;
            margin-top: 40px;
        }
    </style>
</head>
<body>
    <header class="header">
        <h1>Cortinas & Cia</h1>
        <p>A elegância que sua casa merece.</p>
    </header>

    <div class="container">
        <h2>Nossos Produtos em Destaque</h2>
        <div class="product-grid">
            <div class="product-card">
                <img src="https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8Y3VydGFpbnx8fHx8fDE3MjQyODc1MzA&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080" alt="Cortina de Linho">
                <h3>Cortina de Linho</h3>
                <p>R$ 299,90</p>
            </div>
            <div class="product-card">
                <img src="https://images.unsplash.com/photo-1599954511977-2f1619f71d5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8Y3VydGFpbnx8fHx8fDE3MjQyODc1NTE&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080" alt="Cortina Blackout">
                <h3>Cortina Blackout</h3>
                <p>R$ 349,90</p>
            </div>
            <div class="product-card">
                <img src="https://images.unsplash.com/photo-1618220252344-88b9a184b8e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8Y3VydGFpbnx8fHx8fDE3MjQyODc1NzM&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080" alt="Persiana Romana">
                <h3>Persiana Romana</h3>
                <p>R$ 450,00</p>
            </div>
             <div class="product-card">
                <img src="https://images.unsplash.com/photo-1615875605825-5eb9bb5fea38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8Y3VydGFpbnx8fHx8fDE3MjQyODc2MDg&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080" alt="Cortina Voil">
                <h3>Cortina Voil</h3>
                <p>R$ 259,90</p>
            </div>
        </div>
    </div>

    <footer class="footer">
        <p>&copy; 2025 Cortinas & Cia - Todos os direitos reservados.</p>
    </footer>
</body>
</html>
`;

// Rota principal agora envia nosso HTML completo
app.get('/', (req, res) => {
  res.send(htmlContent);
});

// Mantemos nossa rota de diagnóstico, se precisar
app.get('/config', (req, res) => {
    res.json({
        db_host: process.env.DB_HOST,
        db_user: process.env.DB_USER,
        db_name: process.env.DB_NAME,
        db_pass_exists: process.env.DB_PASSWORD ? 'Sim' : 'Não'
    });
});

app.listen(port, () => {
  console.log(`Aplicação de produção rodando na porta ${port}`);
});
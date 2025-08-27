// --- 1. CONFIGURAÇÃO INICIAL ---
// Importamos o 'express', que é o framework para criar nosso servidor web.
const express = require('express');
// Importamos o 'mysql2/promise', que nos permite conectar e conversar com o banco de dados MySQL.
const mysql = require('mysql2/promise');

// Criamos a nossa aplicação principal. A variável 'app' é o nosso servidor.
const app = express();
const port = 3000;

// Middleware: Habilita o servidor para entender dados enviados em formato JSON e de formulários HTML.
// Isso é essencial para que nosso formulário de cadastro funcione.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// --- 2. CONFIGURAÇÃO E PREPARAÇÃO DO BANCO DE DADOS ---
// Pegamos as credenciais seguras do banco de dados que o Docker Compose nos forneceu através do arquivo .env.
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};
// Criamos um "pool" de conexões. Isso é mais eficiente do que criar uma nova conexão a cada consulta.
const pool = mysql.createPool(dbConfig);

// Esta função assíncrona prepara nosso banco de dados.
async function setupDatabase() {
    try {
        // Pega uma conexão do pool para executar os comandos.
        const connection = await pool.getConnection();
        console.log('Conectado ao banco de dados MySQL com sucesso!');

        // Executa o comando SQL para criar a tabela 'products' se ela ainda não existir.
        // A tabela terá colunas para ID, nome, preço, URL da imagem e tipo.
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                imageUrl VARCHAR(255) NOT NULL,
                type VARCHAR(50) NOT NULL
            );
        `);

        // Verifica se a tabela está vazia.
        const [rows] = await connection.execute('SELECT COUNT(*) as count FROM products');
        if (rows[0].count === 0) {
            console.log('Tabela de produtos vazia. Inserindo dados de exemplo...');
            // Se estiver vazia, insere alguns produtos para que a loja não comece em branco.
            const initialProducts = [
                ['Cortina de Linho', 299.90, 'https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?w=1080', 'Linho'],
                ['Cortina Blackout', 349.90, 'https://images.unsplash.com/photo-1599954511977-2f1619f71d5a?w=1080', 'Blackout'],
                ['Persiana Romana', 450.00, 'https://images.unsplash.com/photo-1618220252344-88b9a184b8e2?w=1080', 'Persiana'],
                ['Cortina Voil', 259.90, 'https://images.unsplash.com/photo-1615875605825-5eb9bb5fea38?w=1080', 'Voil']
            ];
            await connection.query('INSERT INTO products (name, price, imageUrl, type) VALUES ?', [initialProducts]);
            console.log('Dados de exemplo inseridos com sucesso!');
        }
        
        // Devolve a conexão ao pool para que possa ser reutilizada.
        connection.release();
    } catch (error) {
        // Se algo der errado, mostra o erro no console e encerra a aplicação.
        console.error('Erro fatal ao conectar ou preparar o banco de dados:', error);
        process.exit(1);
    }
}


// --- 3. ROTAS DA API (AS "PORTAS DE SERVIÇO" DO BACKEND) ---

// ROTA PARA LER (GET) TODOS OS PRODUTOS
app.get('/api/products', async (req, res) => {
    try {
        const [products] = await pool.query('SELECT * FROM products ORDER BY id DESC');
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar produtos.' });
    }
});

// ROTA PARA CRIAR (POST) UM NOVO PRODUTO
app.post('/api/products', async (req, res) => {
    try {
        const { name, price, imageUrl, type } = req.body;
        const [result] = await pool.query(
            'INSERT INTO products (name, price, imageUrl, type) VALUES (?, ?, ?, ?)',
            [name, price, imageUrl, type]
        );
        res.status(201).json({ success: true, insertedId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar produto.' });
    }
});

// ROTA PARA ATUALIZAR (PUT) UM PRODUTO EXISTENTE
app.put('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, type } = req.body;
        await pool.query(
            'UPDATE products SET name = ?, price = ?, type = ? WHERE id = ?',
            [name, price, type, id]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar produto.' });
    }
});

// ROTA PARA DELETAR (DELETE) UM PRODUTO
app.delete('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM products WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar produto.' });
    }
});


// --- 4. ROTA PRINCIPAL (A INTERFACE QUE O USUÁRIO VÊ) ---
app.get('/', (req, res) => {
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <title>Gerenciamento - Cortinas & Cia</title>
        <style>
            body { font-family: 'Segoe UI', sans-serif; margin: 0; background-color: #f4f4f4; color: #333; }
            .header { background-color: #5a3e36; color: white; padding: 20px; text-align: center; }
            .container { padding: 20px; max-width: 1200px; margin: auto; }
            .form-section, .table-section { background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
            .form-group { margin-bottom: 15px; }
            label { display: block; margin-bottom: 5px; font-weight: bold; }
            input, select { width: 100%; padding: 10px; font-size: 1em; border-radius: 5px; border: 1px solid #ccc; box-sizing: border-box; }
            button { background-color: #2c5d63; color: white; padding: 8px 15px; border: none; border-radius: 5px; font-size: 1em; cursor: pointer; }
            button:hover { opacity: 0.9; }
            button.edit-btn { background-color: #f0ad4e; }
            button.delete-btn { background-color: #d9534f; margin-left: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f2f2f2; }
        </style>
    </head>
    <body>
        <header class="header"><h1>Gerenciamento - Cortinas & Cia</h1></header>
        <div class="container">
            <div class="form-section">
                <h2 id="form-title">Cadastrar Nova Cortina</h2>
                <form id="product-form">
                    <input type="hidden" id="productId" name="productId">
                    <div class="form-group">
                        <label for="name">Nome do Produto</label>
                        <input type="text" id="name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="price">Preço</label>
                        <input type="number" step="0.01" id="price" name="price" required>
                    </div>
                     <div class="form-group">
                        <label for="type">Tipo</label>
                        <select id="type" name="type" required>
                            <option value="Linho">Linho</option>
                            <option value="Blackout">Blackout</option>
                            <option value="Persiana">Persiana</option>
                            <option value="Voil">Voil</option>
                        </select>
                    </div>
                    <button type="submit" id="submit-button">Cadastrar</button>
                    <button type="button" id="cancel-button" style="display:none;">Cancelar Edição</button>
                </form>
            </div>
            <div class="table-section">
                <h2>Nossos Produtos no Banco de Dados</h2>
                <table>
                    <thead>
                        <tr><th>ID</th><th>Nome</th><th>Preço</th><th>Tipo</th><th>Ações</th></tr>
                    </thead>
                    <tbody id="products-table-body"></tbody>
                </table>
            </div>
        </div>
        <script>
            // --- JAVASCRIPT DO FRONTEND (A INTERATIVIDADE) ---
            const form = document.getElementById('product-form');
            const tableBody = document.getElementById('products-table-body');

            // Função que busca os dados da nossa API e desenha a tabela na tela
            async function renderTable() {
                const response = await fetch('/api/products');
                const products = await response.json();
                tableBody.innerHTML = '';
                products.forEach(p => {
                    const row = document.createElement('tr');
                    row.innerHTML = \`
                        <td>\${p.id}</td>
                        <td>\${p.name}</td>
                        <td>R$ \${p.price}</td>
                        <td>\${p.type}</td>
                        <td>
                            <button class="edit-btn" onclick="editProduct(\${p.id}, '\${p.name}', \${p.price}, '\${p.type}')">Editar</button>
                            <button class="delete-btn" onclick="deleteProduct(\${p.id})">Excluir</button>
                        </td>
                    \`;
                    tableBody.appendChild(row);
                });
            }

            // Função que preenche o formulário para edição
            function editProduct(id, name, price, type) {
                document.getElementById('form-title').innerText = 'Editando Produto ID: ' + id;
                document.getElementById('productId').value = id;
                document.getElementById('name').value = name;
                document.getElementById('price').value = price;
                document.getElementById('type').value = type;
                document.getElementById('submit-button').innerText = 'Salvar Alterações';
                document.getElementById('cancel-button').style.display = 'inline-block';
            }
            
            // Função para cancelar o modo de edição
            document.getElementById('cancel-button').addEventListener('click', () => {
                 document.getElementById('form-title').innerText = 'Cadastrar Nova Cortina';
                 document.getElementById('submit-button').innerText = 'Cadastrar';
                 document.getElementById('cancel-button').style.display = 'none';
                 form.reset();
            });

            // Função que envia os dados do formulário para a API (CRIAR ou ATUALIZAR)
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const id = document.getElementById('productId').value;
                const url = id ? \`/api/products/\${id}\` : '/api/products';
                const method = id ? 'PUT' : 'POST';
                const body = {
                    name: document.getElementById('name').value,
                    price: document.getElementById('price').value,
                    type: document.getElementById('type').value,
                    // Para criar, adicionamos uma URL de imagem padrão
                    imageUrl: id ? undefined : 'https://images.unsplash.com/photo-1615875605825-5eb9bb5fea38?w=1080'
                };

                await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                
                // Limpa o formulário e atualiza a tabela
                document.getElementById('cancel-button').click();
                renderTable();
            });

            // Função para deletar um produto
            async function deleteProduct(id) {
                if (confirm('Tem certeza que deseja excluir este produto?')) {
                    await fetch(\`/api/products/\${id}\`, { method: 'DELETE' });
                    renderTable();
                }
            }

            // Carrega a tabela assim que a página é aberta
            renderTable();
        </script>
    </body>
    </html>
    `;
    res.send(htmlContent);
});

// --- 5. INICIALIZAÇÃO DO SERVIDOR ---
// A aplicação começa a "escutar" por requisições na porta definida
// e primeiro garante que o banco de dados está pronto.
app.listen(port, async () => {
    await setupDatabase();
    console.log(`Aplicação de produção rodando na porta ${port}`);
});
# Usamos uma imagem oficial do Node.js como base
FROM node:18

# Definimos o diretório de trabalho dentro do contêiner
WORKDIR /usr/src/app

# Copiamos o package.json para instalar as dependências
COPY package*.json ./

# Rodamos o comando para instalar as dependências
RUN npm install

# Copiamos o resto do código da nossa aplicação
#COPY . . - não é preciso quando se usa o docker-compose pois ele vai gerenciar isso poiso código é espelhado em tempo real

# Expondo a porta que o nosso servidor usa
EXPOSE 3000

# O comando para iniciar a aplicação
CMD [ "node", "index.js" ]
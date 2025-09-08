# Usa a imagem oficial do Node.js
FROM node:18

# Define o diretório de trabalho no container
WORKDIR /app

# Copia o package.json e instala dependências
COPY package*.json ./
RUN npm install

# Copia o código da aplicação
COPY . .

# Expõe a porta da API
EXPOSE 5000

# Comando para iniciar a API
CMD ["npm", "start"]

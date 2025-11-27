FROM node:18-alpine

WORKDIR /app

# Copia arquivos de dependências
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia o código fonte
COPY . .

# Compila TypeScript
RUN npm run build

# Expõe a porta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]


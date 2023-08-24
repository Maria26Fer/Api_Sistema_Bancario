const express = require("express");
const rotas = require("./rotas");

const app = express();

app.use(express.json());

app.use(rotas);

const PORT = 3333;

app.listen(PORT, () => {
  console.log(`Servidor iniciado em http://localhost:${PORT}🚀`);
});

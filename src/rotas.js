const express = require("express");
const {
  obterContasBancarias,
  criarContaBancaria,
  atualizarUsuario,
  deletarConta,
  depositarNaConta,
  saque,
  transferenciaBancaria,
  saldoBancario,
  extratoBancario,
} = require("./controladores/controladorBanco");
const validarSenha = require("./intermediarios");
const rotas = express();

rotas.get("/contas", validarSenha, obterContasBancarias);
rotas.post("/contas", validarSenha, criarContaBancaria);
rotas.put("/contas/:numeroConta/usuario", validarSenha, atualizarUsuario);
rotas.delete("/contas/:numeroConta", validarSenha, deletarConta);
rotas.post("/contas/transacoes/depositar", validarSenha, depositarNaConta);
rotas.post("/contas/transacoes/sacar", validarSenha, saque);
rotas.post(
  "/contas/transacoes/transferir",
  validarSenha,
  transferenciaBancaria
);
rotas.get("/contas/saldo", saldoBancario);
rotas.get("/contas/extrato", extratoBancario);

module.exports = rotas;

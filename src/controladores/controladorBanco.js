const bancodedados = require("../dados/bancodedados");
let proximoNumeroCriado = 1;

//REGISTRO BANCARIO
const registrosBancarios = (numero_conta) => {
  const saques = bancodedados.saques.filter(
    (saque) => saque.numero_conta === numero_conta
  );
  const depositos = bancodedados.depositos.filter(
    (deposito) => deposito.numero_conta === numero_conta
  );
  const transferenciasEnviadas = bancodedados.transferencias.filter(
    (transferencia) => transferencia.numero_conta_origem === numero_conta
  );
  const transferenciasRecebidas = bancodedados.transferencias.filter(
    (transferencia) => transferencia.numero_conta_destino === numero_conta
  );

  return {
    saques,
    depositos,
    transferenciasEnviadas,
    transferenciasRecebidas,
  };
};

//OBTER CONTAS BANCARIAS
const obterContasBancarias = (request, response) => {
  return response.status(200).json(bancodedados.contas);
};

//CRIAR CONTAS BANCARIAS
const criarContaBancaria = (request, response) => {
  const { nome, cpf, data_nascimento, telefone, email, senha, saldo } =
    request.body;

  //FAZER A VERIFICAÇÃO DOS CAMPOS
  if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
    return response.status(400).json({
      mensagem: "Todos os campos devem ser informados, pois são obrigatorios!",
    });
  }
  //VERIFICAR SE CPF E EMAIL JÁ EXISTEM
  const cpfExistente = bancodedados.contas.find((conta) => conta.cpf === cpf);
  const emailExistente = bancodedados.contas.find(
    (conta) => conta.email === email
  );

  if (cpfExistente || emailExistente) {
    return response
      .status(404)
      .json({ mensagem: "Já existe uma conta com o CPF ou e-mail informado!" });
  }

  const novaConta = {
    numero: proximoNumeroCriado,
    nome,
    cpf,
    data_nascimento,
    telefone,
    email,
    senha,
    saldo: saldo || 0,
  };

  //Para adicionar uma nova conta usa-se o push;
  bancodedados.contas.push(novaConta);

  //Incremente para que seja sempre o proximo número(1 depois 2...);
  proximoNumeroCriado++;

  return response.status(201).send();
};

//ATUALIZAR USUARIO
const atualizarUsuario = (request, response) => {
  const { numeroConta } = request.params; //Pegando o numeroConta do usuario
  const { nome, cpf, data_nascimento, telefone, email, senha } = request.body; //Pegando os dados do usuario

  const conta = bancodedados.contas.find(
    (conta) => String(conta.numero) === numeroConta
  );

  if (!conta) {
    return response.status(404).json({ mensagem: "Conta não encontrada!" });
  }
  //Verificar os dados passados
  if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
    return response.status(400).json({
      mensagem: "Todos os campos devem ser informados, pois são obrigatorios!",
    });
  }
  const cpfExistente = bancodedados.contas.find(
    (conta) => conta.cpf === cpf && conta.numero !== numeroConta
  );
  const emailExistente = bancodedados.contas.find(
    (conta) => conta.email === email && conta.numero !== numeroConta
  );

  if (cpfExistente || emailExistente) {
    return response.status(404).json({
      mensagem: "Já existe uma conta com o CPF ou e-mail cadastrado!",
    });
  }

  conta.nome = nome;
  conta.cpf = cpf;
  conta.data_nascimento = data_nascimento;
  conta.telefone = telefone;
  conta.email = email;
  conta.senha = senha;

  return response.status(200).send();
};

//DELETAR CONTA
const deletarConta = (request, response) => {
  const { numeroConta } = request.params;
  const conta = bancodedados.contas.find(
    (conta) => String(conta.numero) === numeroConta
  );

  if (!conta) {
    return response.status(404).json({ mensagem: "Conta não encontrada!" });
  }

  if (conta.saldo !== 0) {
    return response.status(403).json({
      mensagem: "A conta só pode ser removida se o saldo for zero!",
    });
  }

  const remover = bancodedados.contas.indexOf(conta);
  bancodedados.contas.splice(remover, 1);
  return response.status(204).send();
};

//DEPOSITAR NA CONTA
const depositarNaConta = (request, response) => {
  const { numeroConta, valor } = request.body;

  if (!numeroConta || !valor) {
    return response.status(400).json({
      mensagem: "O número da conta e o valor devem ser informados!",
    });
  }

  const conta = bancodedados.contas.find(
    (conta) => String(conta.numero) === numeroConta
  );

  if (!conta) {
    return response.status(404).json({ mensagem: "Conta não encontrada!" });
  }

  if (valor <= 0) {
    return response.status(404).json({
      mensagem: "O valor para realizar o deposito deve ser maior do que zero!",
    });
  }

  conta.saldo += valor;
  const dataDaTransacao = new Date().toLocaleString().replace(",", "");

  const transacaoBancaria = {
    data: dataDaTransacao,
    numero_conta: numeroConta,
    valor: valor,
  };

  bancodedados.depositos.push(transacaoBancaria);
  return response.status(200).json(transacaoBancaria);
};

//SACAR NA CONTA
const saque = (request, response) => {
  const { numero_conta, valor, senha } = request.body;

  if (!numero_conta || !valor || !senha) {
    return response.status(400).json({
      mensagem: "O número da conta, valor e senha devem ser informados!",
    });
  }

  const conta = bancodedados.contas.find(
    (conta) => String(conta.numero) === numero_conta
  );

  if (!conta) {
    return response.status(404).json({ mensagem: "Conta não encontrada!" });
  }

  if (senha !== conta.senha) {
    return response
      .status(403)
      .json({ mensagem: "A senha informada não é valida!" });
  }

  const novoSaldo = conta.saldo - valor;

  if (novoSaldo < 0) {
    return response
      .status(403)
      .json({ mensagem: "O valor é insuficiente para realizar o saque!" });
  }

  conta.saldo = novoSaldo;
  const dataDaTransacao = new Date().toLocaleString().replace(",", "");

  const transacaoBancaria = {
    data: dataDaTransacao,
    numero_conta: numero_conta,
    valor: valor,
  };

  bancodedados.saques.push(transacaoBancaria);

  return response.status(200).json(transacaoBancaria);
};

//TRANSFERENCIA BANCARIA
const transferenciaBancaria = (request, response) => {
  const { numero_conta_origem, numero_conta_destino, valor, senha } =
    request.body;
  if (!numero_conta_origem || !numero_conta_destino || !valor || !senha) {
    return response.status(400).json({
      mensagem: "Os campos a cima devem ser informados!",
    });
  }

  const conta_origem = bancodedados.contas.find(
    (conta_origem) => String(conta_origem.numero) === numero_conta_origem
  );

  if (!conta_origem) {
    return response
      .status(404)
      .json({ mensagem: "A conta de origem não foi encontrada!" });
  }
  const conta_destino = bancodedados.contas.find(
    (conta_destino) => String(conta_destino.numero) === numero_conta_destino
  );

  if (!conta_destino) {
    return response
      .status(404)
      .json({ mensagem: "A conta de destino não foi encontrada!" });
  }

  if (senha !== conta_origem.senha) {
    return response
      .status(403)
      .json({ mensagem: "A senha informada não é valida!" });
  }

  const saldo_conta_origem = conta_origem.saldo - valor;

  if (saldo_conta_origem < 0) {
    return response
      .status(403)
      .json({ mensagem: "O valor é insuficiente para realizar o saque!" });
  }

  conta_origem.saldo = saldo_conta_origem;
  conta_destino.saldo += valor;

  const dataDaTransacao = new Date().toLocaleString().replace(",", "");

  const transacaoBancaria = {
    data: dataDaTransacao,
    numero_conta_origem: numero_conta_origem,
    numero_conta_destino: numero_conta_destino,
    valor: valor,
  };

  bancodedados.transferencias.push(transacaoBancaria);
  return response.status(200).json(transacaoBancaria);
};

//SALDO BANCARIO
const saldoBancario = (request, response, next) => {
  const { numero_conta, senha } = request.query;

  const conta = bancodedados.contas.find(
    (conta) => String(conta.numero) === numero_conta
  );

  if (!conta) {
    return response
      .status(404)
      .json({ mensagem: "A conta bancaria não foi encontrada!" });
  }
  if (senha !== conta.senha) {
    return response
      .status(403)
      .json({ mensagem: "A senha informada não é valida!" });
  }
  next();
  return response.status(200).json({ saldo: conta.saldo });
};

//EXTRATO BANCARIO
const extratoBancario = (request, response, next) => {
  const { numero_conta, senha } = request.query;
  const conta = bancodedados.contas.find(
    (conta) => String(conta.numero) === numero_conta
  );

  if (!conta) {
    return response
      .status(404)
      .json({ mensagem: "A conta bancaria não foi encontrada!" });
  }
  if (senha !== conta.senha) {
    return response
      .status(403)
      .json({ mensagem: "A senha informada não é uma senha valida!" });
  }

  const registros = registrosBancarios(numero_conta);

  next();
  return response.status(200).json(registros);
};

module.exports = {
  obterContasBancarias,
  criarContaBancaria,
  atualizarUsuario,
  deletarConta,
  depositarNaConta,
  saque,
  transferenciaBancaria,
  saldoBancario,
  extratoBancario,
};

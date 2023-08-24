const bancodedados = require('./dados/bancodedados')
const validarSenha = (request, response, next) => {
  const { senha_banco } = request.query;
 
    if (senha_banco !== "Cubos123Bank") {
    return response
      .status(403)
      .json({ mensagem: "A senha informada é inválida!" });
  };

  next();
};

module.exports = validarSenha;

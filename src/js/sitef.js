const path = require('path')
const Moment = require('moment')
const SiTef = require('node-sitef').default

/* CONFIGURAÇÕES SITEF */

/* CONFIGURAR */
//Servidor SiTef
var ip = '127.0.0.1'
//Identifica o número da loja
var loja = '00000000'
//Identifica o PDV
var terminal = '11T2303A'
//Deve ser passado com 0
var reservado = '0'
//Parâmetros adicionais de configuração da CliSiTef
var parametrosAdicionais = `[ParmsClient=1=0000000000000;2=0000000000000]`

/* INICIAR FUNCAO */
//Forma de pagamento
var funcao = 0
//VALOR
var valor = '100,00'
//Número do Cupom Fiscal
var cupomFiscal = '1'
//Data Fiscal
var dataFiscal = Moment().format('YYYYMMDD')
//Horário Fiscal
var horaFiscal = Moment().format('HHMMSS')
//OPERADOR
var operador = 'João Dematé'
//PARAMS
var parametros = ''

/* CONTINUAR FUNCAO */
//Contém no retorno:
var comando = 0

var tipoCampo = 0
var tamMinimo = 0
var tamMaximo = 0
var buffer = ''
var tamanhoBuffer = 0
/* 
  0 → Continua a transação
  1 → Retorna, quando possível, a coleta ao campo anterior
  2 → Cancela o pagamento de conta atual, mantendo os
    anteriores em memória, caso existam, permitindo que tais
    pagamentos sejam enviados para o SiTef e até mesmo
    permite incluir novos pagamentos. Retorno válido apenas nas
    coletas de valores e data de vencimento de um pagamento
    de contas.
    10000 → Continua a transação, vide observação a
    seguir
  -1 → Encerra a transação 
*/
var continua = 0

/* CONFIGURAÇÕES SITEF */

var mensagemAlerta = 'Carregando...'

function construtor() {
  document.getElementById('alerta').className = 'alert alert-info'
  document.getElementById('alerta').innerHTML = mensagemAlerta
  document.getElementById('alerta').style.display = 'none'
}

var client = null

async function loadDlls() {
  try {
    const dllPath = path.resolve(__dirname, '..', 'bin', 'CliSiTef64I.dll')
    client = new SiTef(dllPath)
  } catch (error) {
    document.getElementById('alerta').className = 'alert alert-danger'
    document.getElementById('alerta').style.display = 'block'
    document.getElementById('alerta').innerHTML = error
  }
}

function renderAlertSuccess(mensagem) {
  document.getElementById('alerta').className = 'alert alert-success'
  document.getElementById('alerta').style.display = 'block'
  document.getElementById('alerta').innerHTML = mensagem
}

async function handleConfiguraIntSiTefInterativo() {
  try {
    // Parâmetro obrigatórios
    const paramsConfig = { ip, loja, terminal, reservado, parametrosAdicionais }

    let resultado = await client.configurar(paramsConfig)
    //Tabela 2 - Códigos de retorno das funções de configuração
    switch (resultado) {
      //Não ocorreu erro
      case 0:
        let mensagem1 = `${resultado} - Não ocorreu erro na configuração da biblioteca`
        renderAlertSuccess(mensagem1)
        break
      //1 Endereço IP inválido ou não resolvido
      case 1:
        let mensagem2 = `${resultado} - Endereço IP inválido ou não resolvido`
        renderAlertSuccess(mensagem2)
        break
      //2 Código da loja inválido
      case 2:
        let mensagem3 = `${resultado} - Código da loja inválido`
        renderAlertSuccess(mensagem3)
        break
      //3 Código de terminal inválido
      case 3:
        let mensagem4 = `${resultado} - Código de terminal inválido`
        renderAlertSuccess(mensagem4)
        break
      //6 Erro na inicialização do Tcp/Ip
      case 6:
        let mensagem6 = `${resultado} - Erro na inicialização do Tcp/Ip`
        renderAlertSuccess(mensagem6)
        break
      //7 Falta de memória
      case 7:
        let mensagem7 = `${resultado} - Falta de memória`
        renderAlertSuccess(mensagem7)
        break
      //8 Não encontrou a CliSiTef ou ela está com problemas
      case 8:
        let mensagem8 = `${resultado} - Não encontrou a CliSiTef ou ela está com problemas`
        renderAlertSuccess(mensagem8)
        break
      //9 Configuração de servidores SiTef foi excedida.
      case 9:
        let mensagem9 = `${resultado} - Configuração de servidores SiTef foi excedida.`
        renderAlertSuccess(mensagem9)
        break
      //10 Erro de acesso na pasta CliSiTef (possível falta de permissão para escrita)
      case 10:
        let mensagem10 = `${resultado} - Erro de acesso na pasta CliSiTef (possível falta de permissão para escrita)`
        renderAlertSuccess(mensagem10)
        break
      //11 Dados inválidos passados pela automação.
      case 11:
        let mensagem11 = `${resultado} - Dados inválidos passados pela automação.`
        renderAlertSuccess(mensagem11)
        break
      //12 Modo seguro não ativo (possível falta de configuração no servidor SiTef do arquivo .cha).
      case 12:
        let mensagem12 = `${resultado} - Modo seguro não ativo (possível falta de configuração no servidor SiTef do arquivo .cha).`
        renderAlertSuccess(mensagem12)
        break
      //13 Caminho DLL inválido (o caminho completo das bibliotecas está muito grande).
      case 13:
        let mensagem13 = `${resultado} - Caminho DLL inválido (o caminho completo das bibliotecas está muito grande).`
        renderAlertSuccess(mensagem13)
        break
      default:
        let mensagemDefault = `${resultado} - Erro desconhecido`
        renderAlertSuccess(mensagemDefault)
        break
    }
    return true
  } catch (error) {
    //renderAlert(error.message)
    return false
  }
}

async function handleIniciaFuncaoSiTefInterativo() {
  //5.2.2 Tabela de códigos de funções
  //0 Pagamento genérico. A CliSiTef permite que o operador escolha a forma de pagamento através de menus.
  //1 Cheque
  //2 Débito
  //3 Crédito
  const paramsIniciar = {
    funcao,
    valor,
    cupomFiscal,
    dataFiscal,
    horaFiscal,
    operador,
    parametros,
  }

  let resultado = await client.iniciarFuncao(paramsIniciar)
  const paramsContinuar = {
    comando,
    tipoCampo,
    tamMinimo,
    tamMaximo,
    buffer,
    tamanhoBuffer,
    continua,
  }
  switch (resultado) {
    case 10000:
      while (resultado === 10000) {
        const continua = await client.continuarFuncao(paramsContinuar)
        if (!continua) break
        console.log('paramsContinuar', continua)
      }
      break
    case -12:
      let mensagem12 = `${resultado} - Erro na execução da rotina iterativa. Provavelmente o processo iterativo anterior não foi executado até o final (enquanto o retorno for igual a 10000).`
      renderAlert(mensagem12)
      break
    default:
      let mensagemDefault = `${resultado} - Erro desconhecido`
      renderAlert(mensagemDefault)
      break
  }
}

async function handleExemploBasico() {
  try {
    let retorno = await handleConfiguraIntSiTefInterativo()
    if (retorno === true) {
      const resultado = await client.verificarPresenca()
      if (resultado !== 1) {
        retorno = await client.escreverMensagem('000')
        let mensagemRetorno = `${retorno} - Mensagem escrita com sucesso.`
        renderAlertSuccess(mensagemRetorno)
      } else {
        console.log('erro')
      }
    } else {
      console.log('erro')
    }
  } catch (error) {
    //renderAlert(error.message)
  }
}

construtor()
loadDlls()
handleConfiguraIntSiTefInterativo()

/*************************
 *  JOGO   
 * ***********************/

const tela = document.querySelector('[flappy]')

const VELOCIDADE_MOVIMENTO_CANOS = 5 // ms (melhor 5ms)
const VELOCIDADE_CRIACAO_CANOS = 2500 // ms (melhor 2s)
const LIMITE_DA_TELA = -100 // px (melhor -100px)
const PASSO_MOVIMENTO_CANOS = 1 // px (melhor 1px)
const ESPACO_ENTRE_CANOS = 25 // % (melhor 20%)
const TAMANH0_MAXIMO_CANO = 70 // % (melhor 70%)
const MAXIMO_DE_CANOS_NA_TELA = 8 // n (melhor > 5 && < 10)
const PASSO_VOO_PASSARO = 150 // px (melhor 200px)
const PASSO_QUEDA_PASSARO = 15 // px (melhor 30px)
const VELOCIDADE_QUEDA_PASSARO = 30 // ms (melhor 50ms)
const POSICICAO_INICIAL_PASSARO_LEFT = 2000 // px
const POSICAO_INICIAL_PASSARO_TOP = 500 // px

var intervalo_mover_canos = 0
var intervalo_adicionar_canos = 0
var intervalo_cair_passaro = 0

function criarElementoPorObjeto(objeto) {
    const elemento = document.createElement(objeto.nome)
    for (let atributo in objeto.atributos) {
        elemento.setAttribute(atributo, objeto.atributos[atributo])
    }

    for (let estilo in objeto.estilos) {
        elemento.style.setProperty(estilo, objeto.estilos[estilo])
    }

    for (let classe of objeto.classes) {
        elemento.classList.add(classe)
    }

    return elemento
}

const btnPlay = document.querySelector('[play]')
btnPlay.onclick = play

const divPontuacao = document.querySelector('[pontuar]')
window.pontuacao = 0

function play() {
    removerElementos()
    esconderMenuEAbrirPontuacao()
    criarEConfigurarPassaro()
    motorMoverECriarCanos()
}

function esconderMenuEAbrirPontuacao() {
    btnPlay.style.display = 'none'
    divPontuacao.style.display = 'block'
}

function gameover() {
    pararJogo()
    mostrarPontuacaoFinal()
    zerarPontuacao()
}

function pararJogo() {
    clearInterval(intervalo_mover_canos)
    clearInterval(intervalo_adicionar_canos)
    clearInterval(intervalo_cair_passaro)
    window.onkeypress = null
}

function removerElementos() {
    if (window.passaro) passaro.remove()
    document.querySelectorAll('.canos')
        .forEach(parDeCanos => parDeCanos.remove())
}

function mostrarPontuacaoFinal() {
    btnPlay.lastElementChild.innerHTML = `Final Score: ${pontuacao}`
    btnPlay.style.display = 'block'
}

function zerarPontuacao() {
    pontuacao = 0    
    divPontuacao.innerHTML = pontuacao
}

function marcarPonto() {
    pontuacao++
    divPontuacao.innerHTML = pontuacao
}

/*************************
 *  CANOS     
 * ***********************/

const criarCano = height => criarElementoPorObjeto({
    nome: 'div',
    estilos: {
        height
    },
    classes: ['cano']
})

function definirTamanhoDosCanos() {
    const canoCimaHeight = Math.random() * TAMANH0_MAXIMO_CANO
    const canoBaixoHeight = 100 - ESPACO_ENTRE_CANOS - canoCimaHeight

    return { canoCimaHeight, canoBaixoHeight }
}

function criarParDeCanos() {
    const { canoCimaHeight, canoBaixoHeight } = definirTamanhoDosCanos()

    const canoCima = criarCano(`${canoCimaHeight}%`)
    const canoBaixo = criarCano(`${canoBaixoHeight}%`)

    return { canoCima, canoBaixo }
}

const criarEspacoParaCanos = () => criarElementoPorObjeto({
    nome: 'div',
    estilos: {
        left: `${tela.clientWidth}px`
    },
    classes: ['canos']
})

function adicionarCanosNaTela() {
    const canos = document.querySelectorAll('.canos')

    if (canos.length < MAXIMO_DE_CANOS_NA_TELA) {
        const espacoCanos = criarEspacoParaCanos()
        const { canoCima, canoBaixo } = criarParDeCanos()

        espacoCanos.appendChild(canoCima)
        espacoCanos.appendChild(canoBaixo)
        tela.appendChild(espacoCanos)
    }
}

function moverCanos() {
    const canos = document.querySelectorAll('.canos')
    canos.forEach(parDeCanos => {
        let posicaoAutal = Number.parseInt(parDeCanos.style.left)
        let novaPosicao = posicaoAutal - PASSO_MOVIMENTO_CANOS

        if (novaPosicao <= LIMITE_DA_TELA) {
            parDeCanos.remove()
        } else {
            parDeCanos.style.left = `${novaPosicao}px`
            verificarColisaoComPassaro(novaPosicao, parDeCanos)
        }

    })
}

function motorMoverECriarCanos() {
    adicionarCanosNaTela()
    intervalo_mover_canos = setInterval(moverCanos, VELOCIDADE_MOVIMENTO_CANOS)
    intervalo_adicionar_canos = setInterval(adicionarCanosNaTela, VELOCIDADE_CRIACAO_CANOS)
}

function verificarColisaoComPassaro(posicaoCanos, parDeCanos) {
    const posicaoPassaro = Number.parseInt(passaro.style.left) + passaro.clientWidth
    const alturaPassaro = Number.parseInt(passaro.style.top)
    const tamanhoCanoDeCima = parDeCanos.firstElementChild.clientHeight
    const alturaCanoDeBaixo = parDeCanos.lastElementChild.offsetTop - passaro.clientHeight

    if (posicaoCanos <= posicaoPassaro && posicaoCanos + parDeCanos.offsetWidth >= posicaoPassaro) {
        if (alturaPassaro > tamanhoCanoDeCima && alturaPassaro < alturaCanoDeBaixo) {
            if (posicaoPassaro == posicaoCanos) {
                marcarPonto()
            }
        } else {
            gameover()
        }
    }
}

/*************************
 *  PASSARO     
 * ***********************/

const criarPassaro = () => {
    if (document.querySelectorAll('.passaro').length === 0) {
        return criarElementoPorObjeto({
            nome: 'div',
            classes: ['passaro'],
            estilos: {
                top: `${POSICAO_INICIAL_PASSARO_TOP}px`,
                left: `${POSICICAO_INICIAL_PASSARO_LEFT}px`
            }
        })
    }
}


var ultima_queda = 0;

function voarPassaro() {
    clearTimeout(ultima_queda)
    passaro.classList.add('voando')
    ultima_queda = setTimeout(() => {
        passaro.classList.remove('voando')
        passaro.classList.add('caindo')
    }, 500)

    let alturaAtual = Number.parseInt(passaro.style.top)
    let novaAltura = alturaAtual - PASSO_VOO_PASSARO
    passaro.style.top = `${novaAltura}px`
}

function cairPassaro() {
    let alturaAtual = Number.parseInt(passaro.style.top)
    let novaAltura = alturaAtual + PASSO_QUEDA_PASSARO

    if (novaAltura > window.innerHeight - 20) {
        passaro.classList.remove('caindo')
    } else {
        passaro.style.top = `${novaAltura}px`
    }
}

function configurarEventListeners() {
    window.onkeypress = () => voarPassaro()

}

function comecarQuedaPassaro() {
    intervalo_cair_passaro = setInterval(cairPassaro, VELOCIDADE_QUEDA_PASSARO)
}

function criarEConfigurarPassaro() {
    window.passaro = criarPassaro()
    comecarQuedaPassaro()
    configurarEventListeners()

    tela.appendChild(passaro)
}

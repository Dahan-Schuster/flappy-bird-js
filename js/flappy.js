const tela = document.querySelector('[flappy]')

const VELOCIDADE_MOVIMENTO_CANOS = 1 // ms (melhor 1ms)
const VELOCIDADE_CRIACAO_CANOS = 2000 // ms (melhor 2s)
const LIMITE_DA_TELA = -100 // px (melhor -100px)
const PASSO_MOVIMENTO_CANOS = 1 // px (melhor 1px)
const ESPACO_ENTRE_CANOS = 20 // % (melhor 20%)
const TAMANH0_MAXIMO_CANO = 70 // % (melhor 70%)
const MAXIMO_DE_CANOS_NA_TELA = 5 // n (melhor 4~5)
const PASSO_VOO_PASSARO = 150 // px (melhor 15%)
const PASSO_QUEDA_PASSARO = 20 // px (melhor 2%)
const VELOCIDADE_QUEDA_PASSARO = 50 // ms (melhor 50ms)

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
        }

    })
}

function motorMoverECriarCanos() {
    adicionarCanosNaTela()
    setInterval(moverCanos, VELOCIDADE_MOVIMENTO_CANOS)
    setInterval(adicionarCanosNaTela, VELOCIDADE_CRIACAO_CANOS)
}

const criarPassaro = () => criarElementoPorObjeto({
    nome: 'div',
    classes: ['passaro'],
    estilos: {
        top: '500px',
        left: '100px'
    }
})

var ultima_queda = 0;

function voarPassaro(passaro) {
    clearTimeout(ultima_queda)
    passaro.classList.add('voando')
    ultima_queda = setTimeout(() => {
        passaro.classList.remove('voando')
        passaro.classList.add('caindo')
    }, 800)

    let alturaAtual = Number.parseInt(passaro.style.top)
    let novaAltura = alturaAtual - PASSO_VOO_PASSARO
    passaro.style.top = `${novaAltura}px`
}

function cairPassaro() {
    let passaro = document.querySelector('.passaro')

    let alturaAtual = Number.parseInt(passaro.style.top)
    let novaAltura = alturaAtual + PASSO_QUEDA_PASSARO

    if (novaAltura > window.innerHeight) {
        passaro.classList.remove('caindo')
    } else {
        passaro.style.top = `${novaAltura}px`
    }

}

function configurarEventListeners(passaro) {

    window.onkeypress = function() {
        voarPassaro(passaro)
    }

    setInterval(cairPassaro, VELOCIDADE_QUEDA_PASSARO)
}

function criarEConfigurarPassaro() {
    const passaro = criarPassaro()
    configurarEventListeners(passaro)

    tela.appendChild(passaro)
}

const btnPlay = document.querySelector('[play]')
btnPlay.onclick = play

function play() {
    btnPlay.style.display = 'none'
    criarEConfigurarPassaro()
    motorMoverECriarCanos()
}

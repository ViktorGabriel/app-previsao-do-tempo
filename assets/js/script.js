const apiKey = "SUA_CHAVE_AQUI";

const entradaCidade = document.getElementById("input-cidade");
const botaoBusca = document.getElementById("botao-busca");

const textoCidade = document.querySelector("#cidade");
const temperatura = document.querySelector("#temperatura");
const condicao = document.querySelector("#condicao");
const umidade = document.querySelector("#umidade");
const vento = document.querySelector("#velocidade-vento");
const imgClima = document.querySelector("#icone-clima");

const cidadePadrao = "Belo Horizonte";
buscarCidade(cidadePadrao);


botaoBusca.addEventListener("click", function() {
    const cidade = entradaCidade.value;

    console.log("Você digitou: " + cidade);
});

async function buscarCidade(cidade) {
    
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${apiKey}&lang=pt_br&units=metric`;;

    const resposta = await fetch(url) 
    const dados = await resposta.json();

    console.log(dados);

    textoCidade.innerText = dados.name;
    temperatura.innerText = parseInt(dados.main.temp);

    condicao.innerText = dados.weather[0].description;

    umidade.innerText = `${dados.main.humidity}%`;
    vento.innerText = `${dados.wind.speed} km/h`;

    imgClima.src = `https://openweathermap.org/img/wn/${dados.weather[0].icon}.png`;

}

botaoBusca.addEventListener("click", function() {
    const cidade = entradaCidade.value;
    buscarCidade(cidade); 
});

entradaCidade.addEventListener("keyup", function(e) {
    if(e.code === "Enter") {
        const cidade = e.target.value;
        buscarCidade(cidade);
    }
});


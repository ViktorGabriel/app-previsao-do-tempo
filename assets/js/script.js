const entradaCidade = document.getElementById("input-cidade");
const botaoBusca = document.getElementById("botao-busca");

botaoBusca.addEventListener("click", function() {
    const cidade = entradaCidade.value;

    console.log("Você digitou: " + cidade);
});

const apiKey = "32c62ff57dd616c07c47f0a2d191d6da";



async function buscarCidade(cidade) {
    
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${apiKey}&lang=pt_br&units=metric`;;

    const resposta = await fetch(url) 

    const dados = await resposta.json();

    console.log(dados);

}

botaoBusca.addEventListener("click", function() {
    const cidade = entradaCidade.value;
    buscarCidade(cidade); 
});

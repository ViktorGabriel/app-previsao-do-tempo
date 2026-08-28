/**
 * ============================================================================
 * CLIMA TEMPO - APLICAÇÃO DE PREVISÃO METEOROLÓGICA EM TEMPO REAL
 * ============================================================================
 * Implementado com padrões profissionais de JavaScript ES6+, tratamento robusto
 * de erros, mock fallback para testes resilientes e persistência local.
 */

// --- CONFIGURAÇÃO & ESTADO DA APLICAÇÃO ---
const CONFIG = {
    CHAVE_PADRAO: "SUA_CHAVE_AQUI", // Insira sua chave ou configure no modal
    CIDADE_INICIAL: "Belo Horizonte",
    STORAGE_KEY_API: "openweather_api_key",
    STORAGE_KEY_UNIDADE: "clima_unidade_pref",
    STORAGE_KEY_HISTORICO: "clima_historico_buscas",
    TIMEOUT_MS: 8000
};

const estado = {
    apiKey: localStorage.getItem(CONFIG.STORAGE_KEY_API) || CONFIG.CHAVE_PADRAO,
    unidade: localStorage.getItem(CONFIG.STORAGE_KEY_UNIDADE) || "metric", // 'metric' (°C) ou 'imperial' (°F)
    cidadeAtual: CONFIG.CIDADE_INICIAL,
    dadosClimaAtual: null,
    dadosPrevisao: null,
    historico: JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY_HISTORICO) || "[]")
};

// --- ELEMENTOS DO DOM ---
const el = {
    // Inputs & Botões de Busca
    inputCidade: document.getElementById("input-cidade"),
    botaoBusca: document.getElementById("botao-busca"),
    btnLimparBusca: document.getElementById("btn-limpar-busca"),
    caixaBusca: document.getElementById("caixa-busca"),
    
    // Controles do Cabeçalho
    btnUnidade: document.getElementById("btn-unidade"),
    unidadeTexto: document.getElementById("unidade-texto"),
    unidadeSimbolo: document.getElementById("unidade-simbolo"),
    btnGeolocalizacao: document.getElementById("btn-geolocalizacao"),
    btnConfigApi: document.getElementById("btn-config-api"),
    
    // Estados de UI (Loading e Erro)
    loadingSpinner: document.getElementById("loading-spinner"),
    alertaErro: document.getElementById("alerta-erro"),
    erroTitulo: document.getElementById("erro-titulo"),
    erroMensagem: document.getElementById("erro-mensagem"),
    btnFecharAlerta: document.getElementById("btn-fechar-alerta"),
    
    // Container Principal do Clima
    caixaClima: document.getElementById("caixa-clima"),
    fundoGradiente: document.getElementById("fundo-gradiente"),
    historicoContainer: document.getElementById("historico-container"),
    historicoTags: document.getElementById("historico-tags"),
    
    // Dados Meteorológicos
    textoCidade: document.getElementById("cidade"),
    dataHora: document.getElementById("data-hora"),
    temperatura: document.getElementById("temperatura"),
    tempMin: document.getElementById("temp-min"),
    tempMax: document.getElementById("temp-max"),
    condicao: document.getElementById("condicao"),
    imgClima: document.getElementById("icone-clima"),
    sensacaoTermica: document.getElementById("sensacao-termica"),
    umidade: document.getElementById("umidade"),
    vento: document.getElementById("velocidade-vento"),
    pressao: document.getElementById("pressao"),
    previsaoCards: document.getElementById("previsao-cards"),
    
    // Modal de API Key
    modalOverlay: document.getElementById("modal-api-overlay"),
    inputApiKey: document.getElementById("input-api-key"),
    btnFecharModal: document.getElementById("btn-fechar-modal"),
    btnSalvarApiKey: document.getElementById("btn-salvar-api-key"),
    btnUsarMock: document.getElementById("btn-usar-mock")
};

// --- BASE DE DADOS MOCK INTELIGENTE (Fallback para testes locais) ---
const MOCK_CIDADES = {
    "belo horizonte": {
        name: "Belo Horizonte",
        sys: { country: "BR" },
        main: { temp: 26, feels_like: 27, temp_min: 19, temp_max: 29, humidity: 62, pressure: 1016 },
        weather: [{ id: 801, main: "Clouds", description: "poucas nuvens", icon: "02d" }],
        wind: { speed: 3.6 }
    },
    "sao paulo": {
        name: "São Paulo",
        sys: { country: "BR" },
        main: { temp: 22, feels_like: 22, temp_min: 17, temp_max: 25, humidity: 75, pressure: 1020 },
        weather: [{ id: 802, main: "Clouds", description: "nuvens dispersas", icon: "03d" }],
        wind: { speed: 4.1 }
    },
    "rio de janeiro": {
        name: "Rio de Janeiro",
        sys: { country: "BR" },
        main: { temp: 31, feels_like: 35, temp_min: 24, temp_max: 33, humidity: 70, pressure: 1012 },
        weather: [{ id: 800, main: "Clear", description: "céu limpo", icon: "01d" }],
        wind: { speed: 5.2 }
    },
    "curitiba": {
        name: "Curitiba",
        sys: { country: "BR" },
        main: { temp: 18, feels_like: 17, temp_min: 13, temp_max: 21, humidity: 82, pressure: 1022 },
        weather: [{ id: 500, main: "Rain", description: "chuva leve", icon: "10d" }],
        wind: { speed: 2.8 }
    },
    "salvador": {
        name: "Salvador",
        sys: { country: "BR" },
        main: { temp: 29, feels_like: 32, temp_min: 25, temp_max: 30, humidity: 78, pressure: 1014 },
        weather: [{ id: 800, main: "Clear", description: "ensolarado", icon: "01d" }],
        wind: { speed: 6.0 }
    },
    "londres": {
        name: "Londres",
        sys: { country: "GB" },
        main: { temp: 15, feels_like: 14, temp_min: 11, temp_max: 18, humidity: 80, pressure: 1018 },
        weather: [{ id: 501, main: "Rain", description: "chuva moderada", icon: "10d" }],
        wind: { speed: 4.5 }
    },
    "nova york": {
        name: "Nova York",
        sys: { country: "US" },
        main: { temp: 20, feels_like: 19, temp_min: 15, temp_max: 23, humidity: 55, pressure: 1015 },
        weather: [{ id: 800, main: "Clear", description: "céu ensolarado", icon: "01d" }],
        wind: { speed: 3.8 }
    },
    "toquio": {
        name: "Tóquio",
        sys: { country: "JP" },
        main: { temp: 24, feels_like: 25, temp_min: 20, temp_max: 27, humidity: 68, pressure: 1010 },
        weather: [{ id: 803, main: "Clouds", description: "parcialmente nublado", icon: "04d" }],
        wind: { speed: 2.5 }
    }
};

// --- INICIALIZAÇÃO DA APLICAÇÃO ---
document.addEventListener("DOMContentLoaded", () => {
    configurarEventos();
    atualizarHistoricoTags();
    atualizarRotuloUnidade();
    buscarPrevisao(estado.cidadeAtual);
});

// --- CONFIGURAÇÃO DE EVENTOS ---
function configurarEventos() {
    // 1. Busca por clique no botão
    el.botaoBusca.addEventListener("click", () => processarBuscaInput());

    // 2. Busca por tecla Enter
    el.inputCidade.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            processarBuscaInput();
        }
    });

    // 3. Controle de visibilidade do botão limpar
    el.inputCidade.addEventListener("input", () => {
        if (el.inputCidade.value.trim().length > 0) {
            el.btnLimparBusca.classList.remove("escondido");
        } else {
            el.btnLimparBusca.classList.add("escondido");
        }
    });

    // 4. Limpar input
    el.btnLimparBusca.addEventListener("click", () => {
        el.inputCidade.value = "";
        el.btnLimparBusca.classList.add("escondido");
        el.inputCidade.focus();
    });

    // 5. Alternar Unidade (°C / °F)
    el.btnUnidade.addEventListener("click", alternarUnidadeTemperatura);

    // 6. Geolocalização
    el.btnGeolocalizacao.addEventListener("click", obterClimaPorGeolocalizacao);

    // 7. Modal de API Key
    el.btnConfigApi.addEventListener("click", abrirModalApiKey);
    el.btnFecharModal.addEventListener("click", fecharModalApiKey);
    el.btnSalvarApiKey.addEventListener("click", salvarApiKey);
    el.btnUsarMock.addEventListener("click", usarModoDemo);
    
    // Fechar modal ao clicar fora
    el.modalOverlay.addEventListener("click", (e) => {
        if (e.target === el.modalOverlay) fecharModalApiKey();
    });

    // 8. Fechar Alerta de Erro
    el.btnFecharAlerta.addEventListener("click", esconderErro);
}

// --- FLUXO DE BUSCA ---
function processarBuscaInput() {
    const termo = el.inputCidade.value.trim();
    if (!termo) {
        animarShakeBusca();
        mostrarErro("Campo Vazio", "Por favor, digite o nome de uma cidade.");
        return;
    }
    buscarPrevisao(termo);
}

function animarShakeBusca() {
    el.caixaBusca.classList.add("shake");
    setTimeout(() => el.caixaBusca.classList.remove("shake"), 450);
}

// --- REQUISIÇÕES ASSÍNCRONAS COM FETCH RESILIENTE ---
async function buscarPrevisao(cidade) {
    esconderErro();
    mostrarLoading();

    try {
        let dadosClima;
        let dadosForecast;

        const chaveValida = estado.apiKey && estado.apiKey !== "SUA_CHAVE_AQUI" && estado.apiKey.trim() !== "";

        if (chaveValida) {
            // Chamada à API Real com AbortController para timeout
            dadosClima = await fetchComTimeout(
                `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cidade)}&appid=${estado.apiKey}&lang=pt_br&units=${estado.unidade}`
            );
            
            try {
                dadosForecast = await fetchComTimeout(
                    `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cidade)}&appid=${estado.apiKey}&lang=pt_br&units=${estado.unidade}`
                );
            } catch (forecastErr) {
                console.warn("Previsão estendida não disponível via API, gerando previsão simulada:", forecastErr);
                dadosForecast = gerarForecastMock(dadosClima);
            }
        } else {
            // Modo Demonstração Inteligente / Mock
            await new Promise(resolve => setTimeout(resolve, 400)); // Pequena latência realista
            dadosClima = obterDadosMock(cidade);
            dadosForecast = gerarForecastMock(dadosClima);
        }

        estado.cidadeAtual = dadosClima.name;
        estado.dadosClimaAtual = dadosClima;
        estado.dadosPrevisao = dadosForecast;

        adicionarAoHistorico(dadosClima.name);
        renderizarClima(dadosClima);
        renderizarPrevisaoEstendida(dadosForecast);
        atualizarFundoPorClima(dadosClima.weather[0]);

    } catch (erro) {
        console.error("Erro na busca de clima:", erro);
        tratarErroRequisicao(erro, cidade);
    } finally {
        esconderLoading();
    }
}

// --- BUSCA POR GEOLOCALIZAÇÃO ---
function obterClimaPorGeolocalizacao() {
    if (!navigator.geolocation) {
        mostrarErro("Geolocalização não suportada", "Seu navegador não possui suporte à localização.");
        return;
    }

    esconderErro();
    mostrarLoading();

    navigator.geolocation.getCurrentPosition(
        async (posicao) => {
            const { latitude, longitude } = posicao.coords;
            try {
                const chaveValida = estado.apiKey && estado.apiKey !== "SUA_CHAVE_AQUI" && estado.apiKey.trim() !== "";
                let dadosClima;
                let dadosForecast;

                if (chaveValida) {
                    dadosClima = await fetchComTimeout(
                        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${estado.apiKey}&lang=pt_br&units=${estado.unidade}`
                    );
                    try {
                        dadosForecast = await fetchComTimeout(
                            `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${estado.apiKey}&lang=pt_br&units=${estado.unidade}`
                        );
                    } catch {
                        dadosForecast = gerarForecastMock(dadosClima);
                    }
                } else {
                    // Simulação para geolocalização em modo demo
                    dadosClima = obterDadosMock("Belo Horizonte");
                    dadosForecast = gerarForecastMock(dadosClima);
                }

                estado.cidadeAtual = dadosClima.name;
                estado.dadosClimaAtual = dadosClima;
                estado.dadosPrevisao = dadosForecast;

                adicionarAoHistorico(dadosClima.name);
                renderizarClima(dadosClima);
                renderizarPrevisaoEstendida(dadosForecast);
                atualizarFundoPorClima(dadosClima.weather[0]);
            } catch (erro) {
                tratarErroRequisicao(erro, "sua localização");
            } finally {
                esconderLoading();
            }
        },
        (erroGeo) => {
            esconderLoading();
            let msg = "Não foi possível obter sua localização.";
            if (erroGeo.code === 1) msg = "Permissão de localização negada pelo usuário.";
            else if (erroGeo.code === 2) msg = "Posição indisponível no momento.";
            mostrarErro("Erro de Localização", msg);
        },
        { timeout: 10000 }
    );
}

// --- FETCH COM TIMEOUT SEGURO ---
async function fetchComTimeout(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CONFIG.TIMEOUT_MS);

    try {
        const resposta = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);

        if (!resposta.ok) {
            const erroApi = new Error(`HTTP ${resposta.status}`);
            erroApi.status = resposta.status;
            throw erroApi;
        }

        return await resposta.json();
    } catch (err) {
        clearTimeout(timer);
        throw err;
    }
}

// --- TRATAMENTO DE ERROS AMIGÁVEL ---
function tratarErroRequisicao(erro, cidade) {
    if (!navigator.onLine) {
        mostrarErro("Sem Conexão", "Você está offline. Verifique sua conexão com a internet.");
        return;
    }

    if (erro.name === "AbortError") {
        mostrarErro("Tempo Esgotado", "O servidor demorou muito para responder. Tente novamente.");
        return;
    }

    if (erro.status === 404) {
        mostrarErro("Cidade Não Encontrada", `Não encontramos resultados para "${cidade}". Verifique a ortografia.`);
        animarShakeBusca();
        return;
    }

    if (erro.status === 401) {
        mostrarErro(
            "Chave de API Inválida",
            "A chave OpenWeatherMap configurada não é válida. Clique no ícone de engrenagem para configurar sua chave ou usar o Modo Demo."
        );
        return;
    }

    if (erro.status === 429) {
        mostrarErro("Limite Excedido", "Muitas consultas em pouco tempo. Aguarde alguns instantes.");
        return;
    }

    mostrarErro("Erro ao Consultar Clima", "Ocorreu um erro ao carregar os dados. Tente novamente mais tarde.");
}

// --- RENDERIZAÇÃO DO DOM ---
function renderizarClima(dados) {
    el.textoCidade.textContent = `${dados.name}, ${dados.sys.country || ""}`;
    
    // Temperatura e Símbolo
    const tempFormatada = Math.round(dados.main.temp);
    el.temperatura.textContent = tempFormatada;
    el.unidadeSimbolo.textContent = estado.unidade === "metric" ? "°C" : "°F";
    
    // Mínima e Máxima
    el.tempMin.textContent = `${Math.round(dados.main.temp_min || tempFormatada - 3)}°`;
    el.tempMax.textContent = `${Math.round(dados.main.temp_max || tempFormatada + 4)}°`;
    
    // Descrição e Ícone
    const climaInfo = dados.weather[0];
    el.condicao.textContent = climaInfo.description;
    el.imgClima.src = `https://openweathermap.org/img/wn/${climaInfo.icon}@2x.png`;
    el.imgClima.alt = climaInfo.description;
    
    // Grid de Detalhes
    el.sensacaoTermica.textContent = `${Math.round(dados.main.feels_like)}°`;
    el.umidade.textContent = `${dados.main.humidity}%`;
    
    const unidadeVento = estado.unidade === "metric" ? "km/h" : "mph";
    const velVento = estado.unidade === "metric" ? Math.round(dados.wind.speed * 3.6) : Math.round(dados.wind.speed);
    el.vento.textContent = `${velVento} ${unidadeVento}`;
    
    el.pressao.textContent = `${dados.main.pressure || 1013} hPa`;
    
    // Data e Hora Atual
    el.dataHora.textContent = formatarDataHora();
    
    // Animação de entrada suave
    el.caixaClima.style.opacity = "0";
    el.caixaClima.style.transform = "translateY(8px)";
    setTimeout(() => {
        el.caixaClima.style.opacity = "1";
        el.caixaClima.style.transform = "translateY(0)";
    }, 50);
}

// --- RENDERIZAÇÃO DA PREVISÃO ESTENDIDA ---
function renderizarPrevisaoEstendida(forecast) {
    el.previsaoCards.innerHTML = "";
    if (!forecast || !forecast.list) return;

    // Filtra para pegar 1 previsão a cada 24 horas (aprox)
    const previsoesFiltradas = forecast.list.slice(0, 5);

    previsoesFiltradas.forEach(item => {
        const card = document.createElement("div");
        card.className = "card-previsao";

        const data = new Date(item.dt * 1000);
        const diaSemana = data.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
        const hora = `${String(data.getHours()).padStart(2, "0")}:00`;

        const iconCode = item.weather[0].icon;
        const temp = Math.round(item.main.temp);

        card.innerHTML = `
            <span class="dia">${diaSemana}, ${hora}</span>
            <img src="https://openweathermap.org/img/wn/${iconCode}.png" alt="${item.weather[0].description}">
            <span class="temp">${temp}°</span>
        `;
        el.previsaoCards.appendChild(card);
    });
}

// --- ATUALIZAÇÃO DO TEMA DINÂMICO DE FUNDO ---
function atualizarFundoPorClima(clima) {
    document.body.className = ""; // Limpa classes anteriores

    const id = clima.id;
    const isNoite = clima.icon.includes("n");

    if (isNoite) {
        document.body.classList.add("clima-noite");
    } else if (id >= 200 && id < 300) {
        document.body.classList.add("clima-tempestade");
    } else if (id >= 300 && id < 600) {
        document.body.classList.add("clima-chuva");
    } else if (id >= 600 && id < 700) {
        document.body.classList.add("clima-neve");
    } else if (id === 800) {
        document.body.classList.add("clima-limpo");
    } else if (id > 800) {
        document.body.classList.add("clima-nuvens");
    }
}

// --- HISTÓRICO DE BUSCAS RECENTES ---
function adicionarAoHistorico(cidade) {
    if (!cidade) return;
    
    // Evita duplicatas case-insensitive
    estado.historico = estado.historico.filter(c => c.toLowerCase() !== cidade.toLowerCase());
    estado.historico.unshift(cidade);
    
    // Mantém no máximo 4 itens
    if (estado.historico.length > 4) estado.historico.pop();
    
    localStorage.setItem(CONFIG.STORAGE_KEY_HISTORICO, JSON.stringify(estado.historico));
    atualizarHistoricoTags();
}

function atualizarHistoricoTags() {
    el.historicoTags.innerHTML = "";
    
    if (estado.historico.length === 0) {
        el.historicoContainer.classList.add("escondido");
        return;
    }
    
    el.historicoContainer.classList.remove("escondido");
    
    estado.historico.forEach(cidade => {
        const tag = document.createElement("button");
        tag.className = "tag-cidade";
        tag.innerHTML = `<i class="fa-solid fa-clock-rotate-left"></i> ${cidade}`;
        tag.addEventListener("click", () => {
            el.inputCidade.value = cidade;
            buscarPrevisao(cidade);
        });
        el.historicoTags.appendChild(tag);
    });
}

// --- ALTERNADOR DE UNIDADE DE TEMPERATURA (°C / °F) ---
function alternarUnidadeTemperatura() {
    estado.unidade = estado.unidade === "metric" ? "imperial" : "metric";
    localStorage.setItem(CONFIG.STORAGE_KEY_UNIDADE, estado.unidade);
    atualizarRotuloUnidade();
    
    // Se já temos os dados da cidade atual, refaz a busca na nova unidade
    if (estado.cidadeAtual) {
        buscarPrevisao(estado.cidadeAtual);
    }
}

function atualizarRotuloUnidade() {
    el.unidadeTexto.textContent = estado.unidade === "metric" ? "°C" : "°F";
}

// --- UTILITÁRIOS & HELPERS ---
function formatarDataHora() {
    const agora = new Date();
    return agora.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function mostrarLoading() {
    el.loadingSpinner.classList.remove("escondido");
    el.caixaClima.classList.add("escondido");
}

function esconderLoading() {
    el.loadingSpinner.classList.add("escondido");
    el.caixaClima.classList.remove("escondido");
}

function mostrarErro(titulo, mensagem) {
    el.erroTitulo.textContent = titulo;
    el.erroMensagem.textContent = mensagem;
    el.alertaErro.classList.remove("escondido");
}

function esconderErro() {
    el.alertaErro.classList.add("escondido");
}

// --- MODAL DE CONFIGURAÇÃO DE API KEY ---
function abrirModalApiKey() {
    const chaveAtual = localStorage.getItem(CONFIG.STORAGE_KEY_API) || "";
    el.inputApiKey.value = chaveAtual;
    el.modalOverlay.classList.remove("escondido");
    el.inputApiKey.focus();
}

function fecharModalApiKey() {
    el.modalOverlay.classList.add("escondido");
}

function salvarApiKey() {
    const novaChave = el.inputApiKey.value.trim();
    if (novaChave) {
        estado.apiKey = novaChave;
        localStorage.setItem(CONFIG.STORAGE_KEY_API, novaChave);
    } else {
        localStorage.removeItem(CONFIG.STORAGE_KEY_API);
        estado.apiKey = CONFIG.CHAVE_PADRAO;
    }
    fecharModalApiKey();
    buscarPrevisao(estado.cidadeAtual);
}

function usarModoDemo() {
    localStorage.removeItem(CONFIG.STORAGE_KEY_API);
    estado.apiKey = CONFIG.CHAVE_PADRAO;
    fecharModalApiKey();
    buscarPrevisao(estado.cidadeAtual);
}

// --- GERADORES DE DADOS MOCK (Para funcionamento offline/demo) ---
function normalizarTexto(txt) {
    return txt.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function obterDadosMock(cidade) {
    const cidadeNorm = normalizarTexto(cidade);
    
    // Se existir na base mock exata
    if (MOCK_CIDADES[cidadeNorm]) {
        return estruturarMock(MOCK_CIDADES[cidadeNorm]);
    }
    
    // Busca parcial
    for (const chave in MOCK_CIDADES) {
        if (cidadeNorm.includes(chave) || chave.includes(cidadeNorm)) {
            return estruturarMock(MOCK_CIDADES[chave]);
        }
    }
    
    // Gera mock procedural realista para qualquer cidade digitada
    const tempBase = 18 + Math.floor(Math.random() * 14);
    const condicoes = [
        { id: 800, main: "Clear", description: "céu limpo", icon: "01d" },
        { id: 802, main: "Clouds", description: "parcialmente nublado", icon: "03d" },
        { id: 500, main: "Rain", description: "chuva passageira", icon: "10d" },
        { id: 804, main: "Clouds", description: "nublado", icon: "04d" }
    ];
    const condEscolhida = condicoes[Math.floor(Math.random() * condicoes.length)];
    
    return estruturarMock({
        name: cidade.charAt(0).toUpperCase() + cidade.slice(1),
        sys: { country: "BR" },
        main: {
            temp: tempBase,
            feels_like: tempBase + (Math.random() > 0.5 ? 2 : -1),
            temp_min: tempBase - 4,
            temp_max: tempBase + 5,
            humidity: 50 + Math.floor(Math.random() * 40),
            pressure: 1012 + Math.floor(Math.random() * 10)
        },
        weather: [condEscolhida],
        wind: { speed: (2 + Math.random() * 5).toFixed(1) }
    });
}

function estruturarMock(base) {
    // Clona e ajusta conversão de unidade se necessário
    const clone = JSON.parse(JSON.stringify(base));
    if (estado.unidade === "imperial") {
        clone.main.temp = Math.round((clone.main.temp * 9/5) + 32);
        clone.main.feels_like = Math.round((clone.main.feels_like * 9/5) + 32);
        clone.main.temp_min = Math.round((clone.main.temp_min * 9/5) + 32);
        clone.main.temp_max = Math.round((clone.main.temp_max * 9/5) + 32);
    }
    return clone;
}

function gerarForecastMock(dadosClima) {
    const lista = [];
    const agora = Math.floor(Date.now() / 1000);
    const tempBase = dadosClima.main.temp;

    for (let i = 1; i <= 5; i++) {
        lista.push({
            dt: agora + (i * 86400), // +24h por card
            main: {
                temp: tempBase + (i % 2 === 0 ? 2 : -2)
            },
            weather: [dadosClima.weather[0]]
        });
    }

    return { list: lista };
}

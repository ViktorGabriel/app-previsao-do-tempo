/**
 * Testes de validação automatizada para o App de Previsão do Tempo
 */

const fs = require('fs');
const path = require('path');

function runTests() {
    console.log('🧪 Iniciando testes de validação...');
    let passed = 0;
    let failed = 0;

    function assert(condition, message) {
        if (condition) {
            console.log(`  ✅ PASS: ${message}`);
            passed++;
        } else {
            console.error(`  ❌ FAIL: ${message}`);
            failed++;
        }
    }

    // 1. Validação de arquivos essenciais
    const files = [
        'index.html',
        'assets/css/style.css',
        'assets/js/script.js',
        'README.md'
    ];

    files.forEach(file => {
        const fullPath = path.join(__dirname, '..', file);
        assert(fs.existsSync(fullPath), `Arquivo ${file} deve existir`);
    });

    // 2. Validação do index.html
    const htmlContent = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf-8');
    assert(htmlContent.includes('fonts.googleapis.com/css2?family=Poppins'), 'index.html deve importar fonte Poppins');
    assert(htmlContent.includes('id="input-cidade"'), 'index.html deve conter input de cidade');
    assert(htmlContent.includes('id="btn-geolocalizacao"'), 'index.html deve conter botão de geolocalização');
    assert(htmlContent.includes('id="btn-unidade"'), 'index.html deve conter alternador de unidade');
    assert(htmlContent.includes('id="loading-spinner"'), 'index.html deve conter spinner de loading');
    assert(htmlContent.includes('id="alerta-erro"'), 'index.html deve conter componente de alerta de erro');

    // 3. Validação do script.js
    const jsContent = fs.readFileSync(path.join(__dirname, '..', 'assets/js/script.js'), 'utf-8');
    assert(!jsContent.includes('units=metric;;'), 'script.js não deve ter duplo ponto e vírgula na URL');
    assert(jsContent.includes('AbortController'), 'script.js deve usar AbortController para timeout seguro');
    assert(jsContent.includes('localStorage'), 'script.js deve utilizar localStorage para persistência');
    assert(jsContent.includes('obterDadosMock'), 'script.js deve conter fallback mock resiliente');
    assert(jsContent.includes('navigator.geolocation'), 'script.js deve suportar geolocalização');

    // 4. Validação do style.css
    const cssContent = fs.readFileSync(path.join(__dirname, '..', 'assets/css/style.css'), 'utf-8');
    assert(cssContent.includes('backdrop-filter: blur'), 'style.css deve conter estilos de Glassmorphism');
    assert(cssContent.includes('.clima-chuva'), 'style.css deve conter tema de fundo para chuva');
    assert(cssContent.includes('.clima-limpo'), 'style.css deve conter tema de fundo para céu limpo');

    console.log(`\n📊 Resultado: ${passed} passaram, ${failed} falharam.`);
    if (failed > 0) {
        process.exit(1);
    }
}

runTests();

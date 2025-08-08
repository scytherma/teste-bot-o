// Configurações da Shopee (atualizadas com base na pesquisa)
const SHOPEE_CONFIG = {
    // Taxa de comissão padrão (para vendedores que não participam do Programa de Frete Grátis)
    taxaComissaoPadrao: 0.14, // 14% (referência: 14% para vendedores padrão)
    
    // Taxa de comissão para participantes do Programa de Frete Grátis
    taxaComissaoFreteGratis: 0.20, // 20% (referência: 14% + 6% do programa de frete grátis)
    
    // Taxa de transação (taxa de serviço)
    taxaTransacao: 0.015, // 1.5% (referência: 1.5% de taxa de transação)
    
    // Taxa fixa por item vendido
    taxaFixaPorItem: 4.00, // R$4,00 por item vendido
};

// Elementos do DOM
const elements = {
    freteGratis: document.getElementById("freteGratis"),
    custoProduto: document.getElementById("custoProduto"),
    impostos: document.getElementById("impostos"),
    despesasVariaveis: document.getElementById("despesasVariaveis"),
    custoExtra: document.getElementById("custoExtra"),
    margemLucro: document.getElementById("margemLucro"),
    
    // Resultados
    precoVenda: document.getElementById("precoVenda"),
    lucroPorVenda: document.getElementById("lucroPorVenda"),
    taxaShopee: document.getElementById("taxaShopee"),
    valorImpostos: document.getElementById("valorImpostos"),
    custoTotal: document.getElementById("custoTotal"),
    retornoProduto: document.getElementById("retornoProduto"),
    markupPercent: document.getElementById("markupPercent"),
    markupX: document.getElementById("markupX"),
    margemValue: document.getElementById("margemValue")
};

// Multiplicador do custo do produto
let multiplicadorCusto = 1;

// Função para formatar valores em Real
function formatarReal(valor) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    }).format(valor);
}

// Função para formatar percentual
function formatarPercentual(valor) {
    return `${valor.toFixed(2)}%`; // Ajustado para 2 casas decimais
}

// Função para calcular o preço de venda baseado na margem desejada
function calcularPrecoVenda() {
    const custoProdutoValue = elements.custoProduto.value || "0";
    const custoProdutoBase = parseFloat(custoProdutoValue.replace(",", ".")) || 0;
    const custoProduto = custoProdutoBase * multiplicadorCusto;
    
    const impostosValue = elements.impostos.value || "0";
    const impostosPercent = parseFloat(impostosValue.replace(",", ".")) || 0;
    
    const despesasValue = elements.despesasVariaveis.value || "0";
    const despesasVariaveis = parseFloat(despesasValue.replace(",", ".")) || 0;
    
    const custoExtraValue = elements.custoExtra.value || "0";
    const custoExtra = parseFloat(custoExtraValue.replace(",", ".")) || 0;
    
    const margemDesejada = parseFloat(elements.margemLucro.value) || 0;
    const temFreteGratis = elements.freteGratis.checked;
    
    // Calcular custo total do produto
    const valorImpostos = custoProduto * (impostosPercent / 100);
    const custoTotalProduto = custoProduto + valorImpostos + despesasVariaveis + custoExtra;
    
    // Determinar taxa de comissão da Shopee
    const taxaComissaoAplicada = temFreteGratis ? SHOPEE_CONFIG.taxaComissaoFreteGratis : SHOPEE_CONFIG.taxaComissaoPadrao;
    
    // A fórmula para o preço de venda deve considerar todas as taxas sobre o preço de venda final
    // Preço de Venda = (Custo Total do Produto + Taxa Fixa por Item) / (1 - Taxa Comissão Aplicada - Taxa Transação - Margem Desejada/100)
    
    // Ajuste na fórmula para isolar o Preço de Venda
    // PV = (CTP + TF) / (1 - TC - TT - MD)
    // Onde:
    // PV = Preço de Venda
    // CTP = Custo Total do Produto
    // TF = Taxa Fixa por Item
    // TC = Taxa Comissão Aplicada
    // TT = Taxa Transação
    // MD = Margem Desejada (em decimal)

    const denominador = (1 - taxaComissaoAplicada - SHOPEE_CONFIG.taxaTransacao - (margemDesejada / 100));
    let precoVenda = 0;
    if (denominador > 0) {
        precoVenda = (custoTotalProduto + SHOPEE_CONFIG.taxaFixaPorItem) / denominador;
    } else {
        // Evitar divisão por zero ou resultados negativos irreais
        precoVenda = 0; 
    }

    // Calcular valores derivados
    const taxaShopeeComissao = precoVenda * taxaComissaoAplicada;
    const taxaShopeeTransacao = precoVenda * SHOPEE_CONFIG.taxaTransacao;
    const taxaShopeeValorTotal = taxaShopeeComissao + taxaShopeeTransacao + SHOPEE_CONFIG.taxaFixaPorItem;
    
    const lucroLiquido = precoVenda - custoTotalProduto - taxaShopeeValorTotal;
    
    const retornoProduto = custoTotalProduto > 0 ? (lucroLiquido / custoTotalProduto) * 100 : 0;
    const markupPercent = custoTotalProduto > 0 ? ((precoVenda - custoTotalProduto) / custoTotalProduto) * 100 : 0;
    const markupX = custoTotalProduto > 0 ? precoVenda / custoTotalProduto : 0;
    
    // Atualizar interface
    atualizarResultados({
        precoVenda,
        lucroLiquido,
        taxaShopeeValor: taxaShopeeValorTotal,
        valorImpostos,
        custoTotalProduto,
        retornoProduto,
        markupPercent,
        markupX
    });
}

// Função para atualizar os resultados na interface
function atualizarResultados(resultados) {
    elements.precoVenda.textContent = formatarReal(resultados.precoVenda);
    elements.lucroPorVenda.textContent = formatarReal(resultados.lucroLiquido);
    elements.taxaShopee.textContent = formatarReal(resultados.taxaShopeeValor);
    elements.valorImpostos.textContent = formatarReal(resultados.valorImpostos);
    elements.custoTotal.textContent = formatarReal(resultados.custoTotalProduto);
    elements.retornoProduto.textContent = formatarPercentual(resultados.retornoProduto);
    elements.markupPercent.textContent = formatarPercentual(resultados.markupPercent);
    elements.markupX.textContent = `${resultados.markupX.toFixed(2)}X`; // Ajustado para 2 casas decimais
    
    // Atualizar cor do lucro baseado no valor
    if (resultados.lucroLiquido > 0) {
        elements.lucroPorVenda.style.color = "#4CAF50";
    } else if (resultados.lucroLiquido < 0) {
        elements.lucroPorVenda.style.color = "#f44336";
    } else {
        elements.lucroPorVenda.style.color = "#ff6b35";
    }
}

// Função para atualizar o valor da margem
function atualizarMargemValue() {
    const valor = elements.margemLucro.value;
    elements.margemValue.textContent = `${valor}%`;
}

// Função para alterar multiplicador
function alterarMultiplicador(incremento) {
    multiplicadorCusto = Math.max(1, multiplicadorCusto + incremento);
    document.querySelector(".multiplier").textContent = `${multiplicadorCusto}x`;
    calcularPrecoVenda();
}

// Função para validar entrada numérica
function validarEntradaNumerica(input) {
    // Remove tudo que não for número, vírgula ou ponto
    let value = input.value.replace(/[^0-9.,]/g, "");
    
    // Se tem vírgula, substitui por ponto para cálculo
    if (value.includes(',')) {
        // Remove pontos extras se houver vírgula
        value = value.replace(/\./g, '');
        // Garante apenas uma vírgula
        const parts = value.split(',');
        if (parts.length > 2) {
            value = parts[0] + ',' + parts.slice(1).join('');
        }
    } else if (value.includes('.')) {
        // Se só tem ponto, garante apenas um
        const parts = value.split('.');
        if (parts.length > 2) {
            value = parts[0] + '.' + parts.slice(1).join('');
        }
    }
    
    input.value = value;
}

// Função para formatar campo ao sair (blur)
function formatarCampo(input) {
    let valorString = input.value.replace(",", "."); // Converte para ponto para parseFloat
    const valor = parseFloat(valorString);
    
    if (!isNaN(valor) && valor >= 0) {
        input.value = valor.toFixed(2).replace(".", ","); // Formata para 2 casas e volta para vírgula
    } else {
        input.value = "0,00"; // Define como 0,00 se não for um número válido ou estiver vazio
    }
}

// Event Listeners
document.addEventListener("DOMContentLoaded", function() {
    // Slider de margem
    if (elements.margemLucro) {
        elements.margemLucro.addEventListener("input", function() {
            atualizarMargemValue();
            calcularPrecoVenda();
        });
    }
    
    // Botões do multiplicador
    const arrowUp = document.querySelector(".arrow-up");
    const arrowDown = document.querySelector(".arrow-down");
    
    if (arrowUp) {
        arrowUp.addEventListener("click", () => alterarMultiplicador(1));
    }
    
    if (arrowDown) {
        arrowDown.addEventListener("click", () => alterarMultiplicador(-1));
    }
    
    // Validação de inputs numéricos
    [elements.custoProduto, elements.despesasVariaveis, elements.custoExtra].forEach(element => {
        if (element) {
            element.addEventListener("input", function() {
                validarEntradaNumerica(this);
                calcularPrecoVenda();
            });
            
            element.addEventListener("blur", function() {
                formatarCampo(this);
                calcularPrecoVenda();
            });
        }
    });
    
    // Validação especial para impostos (0-100%)
    if (elements.impostos) {
        elements.impostos.addEventListener("input", function() {
            validarEntradaNumerica(this);
            calcularPrecoVenda();
        });

        elements.impostos.addEventListener("blur", function() {
            let valorString = this.value.replace(",", ".");
            let valor = parseFloat(valorString);
            
            if (isNaN(valor) || valor < 0) {
                this.value = "0,00";
            } else if (valor > 100) {
                this.value = "100,00";
            } else {
                this.value = valor.toFixed(2).replace(".", ",");
            }
            calcularPrecoVenda();
        });
    }

    // Toggle frete grátis
    if (elements.freteGratis) {
        elements.freteGratis.addEventListener("change", calcularPrecoVenda);
    }

    // Cálculo inicial
    atualizarMargemValue();
    calcularPrecoVenda();
});

// Função para resetar calculadora
function resetarCalculadora() {
    elements.custoProduto.value = "";
    elements.impostos.value = "";
    elements.despesasVariaveis.value = "";
    elements.custoExtra.value = "";
    elements.margemLucro.value = 0;
    elements.freteGratis.checked = true; // Mantém ativado por padrão
    multiplicadorCusto = 1;
    document.querySelector(".multiplier").textContent = "1x";
    
    atualizarMargemValue();
    calcularPrecoVenda();
}

// Função para exportar dados (opcional)
function exportarDados() {
    const dados = {
        custoProduto: parseFloat(elements.custoProduto.value.replace(",", ".")) || 0,
        multiplicador: multiplicadorCusto,
        impostos: parseFloat(elements.impostos.value.replace(",", ".")) || 0,
        despesasVariaveis: parseFloat(elements.despesasVariaveis.value.replace(",", ".")) || 0,
        custoExtra: parseFloat(elements.custoExtra.value.replace(",", ".")) || 0,
        margemLucro: parseFloat(elements.margemLucro.value) || 0,
        freteGratis: elements.freteGratis.checked,
        precoVenda: elements.precoVenda.textContent,
        lucroLiquido: elements.lucroPorVenda.textContent
    };
    
    console.log("Dados da calculadora:", dados);
    return dados;
}

// Tornar funções disponíveis globalmente se necessário
window.resetarCalculadora = resetarCalculadora;
window.exportarDados = exportarDados;


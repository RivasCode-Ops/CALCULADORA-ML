(function() {
    'use strict';

    const STORAGE_KEY = 'calculadora_ml_history';
    const CONFIG_KEY = 'calculadora_ml_config';

    const selectors = {
        saleValue: 'saleValue',
        feePercent: 'feePercent',
        feeFixed: 'feeFixed',
        productCost: 'productCost',
        shipping: 'shipping',
        otherExpenses: 'otherExpenses',
        calculateBtn: 'calculateBtn',
        resetBtn: 'resetBtn',
        results: 'results',
        netProfit: 'netProfit',
        margin: 'margin',
        marginFill: 'marginFill',
        profitBadge: 'profitBadge',
        breakdownToggle: 'breakdownToggle',
        breakdownContent: 'breakdownContent',
        breakdownSale: 'breakdownSale',
        breakdownFeePercent: 'breakdownFeePercent',
        breakdownFeeFixed: 'breakdownFeeFixed',
        breakdownCost: 'breakdownCost',
        breakdownShipping: 'breakdownShipping',
        breakdownExpenses: 'breakdownExpenses',
        breakdownTotalCosts: 'breakdownTotalCosts',
        simulationMode: 'simulationMode',
        saveBtn: 'saveBtn',
        copyBtn: 'copyBtn',
        shareBtn: 'shareBtn',
        clearHistoryBtn: 'clearHistoryBtn',
        historyList: 'historyList',
        targetProfit: 'targetProfit',
        targetMargin: 'targetMargin',
        revFeePercent: 'revFeePercent',
        revFeeFixed: 'revFeeFixed',
        revProductCost: 'revProductCost',
        revShipping: 'revShipping',
        revOtherExpenses: 'revOtherExpenses',
        calculateReverseBtn: 'calculateReverseBtn',
        resultsReverse: 'resultsReverse',
        recommendedPrice: 'recommendedPrice',
        reverseMarginCalc: 'reverseMarginCalc',
        reverseProfitCalc: 'reverseProfitCalc'
    };

    let currentCalculation = null;

    function getElement(id) {
        return document.getElementById(selectors[id] || id);
    }

    function parseNumber(value) {
        if (!value) return 0;
        const cleaned = String(value).replace(/[^\d,-]/g, '').replace(',', '.');
        return parseFloat(cleaned) || 0;
    }

    function formatCurrency(value) {
        return 'R$ ' + value.toFixed(2).replace('.', ',');
    }

    function formatInput(el) {
        const value = parseNumber(el.value);
        if (value === 0) {
            el.value = '';
            return;
        }
        el.value = value.toFixed(2).replace('.', ',');
    }

    function calculate() {
        const saleValue = parseNumber(getElement('saleValue').value);
        const shipping = parseNumber(getElement('shipping').value);
        const productCost = parseNumber(getElement('productCost').value);
        const otherExpenses = parseNumber(getElement('otherExpenses').value);
        const feePercent = parseNumber(getElement('feePercent').value);
        const feeFixed = parseNumber(getElement('feeFixed').value);

        if (saleValue === 0) {
            getElement('saleValue').focus();
            return;
        }

        const feeAmount = saleValue * (feePercent / 100);
        const totalCosts = productCost + otherExpenses + feeAmount + feeFixed + shipping;
        const netProfit = saleValue - totalCosts;
        const margin = saleValue > 0 ? (netProfit / saleValue) * 100 : 0;

        currentCalculation = {
            saleValue, shipping, productCost, otherExpenses, feePercent, feeFixed,
            feeAmount, totalCosts, netProfit, margin,
            timestamp: Date.now()
        };

        getElement('netProfit').textContent = formatCurrency(netProfit);
        getElement('netProfit').className = 'result-hero-value ' + (netProfit >= 0 ? '' : 'loss');

        const isProfit = netProfit >= 0;
        getElement('profitBadge').className = 'result-hero-badge' + (isProfit ? '' : ' loss');
        getElement('profitBadge').querySelector('.badge-text').textContent = isProfit ? 'Lucrando' : 'Prejuízo';
        getElement('profitBadge').querySelector('.badge-icon').textContent = isProfit ? '✓' : '✕';

        getElement('margin').textContent = margin.toFixed(1) + '%';
        getElement('margin').className = 'metric-value ' + (margin >= 0 ? '' : 'loss');

        const fill = getElement('marginFill');
        fill.style.width = Math.max(0, Math.min(100, margin)) + '%';
        fill.className = 'progress-fill' + (margin < 0 ? ' danger' : '');

        getElement('breakdownSale').textContent = formatCurrency(saleValue);
        getElement('breakdownFeePercent').textContent = '- ' + formatCurrency(feeAmount);
        getElement('breakdownFeeFixed').textContent = '- ' + formatCurrency(feeFixed);
        getElement('breakdownCost').textContent = '- ' + formatCurrency(productCost);
        getElement('breakdownShipping').textContent = '- ' + formatCurrency(shipping);
        getElement('breakdownExpenses').textContent = '- ' + formatCurrency(otherExpenses);
        getElement('breakdownTotalCosts').textContent = '- ' + formatCurrency(totalCosts);

        getElement('results').classList.add('active');

        if (getElement('simulationMode').checked) {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
    }

    function calculateReverse() {
        const targetProfit = parseNumber(getElement('targetProfit').value);
        const targetMargin = parseNumber(getElement('targetMargin').value);
        const feePercent = parseNumber(getElement('revFeePercent').value);
        const feeFixed = parseNumber(getElement('revFeeFixed').value);
        const productCost = parseNumber(getElement('revProductCost').value);
        const shipping = parseNumber(getElement('revShipping').value);
        const otherExpenses = parseNumber(getElement('revOtherExpenses').value);

        if (targetProfit === 0 && targetMargin === 0) {
            getElement('targetProfit').focus();
            return;
        }

        let saleValue;
        
        if (targetMargin > 0) {
            const feeDecimal = feePercent / 100;
            const totalCosts = productCost + shipping + otherExpenses + feeFixed;
            saleValue = totalCosts / (1 - feeDecimal - (targetMargin / 100));
        } else {
            const feeDecimal = feePercent / 100;
            const totalCosts = productCost + shipping + otherExpenses + feeFixed + targetProfit;
            saleValue = totalCosts / (1 - feeDecimal);
        }

        const feeAmount = saleValue * (feePercent / 100);
        const totalCosts = productCost + shipping + otherExpenses + feeAmount + feeFixed;
        const netProfit = saleValue - totalCosts;
        const margin = saleValue > 0 ? (netProfit / saleValue) * 100 : 0;

        getElement('recommendedPrice').textContent = formatCurrency(saleValue);
        getElement('reverseMarginCalc').textContent = margin.toFixed(1) + '%';
        getElement('reverseProfitCalc').textContent = formatCurrency(netProfit);

        getElement('resultsReverse').classList.add('active');
    }

    function reset() {
        getElement('saleValue').value = '';
        getElement('productCost').value = '';
        getElement('shipping').value = '0,00';
        getElement('otherExpenses').value = '0,00';
        getElement('feePercent').value = '10,5';
        getElement('feeFixed').value = '5,50';

        getElement('results').classList.remove('active');
        currentCalculation = null;
        getElement('saleValue').focus();
    }

    function toggleBreakdown() {
        const btn = getElement('breakdownToggle');
        const content = getElement('breakdownContent');
        const isOpen = btn.getAttribute('aria-expanded') === 'true';

        btn.setAttribute('aria-expanded', !isOpen);
        content.classList.toggle('open', !isOpen);
    }

    function getHistory() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch {
            return [];
        }
    }

    function saveHistory() {
        if (!currentCalculation) return;
        
        const history = getHistory();
        history.unshift(currentCalculation);
        
        if (history.length > 50) {
            history.pop();
        }
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
        renderHistory();
    }

    function deleteHistory(index) {
        const history = getHistory();
        history.splice(index, 1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
        renderHistory();
    }

    function clearHistory() {
        localStorage.removeItem(STORAGE_KEY);
        renderHistory();
    }

    function loadHistoryItem(index) {
        const history = getHistory();
        const item = history[index];
        if (!item) return;

        getElement('saleValue').value = item.saleValue ? item.saleValue.toFixed(2).replace('.', ',') : '';
        getElement('productCost').value = item.productCost ? item.productCost.toFixed(2).replace('.', ',') : '';
        getElement('shipping').value = item.shipping ? item.shipping.toFixed(2).replace('.', ',') : '0,00';
        getElement('otherExpenses').value = item.otherExpenses ? item.otherExpenses.toFixed(2).replace('.', ',') : '0,00';
        getElement('feePercent').value = item.feePercent ? item.feePercent.toString().replace('.', ',') : '10,5';
        getElement('feeFixed').value = item.feeFixed ? item.feeFixed.toFixed(2).replace('.', ',') : '5,50';

        switchTab('calc');
        calculate();
    }

    function renderHistory() {
        const history = getHistory();
        const container = getElement('historyList');
        
        if (history.length === 0) {
            container.innerHTML = `
                <div class="history-empty">
                    <span class="history-empty-icon">📋</span>
                    <p>Nenhum cálculo salvo</p>
                    <p class="history-empty-sub">Clique em 💾 para salvar um cálculo</p>
                </div>
            `;
            return;
        }

        container.innerHTML = history.map((item, index) => `
            <div class="history-item" data-index="${index}">
                <div class="history-item-main">
                    <span class="history-item-sale">Venda: ${formatCurrency(item.saleValue)}</span>
                    <span class="history-item-profit ${item.netProfit >= 0 ? 'positive' : 'negative'}">
                        ${item.netProfit >= 0 ? '+' : ''}${formatCurrency(item.netProfit)}
                    </span>
                </div>
                <div class="history-item-meta">
                    <span class="history-item-margin">${item.margin.toFixed(1)}%</span>
                    <button class="history-item-delete" data-index="${index}" title="Excluir">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.history-item').forEach(el => {
            el.addEventListener('click', e => {
                if (e.target.closest('.history-item-delete')) return;
                loadHistoryItem(parseInt(el.dataset.index));
            });
        });

        container.querySelectorAll('.history-item-delete').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                deleteHistory(parseInt(btn.dataset.index));
            });
        });
    }

    function copyCalculation() {
        if (!currentCalculation) return;
        
        const text = `📊 Cálculo ML
Venda: ${formatCurrency(currentCalculation.saleValue)}
Custos: ${formatCurrency(currentCalculation.totalCosts)}
Lucro: ${formatCurrency(currentCalculation.netProfit)}
Margem: ${currentCalculation.margin.toFixed(1)}%`;

        navigator.clipboard.writeText(text).then(() => {
            const btn = getElement('copyBtn');
            btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
            setTimeout(() => {
                btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>';
            }, 2000);
        });
    }

    function shareCalculation() {
        if (!currentCalculation) return;
        
        const text = `Vendi por ${formatCurrency(currentCalculation.saleValue)} no ML, lucro líquido: ${formatCurrency(currentCalculation.netProfit)} (${currentCalculation.margin.toFixed(1)}%)`;
        
        if (navigator.share) {
            navigator.share({ text });
        } else {
            navigator.clipboard.writeText(text);
        }
    }

    function switchTab(tabName) {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === 'tab-' + tabName);
        });
    }

    function setupInputFormats() {
        const currencyInputs = [
            'saleValue', 'productCost', 'shipping', 'otherExpenses', 'feeFixed',
            'targetProfit', 'revFeeFixed', 'revProductCost', 'revShipping', 'revOtherExpenses'
        ];

        currencyInputs.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;

            el.addEventListener('blur', () => formatInput(el));

            el.addEventListener('focus', () => {
                if (parseNumber(el.value) === 0) {
                    el.value = '';
                }
            });
        });
    }

    function init() {
        getElement('calculateBtn').addEventListener('click', calculate);
        getElement('resetBtn').addEventListener('click', reset);
        getElement('breakdownToggle').addEventListener('click', toggleBreakdown);
        getElement('saveBtn').addEventListener('click', saveHistory);
        getElement('copyBtn').addEventListener('click', copyCalculation);
        getElement('shareBtn').addEventListener('click', shareCalculation);
        getElement('clearHistoryBtn').addEventListener('click', clearHistory);
        getElement('calculateReverseBtn').addEventListener('click', calculateReverse);

        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => switchTab(tab.dataset.tab));
        });

        document.querySelectorAll('.input-currency input, .input-suffix input').forEach(input => {
            input.addEventListener('keypress', e => {
                if (e.key === 'Enter') calculate();
            });
        });

        setupInputFormats();
        renderHistory();
        getElement('saleValue').focus();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
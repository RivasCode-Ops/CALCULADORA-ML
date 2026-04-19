(function() {
    'use strict';

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
        simulationMode: 'simulationMode'
    };

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

    function reset() {
        getElement('saleValue').value = '';
        getElement('productCost').value = '';
        getElement('shipping').value = '0,00';
        getElement('otherExpenses').value = '0,00';
        getElement('feePercent').value = '10,5';
        getElement('feeFixed').value = '5,50';

        getElement('results').classList.remove('active');
        getElement('saleValue').focus();
    }

    function toggleBreakdown() {
        const btn = getElement('breakdownToggle');
        const content = getElement('breakdownContent');
        const isOpen = btn.getAttribute('aria-expanded') === 'true';

        btn.setAttribute('aria-expanded', !isOpen);
        content.classList.toggle('open', !isOpen);
    }

    function setupInputFormats() {
        const currencyInputs = [
            'saleValue', 'productCost', 'shipping', 'otherExpenses', 'feeFixed'
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

        document.querySelectorAll('.input-currency input, .input-suffix input').forEach(input => {
            input.addEventListener('keypress', e => {
                if (e.key === 'Enter') calculate();
            });
        });

        setupInputFormats();

        getElement('saleValue').focus();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
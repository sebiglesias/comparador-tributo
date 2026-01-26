/**
 * Main Application Logic
 * Handles UI interactions, form processing, and result display
 */

// =============================================================================
// Constants
// =============================================================================

const USD_ANNUAL_QUOTA = 12000; // USD annual quota without pesification
const USD_MONTHLY_QUOTA = USD_ANNUAL_QUOTA / 12; // $1,000 per month
const DEFAULT_EXCHANGE_RATE = 1000; // Default ARS/USD exchange rate

// =============================================================================
// DOM Elements
// =============================================================================

let formElements = {};
let resultsCache = null;

// =============================================================================
// Initialization
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
    initializeFormElements();
    setupEventListeners();
    setupExpandableSections();
    setupFAQ();
    loadSavedData();
    initializeDarkMode();
    formatCurrencyInputs();
});

/**
 * Initialize form element references
 */
function initializeFormElements() {
    formElements = {
        currency: document.getElementById('currency'),
        workModality: document.getElementById('work-modality'),
        paymentMethod: document.getElementById('payment-method'),
        useUsdQuota: document.getElementById('use-usd-quota'),
        exchangeRate: document.getElementById('exchange-rate'),
        income: document.getElementById('income'),
        activityType: document.getElementById('activity-type'),
        familySituation: document.getElementById('family-situation'),
        customFamily: document.getElementById('custom-family'),
        spouse: document.getElementById('spouse'),
        children: document.getElementById('children'),
        rent: document.getElementById('rent'),
        healthInsurance: document.getElementById('health-insurance'),
        domesticService: document.getElementById('domestic-service'),
        education: document.getElementById('education'),
        vatPurchases: document.getElementById('vat-purchases'),
        otherExpenses: document.getElementById('other-expenses'),
        calculateBtn: document.getElementById('calculate-btn'),
        resultsSection: document.getElementById('results-section')
    };
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Calculate button
    formElements.calculateBtn.addEventListener('click', handleCalculate);
    
    // Currency change
    formElements.currency.addEventListener('change', handleCurrencyChange);
    
    // Work modality change
    formElements.workModality.addEventListener('change', handleWorkModalityChange);
    
    // Payment method change
    formElements.paymentMethod.addEventListener('change', handlePaymentMethodChange);
    
    // Family situation change
    formElements.familySituation.addEventListener('change', (e) => {
        formElements.customFamily.style.display = e.target.value === 'custom' ? 'block' : 'none';
    });
    
    // Print button
    document.getElementById('print-btn')?.addEventListener('click', () => {
        window.print();
    });
    
    // Share button
    document.getElementById('share-btn')?.addEventListener('click', handleShare);
    
    // Dark mode toggle
    document.getElementById('dark-mode-toggle')?.addEventListener('change', toggleDarkMode);
}

/**
 * Setup expandable sections
 */
function setupExpandableSections() {
    const sections = document.querySelectorAll('.expandable-section');
    sections.forEach(section => {
        const toggle = section.querySelector('.section-toggle');
        toggle.addEventListener('click', () => {
            section.classList.toggle('expanded');
        });
    });
}

// =============================================================================
// Currency and Work Modality Handlers
// =============================================================================

/**
 * Handle currency change
 */
function handleCurrencyChange() {
    const isUSD = formElements.currency.value === 'USD';
    
    // Show/hide USD-specific fields
    document.getElementById('work-modality-group').style.display = isUSD ? 'block' : 'none';
    document.getElementById('payment-method-group').style.display = isUSD ? 'block' : 'none';
    document.getElementById('usd-quota-group').style.display = isUSD ? 'block' : 'none';
    document.getElementById('exchange-rate-group').style.display = isUSD ? 'block' : 'none';
    
    // Update income label
    const incomeLabel = document.getElementById('income-label');
    incomeLabel.textContent = isUSD 
        ? 'Ingreso mensual bruto deseado (USD)' 
        : 'Ingreso mensual bruto deseado (ARS)';
    
    // Update placeholder
    formElements.income.placeholder = isUSD ? 'Ej: 3000' : 'Ej: 1000000';
    
    // Clear income field
    formElements.income.value = '';
    
    // Set default work modality to foreign-contractor if USD and trigger info display
    if (isUSD) {
        formElements.workModality.value = 'foreign-contractor';
        handleWorkModalityChange();
    }
}

/**
 * Handle work modality change
 */
function handleWorkModalityChange() {
    const modality = formElements.workModality.value;
    const modalityInfo = document.getElementById('modality-info');
    const modalityDescription = document.getElementById('modality-description');
    
    const descriptions = {
        'formal-employee': '✓ Contrato bajo ley argentina | Sueldo pesificado al oficial | Aportes y contribuciones tradicionales | Todos los beneficios laborales (aguinaldo, vacaciones, etc.)',
        'foreign-contractor': '⚠️ Contrato como independent contractor | Facturación como monotributo o responsable inscripto | Obligación de emitir Factura E | Zona gris legal (no es técnicamente relación de dependencia)',
        'freelancer': '✓ Múltiples clientes | Monotributo o Responsable Inscripto | Factura E por exportación de servicios | Exportación genuina de servicios profesionales'
    };
    
    if (descriptions[modality]) {
        modalityDescription.textContent = descriptions[modality];
        modalityInfo.style.display = 'block';
    } else {
        modalityInfo.style.display = 'none';
    }
}

/**
 * Handle payment method change
 */
function handlePaymentMethodChange() {
    const method = formElements.paymentMethod.value;
    const quotaGroup = document.getElementById('usd-quota-group');
    
    // USD quota only applicable for foreign account or crypto
    if (method === 'foreign-account' || method === 'crypto') {
        quotaGroup.style.display = 'block';
    } else {
        quotaGroup.style.display = 'none';
        formElements.useUsdQuota.checked = false;
    }
}

/**
 * Setup FAQ accordion
 */
function setupFAQ() {
    const faqData = [
        {
            question: '¿Cuál es la diferencia entre Monotributo y Responsable Inscripto?',
            answer: 'El Monotributo es un régimen simplificado con una cuota fija mensual, ideal para pequeños contribuyentes. El Responsable Inscripto es el régimen general donde se pagan IVA, Ganancias e Ingresos Brutos según la facturación real, permitiendo deducir gastos y sin límites de facturación.'
        },
        {
            question: '¿Puedo estar en relación de dependencia y tener monotributo al mismo tiempo?',
            answer: 'Sí, es posible. Podés tener un trabajo en relación de dependencia y además facturar como monotributista por actividades independientes, siempre que no superes los límites de facturación del monotributo.'
        },
        {
            question: '¿Cuándo me conviene pasar de Monotributo a Responsable Inscripto?',
            answer: 'Conviene cuando: 1) Superás el límite de facturación del monotributo, 2) Tenés muchos gastos con IVA que podés recuperar como crédito fiscal, 3) Tus clientes son empresas que necesitan factura A, o 4) Exportás servicios.'
        },
        {
            question: '¿Los valores de esta calculadora son exactos?',
            answer: 'Esta calculadora provee estimaciones basadas en la normativa vigente 2025-2026. Los valores reales pueden variar según tu situación particular. Te recomendamos consultar con un contador matriculado para un cálculo preciso.'
        },
        {
            question: '¿Qué gastos puedo deducir en Ganancias?',
            answer: 'En relación de dependencia: alquiler (40%), medicina prepaga, servicio doméstico, gastos educativos. Como Responsable Inscripto: todos los gastos relacionados con tu actividad (alquiler de oficina, servicios, sueldos, materias primas, honorarios, etc.).'
        },
        {
            question: '¿Cómo se calcula el aguinaldo?',
            answer: 'El aguinaldo (SAC) es la mitad del mejor sueldo del semestre. Se paga en dos cuotas: junio (sobre el mejor sueldo enero-junio) y diciembre (sobre el mejor sueldo julio-diciembre). Solo aplica para relación de dependencia.'
        },
        {
            question: '¿Qué pasa si facturo más del límite del Monotributo?',
            answer: 'Si superás el límite anual de la categoría K ($94.560.000 para servicios), ARCA te excluirá automáticamente del monotributo y deberás inscribirte como Responsable Inscripto retroactivamente.'
        },
        {
            question: '¿Cuánto cuesta mantener un Responsable Inscripto?',
            answer: 'Además de los impuestos, considerá: honorarios de contador ($50.000-150.000/mes), software de facturación ($5.000-20.000/mes), y tiempo dedicado a administración. En total, el costo administrativo puede ser $60.000-200.000/mes.'
        }
    ];
    
    const faqList = document.getElementById('faq-list');
    if (!faqList) return;
    
    faqData.forEach((item, index) => {
        const faqItem = document.createElement('div');
        faqItem.className = 'faq-item';
        
        const question = document.createElement('div');
        question.className = 'faq-question';
        question.innerHTML = `
            <span>${item.question}</span>
            <span class="faq-icon">▼</span>
        `;
        
        const answer = document.createElement('div');
        answer.className = 'faq-answer';
        answer.textContent = item.answer;
        
        question.addEventListener('click', () => {
            faqItem.classList.toggle('active');
        });
        
        faqItem.appendChild(question);
        faqItem.appendChild(answer);
        faqList.appendChild(faqItem);
    });
}

/**
 * Format currency inputs with thousand separators
 */
function formatCurrencyInputs() {
    const currencyInputs = document.querySelectorAll('.currency-input');
    
    currencyInputs.forEach(input => {
        input.addEventListener('blur', (e) => {
            const value = parseCurrency(e.target.value);
            if (value > 0) {
                e.target.value = value.toLocaleString('es-AR');
            }
        });
        
        input.addEventListener('focus', (e) => {
            e.target.value = e.target.value.replace(/\./g, '');
        });
    });
}

// =============================================================================
// Calculation Handler
// =============================================================================

/**
 * Main calculation handler
 */
function handleCalculate() {
    // Get form data
    let income = parseCurrency(formElements.income.value);
    const currency = formElements.currency.value;
    const activityType = formElements.activityType.value;
    const familySituation = formElements.familySituation.value;
    
    // Validate income
    if (!income || income <= 0) {
        alert('Por favor ingresá un monto de ingreso válido');
        formElements.income.focus();
        return;
    }
    
    // Handle USD conversion
    let incomeARS = income;
    let incomeUSD = null;
    let exchangeRate = null;
    let workModality = null;
    let paymentMethod = null;
    let useUsdQuota = false;
    
    if (currency === 'USD') {
        incomeUSD = income;
        workModality = formElements.workModality.value;
        paymentMethod = formElements.paymentMethod.value;
        useUsdQuota = formElements.useUsdQuota.checked;
        
        // Get or estimate exchange rate
        const customRate = parseCurrency(formElements.exchangeRate.value);
        exchangeRate = customRate > 0 ? customRate : DEFAULT_EXCHANGE_RATE;
        
        // Convert USD to ARS based on payment method
        incomeARS = calculateARSIncome(incomeUSD, exchangeRate, paymentMethod, workModality, useUsdQuota);
    }
    
    // Get custom family data if applicable
    const customSpouse = familySituation === 'custom' ? formElements.spouse.checked : false;
    const customChildren = familySituation === 'custom' ? parseInt(formElements.children.value) || 0 : 0;
    
    // Get deductions
    const deductions = {
        rent: parseCurrency(formElements.rent.value),
        healthInsurance: parseCurrency(formElements.healthInsurance.value),
        domesticService: parseCurrency(formElements.domesticService.value),
        education: parseCurrency(formElements.education.value)
    };
    
    // Get business expenses
    const businessExpenses = {
        vatPurchases: parseCurrency(formElements.vatPurchases.value),
        otherExpenses: parseCurrency(formElements.otherExpenses.value)
    };
    
    // Calculate all regimes based on work modality
    let monotributo, relacion, responsable;
    
    if (currency === 'USD' && workModality === 'formal-employee') {
        // For formal employees, only show relación de dependencia
        relacion = calculateRelacionDependencia(incomeARS, familySituation, deductions, customSpouse, customChildren);
        monotributo = null;
        responsable = null;
    } else {
        // Calculate all regimes
        monotributo = calculateMonotributo(incomeARS, activityType);
        relacion = calculateRelacionDependencia(incomeARS, familySituation, deductions, customSpouse, customChildren);
        responsable = calculateResponsableInscripto(incomeARS, activityType, familySituation, deductions, businessExpenses, customSpouse, customChildren);
    }
    
    resultsCache = { 
        monotributo, 
        relacion, 
        responsable, 
        income: incomeARS,
        incomeUSD,
        exchangeRate,
        currency,
        workModality,
        paymentMethod,
        useUsdQuota
    };
    
    // Display results
    displayResults(resultsCache);
    
    // Save to localStorage
    saveData({ 
        income, 
        currency,
        workModality,
        paymentMethod,
        useUsdQuota,
        exchangeRate,
        activityType, 
        familySituation, 
        deductions, 
        businessExpenses, 
        customSpouse, 
        customChildren 
    });
    
    // Scroll to results
    formElements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Calculate ARS income from USD based on payment method and modality
 */
function calculateARSIncome(usd, exchangeRate, paymentMethod, workModality, useUsdQuota) {
    let arsIncome = 0;
    
    switch(paymentMethod) {
        case 'arg-bank':
            // Argentine bank account - pesification at official rate
            arsIncome = usd * exchangeRate;
            break;
            
        case 'foreign-account':
        case 'crypto':
            // Foreign account or crypto - can keep in USD (up to quota)
            // Still need to declare and pay taxes on ARS equivalent
            if (useUsdQuota && usd > USD_MONTHLY_QUOTA) {
                // Exceeds quota - but all taxed at same rate so simplified
                arsIncome = usd * exchangeRate;
            } else {
                // Within quota or not using quota - all taxed at official rate
                arsIncome = usd * exchangeRate;
            }
            break;
            
        case 'mixed':
            // Mixed - all income still taxed at official rate regardless of where kept
            arsIncome = usd * exchangeRate;
            break;
            
        default:
            arsIncome = usd * exchangeRate;
    }
    
    return Math.round(arsIncome);
}

// =============================================================================
// Results Display
// =============================================================================

/**
 * Display calculation results
 */
function displayResults(results) {
    formElements.resultsSection.style.display = 'block';
    
    // Determine best option
    displayBestOption(results);
    
    // Fill comparison table
    fillComparisonTable(results);
    
    // Draw charts
    drawCharts(results);
    
    // Fill detailed breakdowns
    fillDetailedBreakdowns(results);
}

/**
 * Display best option indicator
 */
function displayBestOption(results) {
    const bestOption = document.getElementById('best-option');
    
    // Find regime with highest net income
    const options = [
        { name: 'Relación de Dependencia', net: results.relacion.netSalary, regime: 'relacion' },
        { name: 'Monotributo', net: results.monotributo.netIncome, regime: 'monotributo' },
        { name: 'Responsable Inscripto', net: results.responsable.netIncome, regime: 'responsable' }
    ];
    
    options.sort((a, b) => b.net - a.net);
    const best = options[0];
    
    let recommendation = '';
    if (best.regime === 'monotributo' && results.monotributo.exceedsLimit) {
        recommendation = `⚠️ Atención: Aunque Monotributo parece mejor, SUPERÁS el límite máximo. Debes inscribirte como Responsable Inscripto.`;
    } else if (best.regime === 'monotributo' && results.monotributo.nearLimit) {
        recommendation = `🏆 El régimen más conveniente es <strong>${best.name}</strong> con ${formatCurrency(best.net)} neto por mes.<br>⚠️ Advertencia: Estás cerca del límite de facturación (${formatPercentage(results.monotributo.usagePercentage)}).`;
    } else {
        recommendation = `🏆 El régimen más conveniente para tu situación es <strong>${best.name}</strong><br>Ingreso neto mensual: ${formatCurrency(best.net)}`;
    }
    
    bestOption.innerHTML = recommendation;
}

/**
 * Fill comparison table
 */
function fillComparisonTable(results) {
    const tbody = document.getElementById('comparison-tbody');
    tbody.innerHTML = '';
    
    const rows = [
        {
            label: 'Ingreso bruto / Facturación',
            relacion: formatCurrency(results.relacion.grossSalary),
            monotributo: formatCurrency(results.income),
            responsable: formatCurrency(results.responsable.monthlyIncome)
        },
        {
            label: 'Aportes jubilatorios',
            relacion: formatCurrency(results.relacion.contributions.jubilacion),
            monotributo: formatCurrency(results.monotributo.breakdown.sipa),
            responsable: formatCurrency(results.responsable.taxes.autonomos)
        },
        {
            label: 'Obra Social',
            relacion: formatCurrency(results.relacion.contributions.obraSocial),
            monotributo: formatCurrency(results.monotributo.breakdown.obraSocial),
            responsable: 'Incluido en autónomos'
        },
        {
            label: 'Impuesto a las Ganancias',
            relacion: formatCurrency(results.relacion.ganancias),
            monotributo: 'Exento',
            responsable: formatCurrency(results.responsable.taxes.ganancias)
        },
        {
            label: 'IVA',
            relacion: 'N/A',
            monotributo: 'Incluido en cuota',
            responsable: formatCurrency(results.responsable.taxes.iva.net)
        },
        {
            label: 'Ingresos Brutos',
            relacion: 'N/A',
            monotributo: 'Incluido en cuota',
            responsable: formatCurrency(results.responsable.taxes.ingresosBrutos)
        },
        {
            label: 'Total Impuestos/Aportes',
            relacion: formatCurrency(results.relacion.contributions.total + results.relacion.ganancias),
            monotributo: formatCurrency(results.monotributo.monthlyFee),
            responsable: formatCurrency(results.responsable.taxes.total)
        },
        {
            label: 'Carga Tributaria Efectiva',
            relacion: formatPercentage(results.relacion.effectiveTaxRate),
            monotributo: formatPercentage(results.monotributo.effectiveTaxRate),
            responsable: formatPercentage(results.responsable.effectiveTaxRate)
        },
        {
            label: '💰 INGRESO NETO',
            relacion: formatCurrency(results.relacion.netSalary),
            monotributo: formatCurrency(results.monotributo.netIncome),
            responsable: formatCurrency(results.responsable.netIncome),
            highlight: true
        }
    ];
    
    // Find best value for each row
    rows.forEach(row => {
        const tr = document.createElement('tr');
        
        // Label cell
        const labelCell = document.createElement('td');
        labelCell.textContent = row.label;
        if (row.highlight) {
            labelCell.style.fontWeight = 'bold';
            labelCell.style.fontSize = '1.1rem';
        }
        tr.appendChild(labelCell);
        
        // Values
        const values = [
            { value: row.relacion, class: 'relacion' },
            { value: row.monotributo, class: 'monotributo' },
            { value: row.responsable, class: 'responsable' }
        ];
        
        // Determine best if numeric comparison
        let bestIndex = -1;
        if (row.highlight) {
            const numericValues = values.map(v => parseCurrency(v.value));
            const maxValue = Math.max(...numericValues);
            bestIndex = numericValues.indexOf(maxValue);
        }
        
        values.forEach((item, index) => {
            const cell = document.createElement('td');
            cell.className = `regime-col ${item.class}`;
            cell.textContent = item.value;
            
            if (row.highlight) {
                cell.style.fontWeight = 'bold';
                cell.style.fontSize = '1.1rem';
            }
            
            if (index === bestIndex) {
                cell.classList.add('highlight-best');
            }
            
            tr.appendChild(cell);
        });
        
        tbody.appendChild(tr);
    });
}

/**
 * Draw all charts
 */
function drawCharts(results) {
    // Bar chart
    const barData = {
        relacion: {
            net: results.relacion.netSalary,
            tax: results.relacion.contributions.total + results.relacion.ganancias,
            gross: results.relacion.grossSalary
        },
        monotributo: {
            net: results.monotributo.netIncome,
            tax: results.monotributo.monthlyFee,
            gross: results.income
        },
        responsable: {
            net: results.responsable.netIncome,
            tax: results.responsable.taxes.total,
            gross: results.responsable.monthlyIncome
        }
    };
    
    drawBarChart('bar-chart', barData);
    
    // Pie charts
    createPieCharts(results);
}

/**
 * Fill detailed breakdowns
 */
function fillDetailedBreakdowns(results) {
    // Relación de Dependencia
    const relacionDetail = document.getElementById('relacion-detail');
    relacionDetail.innerHTML = `
        <div class="breakdown-item">
            <span class="breakdown-label">Sueldo bruto</span>
            <span class="breakdown-value">${formatCurrency(results.relacion.grossSalary)}</span>
        </div>
        <div class="breakdown-item">
            <span class="breakdown-label">- Jubilación (11%)</span>
            <span class="breakdown-value">${formatCurrency(results.relacion.contributions.jubilacion)}</span>
        </div>
        <div class="breakdown-item">
            <span class="breakdown-label">- PAMI (3%)</span>
            <span class="breakdown-value">${formatCurrency(results.relacion.contributions.pami)}</span>
        </div>
        <div class="breakdown-item">
            <span class="breakdown-label">- Obra Social (3%)</span>
            <span class="breakdown-value">${formatCurrency(results.relacion.contributions.obraSocial)}</span>
        </div>
        <div class="breakdown-item">
            <span class="breakdown-label">- Ganancias</span>
            <span class="breakdown-value">${formatCurrency(results.relacion.ganancias)}</span>
        </div>
        <div class="breakdown-item">
            <span class="breakdown-label">= SUELDO NETO</span>
            <span class="breakdown-value">${formatCurrency(results.relacion.netSalary)}</span>
        </div>
        ${results.relacion.ganancias === 0 ? '<div class="alert-box">✅ No pagás Ganancias con este sueldo</div>' : ''}
        <div class="alert-box" style="background: #D1ECF1; border-color: #17A2B8; color: #0C5460; margin-top: 10px;">
            <strong>Beneficios incluidos:</strong> Aguinaldo, vacaciones pagas, ART, licencias, indemnización por despido
        </div>
        <div style="margin-top: 10px; font-size: 0.9rem;">
            <strong>Costo total para el empleador:</strong> ${formatCurrency(results.relacion.totalEmployerCost)}
            <br><small>(Incluye contribuciones patronales ~23%)</small>
        </div>
    `;
    
    // Monotributo
    const monotributoDetail = document.getElementById('monotributo-detail');
    let monotributoHTML = `
        <div class="breakdown-item">
            <span class="breakdown-label">Facturación mensual</span>
            <span class="breakdown-value">${formatCurrency(results.income)}</span>
        </div>
        <div class="breakdown-item">
            <span class="breakdown-label">- Cuota Categoría ${results.monotributo.category}</span>
            <span class="breakdown-value">${formatCurrency(results.monotributo.monthlyFee)}</span>
        </div>
        <div class="breakdown-item">
            <span class="breakdown-label">= INGRESO NETO</span>
            <span class="breakdown-value">${formatCurrency(results.monotributo.netIncome)}</span>
        </div>
    `;
    
    if (results.monotributo.exceedsLimit) {
        monotributoHTML += `
            <div class="alert-box" style="background: #F8D7DA; border-color: #DC3545; color: #721C24;">
                ⚠️ <strong>ATENCIÓN:</strong> Superaste el límite máximo del Monotributo (${formatCurrency(results.monotributo.maxAnnual)}/año).
                Debes inscribirte como Responsable Inscripto.
            </div>
        `;
    } else if (results.monotributo.nearLimit) {
        monotributoHTML += `
            <div class="alert-box">
                ⚠️ Estás usando ${formatPercentage(results.monotributo.usagePercentage)} del límite anual de tu categoría.
                Considerá planificar tu pasaje a Responsable Inscripto.
            </div>
        `;
    }
    
    monotributoHTML += `
        <div style="margin-top: 10px; font-size: 0.9rem;">
            <strong>Límite anual Categoría ${results.monotributo.category}:</strong> ${formatCurrency(results.monotributo.maxAnnual)}
            <br><strong>Facturación anual proyectada:</strong> ${formatCurrency(results.monotributo.currentAnnual)}
        </div>
    `;
    
    monotributoDetail.innerHTML = monotributoHTML;
    
    // Responsable Inscripto
    const responsableDetail = document.getElementById('responsable-detail');
    responsableDetail.innerHTML = `
        <div class="breakdown-item">
            <span class="breakdown-label">Facturación mensual</span>
            <span class="breakdown-value">${formatCurrency(results.responsable.monthlyIncome)}</span>
        </div>
        <div class="breakdown-item">
            <span class="breakdown-label">- Autónomos (Cat. ${results.responsable.taxes.autonomosCategory})</span>
            <span class="breakdown-value">${formatCurrency(results.responsable.taxes.autonomos)}</span>
        </div>
        <div class="breakdown-item">
            <span class="breakdown-label">- IVA neto</span>
            <span class="breakdown-value">${formatCurrency(results.responsable.taxes.iva.net)}</span>
        </div>
        <div class="breakdown-item">
            <span class="breakdown-label">- Ganancias (anticipo)</span>
            <span class="breakdown-value">${formatCurrency(results.responsable.taxes.ganancias)}</span>
        </div>
        <div class="breakdown-item">
            <span class="breakdown-label">- Ingresos Brutos (3.5%)</span>
            <span class="breakdown-value">${formatCurrency(results.responsable.taxes.ingresosBrutos)}</span>
        </div>
        <div class="breakdown-item">
            <span class="breakdown-label">- Imp. al Cheque (1.2%)</span>
            <span class="breakdown-value">${formatCurrency(results.responsable.taxes.impuestoCheque)}</span>
        </div>
        <div class="breakdown-item">
            <span class="breakdown-label">- Gastos operativos</span>
            <span class="breakdown-value">${formatCurrency(results.responsable.businessExpenses)}</span>
        </div>
        <div class="breakdown-item">
            <span class="breakdown-label">= INGRESO NETO</span>
            <span class="breakdown-value">${formatCurrency(results.responsable.netIncome)}</span>
        </div>
        <div class="alert-box" style="background: #FFF3CD; border-color: #FFC107; color: #856404; margin-top: 10px;">
            <strong>Costos adicionales a considerar:</strong> Contador ($50-150k/mes), software de facturación ($5-20k/mes)
        </div>
        <div style="margin-top: 10px; font-size: 0.9rem;">
            <strong>IVA Débito:</strong> ${formatCurrency(results.responsable.taxes.iva.debito)}
            <br><strong>IVA Crédito:</strong> ${formatCurrency(results.responsable.taxes.iva.credito)}
            <br><strong>Ganancias anual estimada:</strong> ${formatCurrency(results.responsable.taxes.annualGanancias)}
        </div>
    `;
}

// =============================================================================
// Data Persistence
// =============================================================================

/**
 * Save data to localStorage
 */
function saveData(data) {
    try {
        localStorage.setItem('taxCalculatorData', JSON.stringify(data));
    } catch (e) {
        console.error('Error saving to localStorage:', e);
    }
}

/**
 * Load saved data from localStorage
 */
function loadSavedData() {
    try {
        const saved = localStorage.getItem('taxCalculatorData');
        if (saved) {
            const data = JSON.parse(saved);
            
            if (data.income) formElements.income.value = data.income.toLocaleString('es-AR');
            if (data.activityType) formElements.activityType.value = data.activityType;
            if (data.familySituation) formElements.familySituation.value = data.familySituation;
            
            // Restore USD-related fields
            if (data.currency) {
                formElements.currency.value = data.currency;
                handleCurrencyChange(); // Trigger currency change to show/hide USD fields
            }
            if (data.workModality) formElements.workModality.value = data.workModality;
            if (data.paymentMethod) formElements.paymentMethod.value = data.paymentMethod;
            if (data.useUsdQuota !== undefined) formElements.useUsdQuota.checked = data.useUsdQuota;
            if (data.exchangeRate) formElements.exchangeRate.value = data.exchangeRate.toLocaleString('es-AR');
            
            if (data.deductions) {
                if (data.deductions.rent) formElements.rent.value = data.deductions.rent.toLocaleString('es-AR');
                if (data.deductions.healthInsurance) formElements.healthInsurance.value = data.deductions.healthInsurance.toLocaleString('es-AR');
                if (data.deductions.domesticService) formElements.domesticService.value = data.deductions.domesticService.toLocaleString('es-AR');
                if (data.deductions.education) formElements.education.value = data.deductions.education.toLocaleString('es-AR');
            }
            
            if (data.businessExpenses) {
                if (data.businessExpenses.vatPurchases) formElements.vatPurchases.value = data.businessExpenses.vatPurchases.toLocaleString('es-AR');
                if (data.businessExpenses.otherExpenses) formElements.otherExpenses.value = data.businessExpenses.otherExpenses.toLocaleString('es-AR');
            }
        }
    } catch (e) {
        console.error('Error loading from localStorage:', e);
    }
}

// =============================================================================
// Share Functionality
// =============================================================================

/**
 * Handle share button
 */
function handleShare() {
    if (!resultsCache) return;
    
    const params = new URLSearchParams({
        income: resultsCache.income,
        activity: formElements.activityType.value,
        family: formElements.familySituation.value
    });
    
    const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Comparador de Regímenes Tributarios',
            text: 'Mirá mi comparación de regímenes tributarios en Argentina',
            url: shareUrl
        }).catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareUrl).then(() => {
            alert('¡Link copiado al portapapeles!');
        }).catch(err => {
            console.error('Error copying to clipboard:', err);
        });
    }
}

// =============================================================================
// Dark Mode
// =============================================================================

/**
 * Initialize dark mode
 */
function initializeDarkMode() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (!darkModeToggle) return;
    
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'enabled') {
        document.documentElement.setAttribute('data-theme', 'dark');
        darkModeToggle.checked = true;
    }
}

/**
 * Toggle dark mode
 */
function toggleDarkMode(e) {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('darkMode', 'enabled');
    } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('darkMode', 'disabled');
    }
}

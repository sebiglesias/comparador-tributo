/**
 * Tax Calculator for Argentina 2026
 * Compares: Monotributo, Relación de Dependencia, and Responsable Inscripto
 * Updated with January-June 2026 values
 */

// =============================================================================
// Constants and Data
// =============================================================================

// Monotributo Categories (Services) - Valid from February 2026
// Updated with 14.3% increase (inflation July-December 2025)
const MONOTRIBUTO_CATEGORIES_SERVICES = [
    { category: 'A', maxAnnual: 10278540, monthlyFee: 42389 },
    { category: 'B', maxAnnual: 15059075, monthlyFee: 48253 },
    { category: 'C', maxAnnual: 21071176, monthlyFee: 55411 },
    { category: 'D', maxAnnual: 31066478, monthlyFee: 67441 },
    { category: 'E', maxAnnual: 36388711, monthlyFee: 78178 },
    { category: 'F', maxAnnual: 43034557, monthlyFee: 92587 },
    { category: 'G', maxAnnual: 50606013, monthlyFee: 111811 },
    { category: 'H', maxAnnual: 57314807, monthlyFee: 132332 },
    { category: 'I', maxAnnual: 68008950, monthlyFee: 221813 },
    { category: 'J', maxAnnual: 78703096, monthlyFee: 296570 },
    { category: 'K', maxAnnual: 108362895, monthlyFee: 1171212.59 }
];

// Monotributo Categories (Goods) - Higher limits for goods
// Valid from February 2026 - Updated with 14.3% increase
const MONOTRIBUTO_CATEGORIES_GOODS = [
    { category: 'A', maxAnnual: 12848175, monthlyFee: 42389 },
    { category: 'B', maxAnnual: 18823844, monthlyFee: 48253 },
    { category: 'C', maxAnnual: 26338970, monthlyFee: 55411 },
    { category: 'D', maxAnnual: 38833098, monthlyFee: 67441 },
    { category: 'E', maxAnnual: 45485889, monthlyFee: 78178 },
    { category: 'F', maxAnnual: 53793196, monthlyFee: 92587 },
    { category: 'G', maxAnnual: 63257516, monthlyFee: 111811 },
    { category: 'H', maxAnnual: 71643509, monthlyFee: 132332 },
    { category: 'I', maxAnnual: 85011188, monthlyFee: 221813 },
    { category: 'J', maxAnnual: 98378870, monthlyFee: 296570 },
    { category: 'K', maxAnnual: 135453619, monthlyFee: 1171212.59 }
];

// Personal Deductions for Ganancias (January-June 2026)
// Updated with 13.5%-14.3% increase (inflation July-December 2025)
const GANANCIAS_DEDUCTIONS = {
    noImponible: 5036140.63,
    conyuge: 4743034.38,
    hijo: 2391929.54,
    deduccionEspecial: 17626492.21
};

// Minimum Non-Taxable Income for Employees (January-June 2026)
// Updated with 13.5%-14.3% increase (inflation July-December 2025)
const MIN_NON_TAXABLE = {
    single: { bruto: 3000046, neto: 2488922 },
    married2Kids: { bruto: 3952152, neto: 3300726 }
};

// Ganancias Tax Brackets (Art. 94 - January-June 2026)
// Updated with 14% average increase (inflation July-December 2025)
const GANANCIAS_BRACKETS = [
    { from: 0, to: 1733224, rate: 0.05, fixed: 0 },
    { from: 1733224.01, to: 5199671, rate: 0.09, fixed: 86661 },
    { from: 5199671.01, to: 8666118, rate: 0.12, fixed: 398702 },
    { from: 8666118.01, to: 12132565, rate: 0.15, fixed: 814694 },
    { from: 12132565.01, to: 17332236, rate: 0.19, fixed: 1334800 },
    { from: 17332236.01, to: 34664472, rate: 0.23, fixed: 2322977 },
    { from: 34664472.01, to: 51996708, rate: 0.27, fixed: 6309412 },
    { from: 51996708.01, to: 69328944, rate: 0.31, fixed: 10989117 },
    { from: 69328944.01, to: Infinity, rate: 0.35, fixed: 16363250 }
];

// Autónomos Categories (January 2026)
// Updated with official ARCA values (2.47% increase vs December 2025)
const AUTONOMOS_CATEGORIES = [
    { category: 'I', amount: 62743.08 },
    { category: 'II', amount: 85048 },
    { category: 'III', amount: 121426 },
    { category: 'IV', amount: 194281 },
    { category: 'V', amount: 267137 }
];

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Format number as currency (ARS)
 */
function formatCurrency(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) {
        amount = 0;
    }
    
    // Format with thousand separators
    const formatted = Math.abs(amount).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const sign = amount < 0 ? '-' : '';
    
    return `${sign}$ ${formatted}`;
}

/**
 * Format number as percentage
 */
function formatPercentage(value) {
    return new Intl.NumberFormat('es-AR', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

/**
 * Parse currency input (removes formatting)
 */
function parseCurrency(value) {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    // Remove dots (thousand separators) and replace comma with dot if needed
    const cleaned = String(value).replace(/\./g, '').replace(/,/g, '.');
    const parsed = parseFloat(cleaned) || 0;
    return parsed;
}

// =============================================================================
// Tax Calculation Functions
// =============================================================================

/**
 * Calculate Monotributo regime
 */
function calculateMonotributo(monthlyIncome, activityType) {
    const annualIncome = monthlyIncome * 12;
    const categories = activityType === 'goods' ? MONOTRIBUTO_CATEGORIES_GOODS : MONOTRIBUTO_CATEGORIES_SERVICES;
    
    // Find appropriate category
    let category = null;
    for (let cat of categories) {
        if (annualIncome <= cat.maxAnnual) {
            category = cat;
            break;
        }
    }
    
    // If exceeds maximum, use category K
    if (!category) {
        category = categories[categories.length - 1];
    }
    
    const monthlyFee = category.monthlyFee;
    const netIncome = monthlyIncome - monthlyFee;
    const effectiveTaxRate = monthlyFee / monthlyIncome;
    
    // Check if near limit (80%+)
    const usagePercentage = annualIncome / category.maxAnnual;
    const nearLimit = usagePercentage >= 0.8;
    const exceedsLimit = annualIncome > categories[categories.length - 1].maxAnnual;
    
    return {
        regime: 'Monotributo',
        category: category.category,
        monthlyFee: monthlyFee,
        breakdown: {
            impuesto: monthlyFee * 0.35, // Approximate
            sipa: monthlyFee * 0.35, // Approximate
            obraSocial: monthlyFee * 0.30 // Approximate
        },
        netIncome: netIncome,
        effectiveTaxRate: effectiveTaxRate,
        maxAnnual: category.maxAnnual,
        currentAnnual: annualIncome,
        usagePercentage: usagePercentage,
        nearLimit: nearLimit,
        exceedsLimit: exceedsLimit,
        warnings: []
    };
}

/**
 * Calculate Ganancias tax based on progressive scale
 */
function calculateGanancias(taxableIncome) {
    if (taxableIncome <= 0) return 0;
    
    for (let bracket of GANANCIAS_BRACKETS) {
        if (taxableIncome >= bracket.from && taxableIncome <= bracket.to) {
            return bracket.fixed + (taxableIncome - bracket.from) * bracket.rate;
        }
    }
    
    // Should not reach here, but fallback to highest bracket
    const lastBracket = GANANCIAS_BRACKETS[GANANCIAS_BRACKETS.length - 1];
    return lastBracket.fixed + (taxableIncome - lastBracket.from) * lastBracket.rate;
}

/**
 * Calculate personal deductions for Ganancias
 */
function calculatePersonalDeductions(familySituation, customSpouse = false, customChildren = 0) {
    let deductions = GANANCIAS_DEDUCTIONS.noImponible + GANANCIAS_DEDUCTIONS.deduccionEspecial;
    
    if (familySituation === 'married' || familySituation === 'married-2kids') {
        deductions += GANANCIAS_DEDUCTIONS.conyuge;
    }
    
    if (familySituation === 'married-2kids') {
        deductions += GANANCIAS_DEDUCTIONS.hijo * 2;
    }
    
    if (familySituation === 'custom') {
        if (customSpouse) {
            deductions += GANANCIAS_DEDUCTIONS.conyuge;
        }
        deductions += GANANCIAS_DEDUCTIONS.hijo * customChildren;
    }
    
    return deductions;
}

/**
 * Calculate additional deductible expenses (with limits)
 */
function calculateAdditionalDeductions(rent, healthInsurance, domesticService, education) {
    let deductions = 0;
    
    // Rent: 40% deductible (simplified, real calculation has topes)
    if (rent > 0) {
        deductions += rent * 0.4;
    }
    
    // Health insurance (with approximated limit)
    if (healthInsurance > 0) {
        const limit = 100000; // Simplified limit
        deductions += Math.min(healthInsurance, limit);
    }
    
    // Domestic service
    if (domesticService > 0) {
        deductions += domesticService;
    }
    
    // Education
    if (education > 0) {
        const limit = 80000; // Simplified limit per month
        deductions += Math.min(education, limit);
    }
    
    return deductions;
}

/**
 * Calculate Relación de Dependencia (Employment)
 */
function calculateRelacionDependencia(grossSalary, familySituation, deductions, customSpouse = false, customChildren = 0) {
    // Personal contributions (17%)
    const jubilacion = grossSalary * 0.11;
    const pami = grossSalary * 0.03;
    const obraSocial = grossSalary * 0.03;
    const totalContributions = jubilacion + pami + obraSocial;
    
    // Calculate monthly personal deductions
    const monthlyPersonalDeductions = calculatePersonalDeductions(familySituation, customSpouse, customChildren) / 12;
    
    // Additional deductions
    const additionalDeductions = calculateAdditionalDeductions(
        deductions.rent,
        deductions.healthInsurance,
        deductions.domesticService,
        deductions.education
    );
    
    // Taxable income for Ganancias
    const taxableIncome = Math.max(0, grossSalary - totalContributions - monthlyPersonalDeductions - additionalDeductions);
    
    // Calculate Ganancias tax
    const ganancias = calculateGanancias(taxableIncome);
    
    // Net salary
    const netSalary = grossSalary - totalContributions - ganancias;
    
    // Employer costs (~23%)
    const employerJubilacion = grossSalary * 0.1017;
    const employerAnssal = grossSalary * 0.0444;
    const employerFondoEmpleo = grossSalary * 0.0089;
    const employerObraSocial = grossSalary * 0.06;
    const employerPami = grossSalary * 0.015;
    const totalEmployerCosts = employerJubilacion + employerAnssal + employerFondoEmpleo + employerObraSocial + employerPami;
    
    const totalEmployerCost = grossSalary + totalEmployerCosts;
    const effectiveTaxRate = (totalContributions + ganancias) / grossSalary;
    
    return {
        regime: 'Relación de Dependencia',
        grossSalary: grossSalary,
        contributions: {
            jubilacion: jubilacion,
            pami: pami,
            obraSocial: obraSocial,
            total: totalContributions
        },
        ganancias: ganancias,
        taxableIncome: taxableIncome,
        personalDeductions: monthlyPersonalDeductions,
        additionalDeductions: additionalDeductions,
        netSalary: netSalary,
        employerCosts: {
            jubilacion: employerJubilacion,
            anssal: employerAnssal,
            fondoEmpleo: employerFondoEmpleo,
            obraSocial: employerObraSocial,
            pami: employerPami,
            total: totalEmployerCosts
        },
        totalEmployerCost: totalEmployerCost,
        effectiveTaxRate: effectiveTaxRate,
        benefits: {
            aguinaldo: true,
            vacaciones: true,
            licencias: true,
            indemnizacion: true,
            art: true,
            obraSocial: true
        }
    };
}

/**
 * Determine autónomos category based on income
 */
function determineAutonomosCategory(annualIncome) {
    // Simplified logic - in reality it's based on previous year
    if (annualIncome < 5000000) return AUTONOMOS_CATEGORIES[0];
    if (annualIncome < 10000000) return AUTONOMOS_CATEGORIES[1];
    if (annualIncome < 20000000) return AUTONOMOS_CATEGORIES[2];
    if (annualIncome < 40000000) return AUTONOMOS_CATEGORIES[3];
    return AUTONOMOS_CATEGORIES[4];
}

/**
 * Calculate Responsable Inscripto regime
 */
function calculateResponsableInscripto(monthlyIncome, activityType, familySituation, deductions, businessExpenses, customSpouse = false, customChildren = 0) {
    const annualIncome = monthlyIncome * 12;
    
    // Autónomos contribution
    const autonomosCategory = determineAutonomosCategory(annualIncome);
    const autonomos = autonomosCategory.amount;
    
    // IVA calculation
    const ivaRate = activityType === 'goods' ? 0.21 : 0.21; // 21% general
    const ivaDebito = monthlyIncome * ivaRate;
    
    // IVA Crédito from purchases
    const ivaCredito = businessExpenses.vatPurchases * 0.21;
    const ivaNet = Math.max(0, ivaDebito - ivaCredito);
    
    // Ingresos Brutos (provincial tax) - average 3.5%
    const ingresosBrutos = monthlyIncome * 0.035;
    
    // Impuesto al cheque (0.6% on debits and credits = 1.2% total)
    const impuestoCheque = monthlyIncome * 0.012;
    
    // Ganancias calculation (annual)
    const annualPersonalDeductions = calculatePersonalDeductions(familySituation, customSpouse, customChildren);
    const annualAdditionalDeductions = calculateAdditionalDeductions(
        deductions.rent,
        deductions.healthInsurance,
        deductions.domesticService,
        deductions.education
    ) * 12;
    
    const annualBusinessExpenses = businessExpenses.otherExpenses * 12;
    const annualTaxableIncome = Math.max(0, annualIncome - annualPersonalDeductions - annualAdditionalDeductions - annualBusinessExpenses);
    
    // Annual Ganancias tax
    const annualGanancias = calculateGanancias(annualTaxableIncome);
    const monthlyGanancias = annualGanancias / 12; // Simplified to monthly anticipo
    
    // Total monthly taxes
    const totalMonthlyTaxes = autonomos + ivaNet + ingresosBrutos + impuestoCheque + monthlyGanancias;
    
    // Net income
    const netIncome = monthlyIncome - totalMonthlyTaxes - businessExpenses.otherExpenses;
    
    const effectiveTaxRate = totalMonthlyTaxes / monthlyIncome;
    
    return {
        regime: 'Responsable Inscripto',
        monthlyIncome: monthlyIncome,
        taxes: {
            autonomos: autonomos,
            autonomosCategory: autonomosCategory.category,
            iva: {
                debito: ivaDebito,
                credito: ivaCredito,
                net: ivaNet
            },
            ganancias: monthlyGanancias,
            annualGanancias: annualGanancias,
            ingresosBrutos: ingresosBrutos,
            impuestoCheque: impuestoCheque,
            total: totalMonthlyTaxes
        },
        businessExpenses: businessExpenses.otherExpenses,
        netIncome: netIncome,
        effectiveTaxRate: effectiveTaxRate,
        annualTaxableIncome: annualTaxableIncome
    };
}

// =============================================================================
// Export for use in app.js
// =============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateMonotributo,
        calculateRelacionDependencia,
        calculateResponsableInscripto,
        formatCurrency,
        formatPercentage,
        parseCurrency
    };
}

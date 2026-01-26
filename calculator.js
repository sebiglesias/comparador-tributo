/**
 * Tax Calculator for Argentina 2025-2026
 * Compares: Monotributo, Relación de Dependencia, and Responsable Inscripto
 */

// =============================================================================
// Constants and Data
// =============================================================================

// Monotributo Categories (Services) - Valid from August 2025
const MONOTRIBUTO_CATEGORIES_SERVICES = [
    { category: 'A', maxAnnual: 8992597.87, monthlyFee: 37085.74 },
    { category: 'B', maxAnnual: 13175201.52, monthlyFee: 42216.41 },
    { category: 'C', maxAnnual: 18434799.51, monthlyFee: 48478.91 },
    { category: 'D', maxAnnual: 27181485.12, monthlyFee: 59003.88 },
    { category: 'E', maxAnnual: 31837892.02, monthlyFee: 68397.01 },
    { category: 'F', maxAnnual: 37652105.73, monthlyFee: 81003.65 },
    { category: 'G', maxAnnual: 44274653.63, monthlyFee: 97823.80 },
    { category: 'H', maxAnnual: 50139759.18, monthlyFee: 115775.79 },
    { category: 'I', maxAnnual: 59500350.28, monthlyFee: 194093.62 },
    { category: 'J', maxAnnual: 68860941.38, monthlyFee: 259458.16 },
    { category: 'K', maxAnnual: 94560000, monthlyFee: 1381687.90 }
];

// Monotributo Categories (Goods) - Higher limits for goods
const MONOTRIBUTO_CATEGORIES_GOODS = [
    { category: 'A', maxAnnual: 11240747.34, monthlyFee: 37085.74 },
    { category: 'B', maxAnnual: 16469001.90, monthlyFee: 42216.41 },
    { category: 'C', maxAnnual: 23043499.39, monthlyFee: 48478.91 },
    { category: 'D', maxAnnual: 33976856.40, monthlyFee: 59003.88 },
    { category: 'E', maxAnnual: 39797365.03, monthlyFee: 68397.01 },
    { category: 'F', maxAnnual: 47065132.16, monthlyFee: 81003.65 },
    { category: 'G', maxAnnual: 55343317.04, monthlyFee: 97823.80 },
    { category: 'H', maxAnnual: 62674698.98, monthlyFee: 115775.79 },
    { category: 'I', maxAnnual: 74375437.85, monthlyFee: 194093.62 },
    { category: 'J', maxAnnual: 86076176.73, monthlyFee: 259458.16 },
    { category: 'K', maxAnnual: 118200000, monthlyFee: 1381687.90 }
];

// Personal Deductions for Ganancias (July-December 2025)
const GANANCIAS_DEDUCTIONS = {
    noImponible: 3916268.37,
    conyuge: 3688339.32,
    hijo: 1860042.98,
    deduccionEspecial: 13706939.31
};

// Minimum Non-Taxable Income for Employees (Second Semester 2025)
const MIN_NON_TAXABLE = {
    single: { bruto: 2843180, neto: 2360180 },
    married2Kids: { bruto: 3771045, neto: 3129967 }
};

// Ganancias Tax Brackets (Art. 94 - Second Semester 2025)
const GANANCIAS_BRACKETS = [
    { from: 0, to: 1520371.67, rate: 0.05, fixed: 0 },
    { from: 1520371.68, to: 4561114.88, rate: 0.09, fixed: 76018.58 },
    { from: 4561114.89, to: 7601858.23, rate: 0.12, fixed: 349905.47 },
    { from: 7601858.24, to: 10642601.46, rate: 0.15, fixed: 714994.67 },
    { from: 10642601.47, to: 15203716.59, rate: 0.19, fixed: 1171106.15 },
    { from: 15203716.60, to: 30407433.31, rate: 0.23, fixed: 2037717.04 },
    { from: 30407433.32, to: 45611149.89, rate: 0.27, fixed: 5534571.88 },
    { from: 45611149.90, to: 60814866.61, rate: 0.31, fixed: 9639576.11 },
    { from: 60814866.62, to: Infinity, rate: 0.35, fixed: 14353728.21 }
];

// Autónomos Categories (January 2026 - approximate)
const AUTONOMOS_CATEGORIES = [
    { category: 'I', amount: 59300 },
    { category: 'II', amount: 83000 },
    { category: 'III', amount: 118500 },
    { category: 'IV', amount: 189600 },
    { category: 'V', amount: 260700 }
];

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Format number as currency (ARS)
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
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
    return parseFloat(value.replace(/[^0-9.-]/g, '')) || 0;
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

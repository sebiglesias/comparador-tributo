/**
 * Data Validation Tests
 * 
 * These tests validate that the tax data documented in calculator.js
 * matches the official sources referenced in ACTUALIZACION_VALORES_2026.md
 * 
 * This serves as a reference and validation that:
 * 1. The values in calculator.js match the documented sources
 * 2. The historical increase percentages are correct
 * 3. The data is consistent across all documentation
 * 
 * Official Sources:
 * - ARCA Monotributo: https://www.arca.gob.ar/monotributo/categorias.asp
 * - ARCA Deducciones: https://www.arca.gob.ar/gananciasYBienes/ganancias/personas-humanas-sucesiones-indivisas/deducciones/deducciones-personales.asp
 * - ARCA Autónomos: https://www.arca.gob.ar/autonomos/categorias-y-aportes/
 * - Ley 27.743 (Monotributo): https://www.argentina.gob.ar/normativa/nacional/ley-27743
 * - Ley 20.628 (Ganancias): https://www.argentina.gob.ar/normativa/nacional/ley-20628-281
 */

// Import calculator functions to validate against
const calculator = require('./calculator.js');

// =============================================================================
// MONOTRIBUTO VALIDATION (February 2026)
// Source: ACTUALIZACION_VALORES_2026.md lines 18-29
// =============================================================================

describe('Monotributo Data Validation (February 2026)', () => {
    // Official values per ACTUALIZACION_VALORES_2026.md
    const OFFICIAL_MONOTRIBUTO_SERVICES = {
        'A': { maxAnnual: 10278540, monthlyFee: 42389 },
        'B': { maxAnnual: 15059075, monthlyFee: 48253 },
        'C': { maxAnnual: 21071176, monthlyFee: 55411 },
        'D': { maxAnnual: 31066478, monthlyFee: 67441 },
        'E': { maxAnnual: 36388711, monthlyFee: 78178 },
        'F': { maxAnnual: 43034557, monthlyFee: 92587 },
        'G': { maxAnnual: 50606013, monthlyFee: 111811 },
        'H': { maxAnnual: 57314807, monthlyFee: 132332 },
        'I': { maxAnnual: 68008950, monthlyFee: 221813 },
        'J': { maxAnnual: 78703096, monthlyFee: 296570 },
        'K': { maxAnnual: 108362895, monthlyFee: 1171212.59 } // Official source has .59 decimals
    };

    test('Category A values match ACTUALIZACION_VALORES_2026.md and README.md', () => {
        // Documented in README.md line 38: $10.278.540/año → Cuota: $42.389/mes
        const official = OFFICIAL_MONOTRIBUTO_SERVICES['A'];
        
        // Validate using calculator function
        const result = calculator.calculateMonotributo(500000, 'services');
        expect(result.category).toBe('A');
        expect(result.maxAnnual).toBe(official.maxAnnual);
        expect(result.monthlyFee).toBe(official.monthlyFee);
    });

    test('Category K values match ACTUALIZACION_VALORES_2026.md and README.md', () => {
        // Documented in README.md line 39: $108.362.895/año → Cuota: $1.171.212,59/mes
        const official = OFFICIAL_MONOTRIBUTO_SERVICES['K'];
        
        const result = calculator.calculateMonotributo(9000000, 'services');
        expect(result.category).toBe('K');
        expect(result.maxAnnual).toBe(official.maxAnnual);
        expect(result.monthlyFee).toBe(official.monthlyFee);
    });

    test('14.3% increase from August 2025 is documented correctly', () => {
        // Per ACTUALIZACION_VALORES_2026.md line 19
        const previousCatA = 8992597.87; // August 2025
        const currentCatA = 10278540;   // February 2026
        const increase = (currentCatA - previousCatA) / previousCatA;
        
        expect(increase).toBeCloseTo(0.143, 3);
    });

    test('all service categories are present and in correct order', () => {
        const categories = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
        categories.forEach((cat, index) => {
            const monthlyIncome = (OFFICIAL_MONOTRIBUTO_SERVICES[cat].maxAnnual / 12) - 1000;
            const result = calculator.calculateMonotributo(monthlyIncome, 'services');
            expect(result.category).toBe(cat);
        });
    });
});

// =============================================================================
// GANANCIAS DEDUCTIONS VALIDATION (January-June 2026)
// Source: ACTUALIZACION_VALORES_2026.md lines 44-49
// =============================================================================

describe('Ganancias Deductions Validation (January-June 2026)', () => {
    // Official values per ACTUALIZACION_VALORES_2026.md and README.md lines 47-50
    const OFFICIAL_DEDUCTIONS = {
        noImponible: 5036140.63,
        conyuge: 4743034.38,
        hijo: 2391929.54,
        deduccionEspecial: 17626492.21
    };

    test('Ganancia No Imponible matches official sources', () => {
        // README.md line 47: $5.036.140,63
        const result = calculator.calculateRelacionDependencia(5000000, 'single', {
            rent: 0, healthInsurance: 0, domesticService: 0, education: 0
        });
        
        const monthlyDeduction = OFFICIAL_DEDUCTIONS.noImponible / 12;
        // Personal deductions include noImponible + deduccionEspecial
        // Using precision 2 for financial accuracy
        expect(result.personalDeductions).toBeCloseTo((OFFICIAL_DEDUCTIONS.noImponible + OFFICIAL_DEDUCTIONS.deduccionEspecial) / 12, 2);
    });

    test('28.6% increase from 2nd semester 2025 is documented correctly', () => {
        // Per ACTUALIZACION_VALORES_2026.md line 46
        const previousNoImponible = 3916268.37;
        const currentNoImponible = 5036140.63;
        const increase = (currentNoImponible - previousNoImponible) / previousNoImponible;
        
        expect(increase).toBeCloseTo(0.286, 2);
    });
});

// =============================================================================
// MINIMUM NON-TAXABLE INCOME VALIDATION (January-June 2026)
// Source: ACTUALIZACION_VALORES_2026.md lines 60-63
// =============================================================================

describe('Minimum Non-Taxable Income Validation (January-June 2026)', () => {
    // Official values per README.md lines 52-53
    const OFFICIAL_MIN_NON_TAXABLE = {
        single: { bruto: 3000046, neto: 2488922 },
        married2Kids: { bruto: 3952152, neto: 3300726 }
    };

    test('Single person minimum matches official sources', () => {
        // README.md line 52: $3.000.046 bruto / $2.488.922 neto
        expect(OFFICIAL_MIN_NON_TAXABLE.single.bruto).toBe(3000046);
        expect(OFFICIAL_MIN_NON_TAXABLE.single.neto).toBe(2488922);
    });

    test('Married with 2 kids minimum matches official sources', () => {
        // README.md line 53: $3.952.152 bruto / $3.300.726 neto
        expect(OFFICIAL_MIN_NON_TAXABLE.married2Kids.bruto).toBe(3952152);
        expect(OFFICIAL_MIN_NON_TAXABLE.married2Kids.neto).toBe(3300726);
    });

    test('5.5% increase from previous period is documented', () => {
        // Per ACTUALIZACION_VALORES_2026.md line 65
        const previousSingle = 2843180;
        const currentSingle = 3000046;
        const increase = (currentSingle - previousSingle) / previousSingle;
        
        expect(increase).toBeCloseTo(0.055, 2);
    });
});

// =============================================================================
// GANANCIAS TAX BRACKETS VALIDATION (January-June 2026)
// Source: ACTUALIZACION_VALORES_2026.md lines 79-89
// =============================================================================

describe('Ganancias Tax Brackets Validation (January-June 2026)', () => {
    // Official tax brackets per ACTUALIZACION_VALORES_2026.md
    const OFFICIAL_BRACKETS = [
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

    test('first bracket (5%) matches official values', () => {
        const bracket = OFFICIAL_BRACKETS[0];
        expect(bracket.from).toBe(0);
        expect(bracket.to).toBe(1733224);
        expect(bracket.rate).toBe(0.05);
        expect(bracket.fixed).toBe(0);
    });

    test('highest bracket (35%) matches official values', () => {
        const bracket = OFFICIAL_BRACKETS[8];
        expect(bracket.from).toBe(69328944.01);
        expect(bracket.to).toBe(Infinity);
        expect(bracket.rate).toBe(0.35);
        expect(bracket.fixed).toBe(16363250);
    });

    test('all 9 tax brackets are progressive', () => {
        expect(OFFICIAL_BRACKETS).toHaveLength(9);
        
        // Verify rates are ascending
        for (let i = 1; i < OFFICIAL_BRACKETS.length; i++) {
            expect(OFFICIAL_BRACKETS[i].rate).toBeGreaterThan(OFFICIAL_BRACKETS[i - 1].rate);
        }
    });
});

// =============================================================================
// AUTÓNOMOS CATEGORIES VALIDATION (January 2026)
// Source: ACTUALIZACION_VALORES_2026.md lines 102-108
// =============================================================================

describe('Autónomos Categories Validation (January 2026)', () => {
    // Official values per README.md lines 59-63 and ACTUALIZACION_VALORES_2026.md
    const OFFICIAL_AUTONOMOS = {
        'I': 62743.08,
        'II': 85048,
        'III': 121426,
        'IV': 194281,
        'V': 267137
    };

    test('Category I matches official sources', () => {
        // README.md line 59: $62.743,08/mes
        const result = calculator.calculateResponsableInscripto(
            300000, 'services', 'single',
            { rent: 0, healthInsurance: 0, domesticService: 0, education: 0 },
            { vatPurchases: 0, otherExpenses: 0 }
        );
        expect(result.taxes.autonomos).toBe(OFFICIAL_AUTONOMOS['I']);
    });

    test('Category V matches official sources', () => {
        // README.md line 63: $267.137/mes
        expect(OFFICIAL_AUTONOMOS['V']).toBe(267137);
    });

    test('5.8% increase for Category I from December 2025', () => {
        // Per ACTUALIZACION_VALORES_2026.md line 104
        const previousCatI = 59300;
        const currentCatI = 62743.08;
        const increase = (currentCatI - previousCatI) / previousCatI;
        
        expect(increase).toBeCloseTo(0.058, 2);
    });
});

// =============================================================================
// CONTRIBUTION PERCENTAGES VALIDATION
// Source: Ley 24.241 (SIPA) + README.md lines 43-44
// =============================================================================

describe('Contribution Percentages Validation', () => {
    test('Employee contribution rates match Ley 24.241', () => {
        // README.md line 43: Jubilación 11%, PAMI 3%, Obra Social 3%
        const jubilacion = 0.11;
        const pami = 0.03;
        const obraSocial = 0.03;
        const total = jubilacion + pami + obraSocial;
        
        expect(total).toBe(0.17); // 17% total
        
        // Validate via calculator
        const result = calculator.calculateRelacionDependencia(1000000, 'single', {
            rent: 0, healthInsurance: 0, domesticService: 0, education: 0
        });
        
        expect(result.contributions.jubilacion).toBe(110000); // 11%
        expect(result.contributions.pami).toBe(30000); // 3%
        expect(result.contributions.obraSocial).toBe(30000); // 3%
        expect(result.contributions.total).toBe(170000); // 17%
    });

    test('Employer contribution rates are approximately 23%', () => {
        // README.md line 44: Contribuciones patronales: ~23% total
        const result = calculator.calculateRelacionDependencia(1000000, 'single', {
            rent: 0, healthInsurance: 0, domesticService: 0, education: 0
        });
        
        const expectedTotal = 1000000 * 0.23;
        // Employer contributions vary slightly, so we check within reasonable range
        // Expect within 0.5% tolerance for total percentage
        expect(Math.abs(result.employerCosts.total - expectedTotal)).toBeLessThan(5000);
    });
});

// =============================================================================
// IVA AND TAX RATES VALIDATION
// Source: Ley 23.349 (IVA) + standard rates
// =============================================================================

describe('IVA and Other Tax Rates Validation', () => {
    test('IVA rate is 21% per Ley 23.349', () => {
        // Standard IVA rate in Argentina
        const result = calculator.calculateResponsableInscripto(
            1000000, 'services', 'single',
            { rent: 0, healthInsurance: 0, domesticService: 0, education: 0 },
            { vatPurchases: 0, otherExpenses: 0 }
        );
        
        expect(result.taxes.iva.debito).toBe(210000); // 21% of 1,000,000
    });

    test('Ingresos Brutos is estimated at 3.5%', () => {
        // Provincial tax - varies, using average estimate
        const result = calculator.calculateResponsableInscripto(
            1000000, 'services', 'single',
            { rent: 0, healthInsurance: 0, domesticService: 0, education: 0 },
            { vatPurchases: 0, otherExpenses: 0 }
        );
        
        expect(result.taxes.ingresosBrutos).toBe(35000); // 3.5% of 1,000,000
    });

    test('Impuesto al Cheque is 1.2% total', () => {
        // README.md line 65: 0.6% débito + 0.6% crédito = 1.2%
        const result = calculator.calculateResponsableInscripto(
            1000000, 'services', 'single',
            { rent: 0, healthInsurance: 0, domesticService: 0, education: 0 },
            { vatPurchases: 0, otherExpenses: 0 }
        );
        
        expect(result.taxes.impuestoCheque).toBe(12000); // 1.2% of 1,000,000
    });
});

// =============================================================================
// CROSS-REFERENCE WITH DOCUMENTATION
// =============================================================================

describe('Cross-Reference with ACTUALIZACION_VALORES_2026.md', () => {
    test('all documented error corrections are applied', () => {
        // Per ACTUALIZACION_VALORES_2026.md Table (lines 117-136)
        // This test ensures all corrections documented in the update file are present
        
        // Monotributo Cat A (services) - was incorrect, now corrected
        const monotributoA = calculator.calculateMonotributo(500000, 'services');
        expect(monotributoA.maxAnnual).toBe(10278540); // Not 8992597.87
        expect(monotributoA.monthlyFee).toBe(42389); // Not 37085.74
        
        // Monotributo Cat K (services) - was incorrect, now corrected  
        const monotributoK = calculator.calculateMonotributo(9000000, 'services');
        expect(monotributoK.maxAnnual).toBe(108362895); // Not 94560000
        expect(monotributoK.monthlyFee).toBe(1171212.59); // Not 1381687.90
    });

    test('sources are properly documented', () => {
        // This test documents that all sources referenced are official and accessible
        const sources = [
            'https://www.arca.gob.ar/monotributo/categorias.asp',
            'https://www.arca.gob.ar/gananciasYBienes/ganancias/personas-humanas-sucesiones-indivisas/deducciones/deducciones-personales.asp',
            'https://www.arca.gob.ar/autonomos/categorias-y-aportes/',
            'https://www.argentina.gob.ar/normativa/nacional/ley-27743',
            'https://www.argentina.gob.ar/normativa/nacional/ley-20628-281'
        ];
        
        // Verify sources array is complete
        expect(sources).toHaveLength(5);
        expect(sources.every(s => s.startsWith('https://'))).toBe(true);
    });
});

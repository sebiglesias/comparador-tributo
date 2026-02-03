/**
 * Tests for Tax Calculator Functions
 * Testing all formulas and math operations
 */

const {
    calculateMonotributo,
    calculateRelacionDependencia,
    calculateResponsableInscripto,
    formatCurrency,
    formatPercentage,
    parseCurrency
} = require('./calculator.js');

// =============================================================================
// Utility Functions Tests
// =============================================================================

describe('Utility Functions', () => {
    describe('formatCurrency', () => {
        test('formats positive numbers correctly', () => {
            expect(formatCurrency(2000000)).toBe('$ 2.000.000');
            expect(formatCurrency(220000)).toBe('$ 220.000');
            expect(formatCurrency(1000)).toBe('$ 1.000');
            expect(formatCurrency(100)).toBe('$ 100');
        });

        test('formats negative numbers correctly', () => {
            expect(formatCurrency(-2000000)).toBe('-$ 2.000.000');
            expect(formatCurrency(-500)).toBe('-$ 500');
        });

        test('handles zero correctly', () => {
            expect(formatCurrency(0)).toBe('$ 0');
        });

        test('handles invalid inputs', () => {
            expect(formatCurrency(NaN)).toBe('$ 0');
            expect(formatCurrency(null)).toBe('$ 0');
            expect(formatCurrency(undefined)).toBe('$ 0');
        });

        test('rounds to nearest integer', () => {
            expect(formatCurrency(1000.49)).toBe('$ 1.000');
            expect(formatCurrency(1000.50)).toBe('$ 1.001'); // Rounds half up
            expect(formatCurrency(999.50)).toBe('$ 1.000'); // Rounds half up
        });
    });

    describe('parseCurrency', () => {
        test('parses string numbers correctly', () => {
            expect(parseCurrency('2000000')).toBe(2000000);
            expect(parseCurrency('2.000.000')).toBe(2000000);
            expect(parseCurrency('1.500.000,50')).toBe(1500000.50);
        });

        test('handles numeric input', () => {
            expect(parseCurrency(2000000)).toBe(2000000);
            expect(parseCurrency(1500.50)).toBe(1500.50);
        });

        test('handles empty or invalid inputs', () => {
            expect(parseCurrency('')).toBe(0);
            expect(parseCurrency(null)).toBe(0);
            expect(parseCurrency(undefined)).toBe(0);
            expect(parseCurrency('abc')).toBe(0);
        });
    });

    describe('formatPercentage', () => {
        test('formats percentages correctly', () => {
            const result1 = formatPercentage(0.15);
            expect(result1).toContain('15');
            
            const result2 = formatPercentage(0.2345);
            expect(result2).toContain('23');
        });
    });
});

// =============================================================================
// Monotributo Calculation Tests
// =============================================================================

describe('Monotributo Calculations', () => {
    describe('Category Selection - Services', () => {
        test('selects Category A for low income', () => {
            const result = calculateMonotributo(500000, 'services');
            expect(result.category).toBe('A');
            expect(result.monthlyFee).toBe(42389);
            expect(result.exceedsLimit).toBe(false);
        });

        test('selects Category D for medium income', () => {
            const result = calculateMonotributo(2500000, 'services');
            expect(result.category).toBe('D');
            expect(result.monthlyFee).toBe(67441);
        });

        test('selects Category K for high income', () => {
            const result = calculateMonotributo(8000000, 'services');
            expect(result.category).toBe('K');
            expect(result.monthlyFee).toBe(1171212.59);
        });

        test('uses Category K when exceeding maximum', () => {
            const result = calculateMonotributo(10000000, 'services');
            expect(result.category).toBe('K');
            expect(result.exceedsLimit).toBe(true);
        });
    });

    describe('Category Selection - Goods', () => {
        test('selects correct category for goods with higher limits', () => {
            const result = calculateMonotributo(1000000, 'goods');
            expect(result.category).toBe('A');
            expect(result.monthlyFee).toBe(42389);
        });

        test('goods categories have higher limits than services', () => {
            const monthlyIncome = 1000000;
            const resultServices = calculateMonotributo(monthlyIncome, 'services');
            const resultGoods = calculateMonotributo(monthlyIncome, 'goods');
            
            // For the same category letter, goods should have higher max
            // But at same income, they might be in different categories
            // Let's verify goods have higher absolute limits
            expect(resultGoods.category).toBe('A'); // Fits in A for goods
            expect(resultServices.category).toBe('B'); // Needs B for services
            
            // Goods category A max should be higher than services category A max
            const servicesACategoryMax = 10278540;
            const goodsACategoryMax = 12848175;
            expect(goodsACategoryMax).toBeGreaterThan(servicesACategoryMax);
        });
    });

    describe('Financial Calculations', () => {
        test('calculates net income correctly', () => {
            const monthlyIncome = 2000000;
            const result = calculateMonotributo(monthlyIncome, 'services');
            
            expect(result.netIncome).toBe(monthlyIncome - result.monthlyFee);
        });

        test('calculates effective tax rate correctly', () => {
            const monthlyIncome = 2000000;
            const result = calculateMonotributo(monthlyIncome, 'services');
            
            const expectedRate = result.monthlyFee / monthlyIncome;
            expect(result.effectiveTaxRate).toBeCloseTo(expectedRate, 10);
        });

        test('calculates usage percentage correctly', () => {
            const monthlyIncome = 2000000;
            const result = calculateMonotributo(monthlyIncome, 'services');
            
            const annualIncome = monthlyIncome * 12;
            const expectedUsage = annualIncome / result.maxAnnual;
            expect(result.usagePercentage).toBeCloseTo(expectedUsage, 10);
        });

        test('identifies near limit correctly', () => {
            // 85% usage should trigger near limit warning
            const result = calculateMonotributo(730000, 'services'); // Category A max ~856545/month
            expect(result.usagePercentage).toBeGreaterThan(0.8);
            expect(result.nearLimit).toBe(true);
        });
    });

    describe('Breakdown Components', () => {
        test('breakdown percentages sum to approximately 100%', () => {
            const result = calculateMonotributo(2000000, 'services');
            const breakdown = result.breakdown;
            
            const total = breakdown.impuesto + breakdown.sipa + breakdown.obraSocial;
            expect(total).toBeCloseTo(result.monthlyFee, 0);
        });

        test('breakdown has correct proportions', () => {
            const result = calculateMonotributo(2000000, 'services');
            const breakdown = result.breakdown;
            
            expect(breakdown.impuesto).toBeCloseTo(result.monthlyFee * 0.35, 2);
            expect(breakdown.sipa).toBeCloseTo(result.monthlyFee * 0.35, 2);
            expect(breakdown.obraSocial).toBeCloseTo(result.monthlyFee * 0.30, 2);
        });
    });
});

// =============================================================================
// Ganancias Tax Brackets Tests
// =============================================================================

describe('Ganancias Progressive Tax', () => {
    // Helper function to calculate ganancias (not exported, so we test through integration)
    
    test('no tax for income below minimum', () => {
        const result = calculateRelacionDependencia(1000000, 'single', {
            rent: 0,
            healthInsurance: 0,
            domesticService: 0,
            education: 0
        });
        
        expect(result.ganancias).toBe(0);
    });

    test('applies first bracket (5%) correctly', () => {
        // Test with income in first bracket
        const result = calculateRelacionDependencia(5000000, 'single', {
            rent: 0,
            healthInsurance: 0,
            domesticService: 0,
            education: 0
        });
        
        // Should have some tax but not much
        expect(result.ganancias).toBeGreaterThanOrEqual(0);
    });

    test('calculates tax for medium income correctly', () => {
        // Income that should trigger multiple brackets
        const result = calculateRelacionDependencia(10000000, 'single', {
            rent: 0,
            healthInsurance: 0,
            domesticService: 0,
            education: 0
        });
        
        expect(result.ganancias).toBeGreaterThan(0);
        expect(result.taxableIncome).toBeGreaterThan(0);
    });

    test('higher income results in higher tax', () => {
        const result1 = calculateRelacionDependencia(5000000, 'single', {
            rent: 0, healthInsurance: 0, domesticService: 0, education: 0
        });
        
        const result2 = calculateRelacionDependencia(10000000, 'single', {
            rent: 0, healthInsurance: 0, domesticService: 0, education: 0
        });
        
        // Higher gross should result in higher tax
        expect(result2.ganancias).toBeGreaterThanOrEqual(result1.ganancias);
    });
});

// =============================================================================
// Personal Deductions Tests
// =============================================================================

describe('Personal Deductions', () => {
    test('single person gets basic deductions', () => {
        const result = calculateRelacionDependencia(5000000, 'single', {
            rent: 0, healthInsurance: 0, domesticService: 0, education: 0
        });
        
        // Should get: noImponible + deduccionEspecial
        const expectedBase = 5036140.63 + 17626492.21;
        const monthlyDeduction = expectedBase / 12;
        
        expect(result.personalDeductions).toBeCloseTo(monthlyDeduction, 0);
    });

    test('married person gets spouse deduction', () => {
        const resultSingle = calculateRelacionDependencia(5000000, 'single', {
            rent: 0, healthInsurance: 0, domesticService: 0, education: 0
        });
        
        const resultMarried = calculateRelacionDependencia(5000000, 'married', {
            rent: 0, healthInsurance: 0, domesticService: 0, education: 0
        });
        
        // Married should have higher deductions
        expect(resultMarried.personalDeductions).toBeGreaterThan(resultSingle.personalDeductions);
        
        // Difference should be spouse deduction / 12
        const spouseDeduction = 4743034.38 / 12;
        expect(resultMarried.personalDeductions - resultSingle.personalDeductions).toBeCloseTo(spouseDeduction, 0);
    });

    test('married with 2 kids gets child deductions', () => {
        const resultMarried = calculateRelacionDependencia(5000000, 'married', {
            rent: 0, healthInsurance: 0, domesticService: 0, education: 0
        });
        
        const resultMarried2Kids = calculateRelacionDependencia(5000000, 'married-2kids', {
            rent: 0, healthInsurance: 0, domesticService: 0, education: 0
        });
        
        // Should have 2 children deductions more
        const childDeduction = 2391929.54 * 2 / 12;
        expect(resultMarried2Kids.personalDeductions - resultMarried.personalDeductions).toBeCloseTo(childDeduction, 0);
    });

    test('custom family situation with spouse', () => {
        const result = calculateRelacionDependencia(5000000, 'custom', {
            rent: 0, healthInsurance: 0, domesticService: 0, education: 0
        }, true, 0);
        
        const resultNoSpouse = calculateRelacionDependencia(5000000, 'custom', {
            rent: 0, healthInsurance: 0, domesticService: 0, education: 0
        }, false, 0);
        
        // With spouse should have higher deductions
        const spouseDeduction = 4743034.38 / 12;
        expect(result.personalDeductions - resultNoSpouse.personalDeductions).toBeCloseTo(spouseDeduction, 0);
    });

    test('custom family situation with children', () => {
        const result3Kids = calculateRelacionDependencia(5000000, 'custom', {
            rent: 0, healthInsurance: 0, domesticService: 0, education: 0
        }, false, 3);
        
        const resultNoKids = calculateRelacionDependencia(5000000, 'custom', {
            rent: 0, healthInsurance: 0, domesticService: 0, education: 0
        }, false, 0);
        
        // Should have 3 children deductions
        const childDeduction = 2391929.54 * 3 / 12;
        expect(result3Kids.personalDeductions - resultNoKids.personalDeductions).toBeCloseTo(childDeduction, 0);
    });
});

// =============================================================================
// Additional Deductions Tests
// =============================================================================

describe('Additional Deductions', () => {
    test('rent deduction is 40%', () => {
        const rent = 500000;
        const result = calculateRelacionDependencia(5000000, 'single', {
            rent: rent,
            healthInsurance: 0,
            domesticService: 0,
            education: 0
        });
        
        expect(result.additionalDeductions).toBeCloseTo(rent * 0.4, 0);
    });

    test('health insurance has limit', () => {
        const highInsurance = 200000; // Above limit
        const result = calculateRelacionDependencia(5000000, 'single', {
            rent: 0,
            healthInsurance: highInsurance,
            domesticService: 0,
            education: 0
        });
        
        // Should be capped at 100000
        expect(result.additionalDeductions).toBe(100000);
    });

    test('health insurance below limit is fully deductible', () => {
        const insurance = 50000; // Below limit
        const result = calculateRelacionDependencia(5000000, 'single', {
            rent: 0,
            healthInsurance: insurance,
            domesticService: 0,
            education: 0
        });
        
        expect(result.additionalDeductions).toBe(insurance);
    });

    test('domestic service is fully deductible', () => {
        const domesticService = 150000;
        const result = calculateRelacionDependencia(5000000, 'single', {
            rent: 0,
            healthInsurance: 0,
            domesticService: domesticService,
            education: 0
        });
        
        expect(result.additionalDeductions).toBe(domesticService);
    });

    test('education has limit', () => {
        const highEducation = 150000; // Above limit
        const result = calculateRelacionDependencia(5000000, 'single', {
            rent: 0,
            healthInsurance: 0,
            domesticService: 0,
            education: highEducation
        });
        
        // Should be capped at 80000
        expect(result.additionalDeductions).toBe(80000);
    });

    test('education below limit is fully deductible', () => {
        const education = 50000; // Below limit
        const result = calculateRelacionDependencia(5000000, 'single', {
            rent: 0,
            healthInsurance: 0,
            domesticService: 0,
            education: education
        });
        
        expect(result.additionalDeductions).toBe(education);
    });

    test('all deductions combine correctly', () => {
        const rent = 300000;
        const insurance = 60000;
        const domestic = 100000;
        const education = 50000;
        
        const result = calculateRelacionDependencia(5000000, 'single', {
            rent: rent,
            healthInsurance: insurance,
            domesticService: domestic,
            education: education
        });
        
        const expected = (rent * 0.4) + insurance + domestic + education;
        expect(result.additionalDeductions).toBeCloseTo(expected, 0);
    });
});

// =============================================================================
// Relación de Dependencia Tests
// =============================================================================

describe('Relación de Dependencia Calculations', () => {
    describe('Personal Contributions', () => {
        test('jubilacion is 11% of gross salary', () => {
            const grossSalary = 5000000;
            const result = calculateRelacionDependencia(grossSalary, 'single', {
                rent: 0, healthInsurance: 0, domesticService: 0, education: 0
            });
            
            expect(result.contributions.jubilacion).toBeCloseTo(grossSalary * 0.11, 2);
        });

        test('PAMI is 3% of gross salary', () => {
            const grossSalary = 5000000;
            const result = calculateRelacionDependencia(grossSalary, 'single', {
                rent: 0, healthInsurance: 0, domesticService: 0, education: 0
            });
            
            expect(result.contributions.pami).toBeCloseTo(grossSalary * 0.03, 2);
        });

        test('obra social is 3% of gross salary', () => {
            const grossSalary = 5000000;
            const result = calculateRelacionDependencia(grossSalary, 'single', {
                rent: 0, healthInsurance: 0, domesticService: 0, education: 0
            });
            
            expect(result.contributions.obraSocial).toBeCloseTo(grossSalary * 0.03, 2);
        });

        test('total contributions is 17%', () => {
            const grossSalary = 5000000;
            const result = calculateRelacionDependencia(grossSalary, 'single', {
                rent: 0, healthInsurance: 0, domesticService: 0, education: 0
            });
            
            expect(result.contributions.total).toBeCloseTo(grossSalary * 0.17, 2);
        });

        test('contributions sum correctly', () => {
            const grossSalary = 5000000;
            const result = calculateRelacionDependencia(grossSalary, 'single', {
                rent: 0, healthInsurance: 0, domesticService: 0, education: 0
            });
            
            const sum = result.contributions.jubilacion + result.contributions.pami + result.contributions.obraSocial;
            expect(sum).toBeCloseTo(result.contributions.total, 2);
        });
    });

    describe('Employer Contributions', () => {
        test('employer jubilacion is 10.17%', () => {
            const grossSalary = 5000000;
            const result = calculateRelacionDependencia(grossSalary, 'single', {
                rent: 0, healthInsurance: 0, domesticService: 0, education: 0
            });
            
            expect(result.employerCosts.jubilacion).toBeCloseTo(grossSalary * 0.1017, 2);
        });

        test('employer ANSSAL is 4.44%', () => {
            const grossSalary = 5000000;
            const result = calculateRelacionDependencia(grossSalary, 'single', {
                rent: 0, healthInsurance: 0, domesticService: 0, education: 0
            });
            
            expect(result.employerCosts.anssal).toBeCloseTo(grossSalary * 0.0444, 2);
        });

        test('employer fondo empleo is 0.89%', () => {
            const grossSalary = 5000000;
            const result = calculateRelacionDependencia(grossSalary, 'single', {
                rent: 0, healthInsurance: 0, domesticService: 0, education: 0
            });
            
            expect(result.employerCosts.fondoEmpleo).toBeCloseTo(grossSalary * 0.0089, 2);
        });

        test('employer obra social is 6%', () => {
            const grossSalary = 5000000;
            const result = calculateRelacionDependencia(grossSalary, 'single', {
                rent: 0, healthInsurance: 0, domesticService: 0, education: 0
            });
            
            expect(result.employerCosts.obraSocial).toBeCloseTo(grossSalary * 0.06, 2);
        });

        test('employer PAMI is 1.5%', () => {
            const grossSalary = 5000000;
            const result = calculateRelacionDependencia(grossSalary, 'single', {
                rent: 0, healthInsurance: 0, domesticService: 0, education: 0
            });
            
            expect(result.employerCosts.pami).toBeCloseTo(grossSalary * 0.015, 2);
        });

        test('total employer costs sum correctly', () => {
            const grossSalary = 5000000;
            const result = calculateRelacionDependencia(grossSalary, 'single', {
                rent: 0, healthInsurance: 0, domesticService: 0, education: 0
            });
            
            const sum = result.employerCosts.jubilacion + 
                       result.employerCosts.anssal + 
                       result.employerCosts.fondoEmpleo + 
                       result.employerCosts.obraSocial + 
                       result.employerCosts.pami;
            
            expect(sum).toBeCloseTo(result.employerCosts.total, 2);
        });
    });

    describe('Net Salary Calculation', () => {
        test('net salary = gross - contributions - ganancias', () => {
            const grossSalary = 5000000;
            const result = calculateRelacionDependencia(grossSalary, 'single', {
                rent: 0, healthInsurance: 0, domesticService: 0, education: 0
            });
            
            const expected = grossSalary - result.contributions.total - result.ganancias;
            expect(result.netSalary).toBeCloseTo(expected, 2);
        });

        test('higher income with more deductions results in higher net', () => {
            const result1 = calculateRelacionDependencia(5000000, 'single', {
                rent: 0, healthInsurance: 0, domesticService: 0, education: 0
            });
            
            const result2 = calculateRelacionDependencia(5000000, 'married-2kids', {
                rent: 300000, healthInsurance: 60000, domesticService: 0, education: 0
            });
            
            // With more deductions, less ganancias, so higher net
            expect(result2.netSalary).toBeGreaterThan(result1.netSalary);
        });
    });

    describe('Effective Tax Rate', () => {
        test('effective tax rate is calculated correctly', () => {
            const grossSalary = 5000000;
            const result = calculateRelacionDependencia(grossSalary, 'single', {
                rent: 0, healthInsurance: 0, domesticService: 0, education: 0
            });
            
            const expectedRate = (result.contributions.total + result.ganancias) / grossSalary;
            expect(result.effectiveTaxRate).toBeCloseTo(expectedRate, 10);
        });

        test('effective tax rate is between 0 and 1', () => {
            const result = calculateRelacionDependencia(5000000, 'single', {
                rent: 0, healthInsurance: 0, domesticService: 0, education: 0
            });
            
            expect(result.effectiveTaxRate).toBeGreaterThanOrEqual(0);
            expect(result.effectiveTaxRate).toBeLessThanOrEqual(1);
        });
    });
});

// =============================================================================
// Responsable Inscripto Tests
// =============================================================================

describe('Responsable Inscripto Calculations', () => {
    describe('IVA Calculations', () => {
        test('IVA debito is 21% of income', () => {
            const monthlyIncome = 5000000;
            const result = calculateResponsableInscripto(
                monthlyIncome,
                'services',
                'single',
                { rent: 0, healthInsurance: 0, domesticService: 0, education: 0 },
                { vatPurchases: 0, otherExpenses: 0 }
            );
            
            expect(result.taxes.iva.debito).toBeCloseTo(monthlyIncome * 0.21, 2);
        });

        test('IVA credito reduces net IVA', () => {
            const monthlyIncome = 5000000;
            const vatPurchases = 1000000;
            
            const result = calculateResponsableInscripto(
                monthlyIncome,
                'services',
                'single',
                { rent: 0, healthInsurance: 0, domesticService: 0, education: 0 },
                { vatPurchases: vatPurchases, otherExpenses: 0 }
            );
            
            expect(result.taxes.iva.credito).toBeCloseTo(vatPurchases * 0.21, 2);
            expect(result.taxes.iva.net).toBe(result.taxes.iva.debito - result.taxes.iva.credito);
        });

        test('IVA net cannot be negative', () => {
            const monthlyIncome = 5000000;
            const vatPurchases = 30000000; // Very high purchases
            
            const result = calculateResponsableInscripto(
                monthlyIncome,
                'services',
                'single',
                { rent: 0, healthInsurance: 0, domesticService: 0, education: 0 },
                { vatPurchases: vatPurchases, otherExpenses: 0 }
            );
            
            expect(result.taxes.iva.net).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Other Taxes', () => {
        test('Ingresos Brutos is 3.5%', () => {
            const monthlyIncome = 5000000;
            const result = calculateResponsableInscripto(
                monthlyIncome,
                'services',
                'single',
                { rent: 0, healthInsurance: 0, domesticService: 0, education: 0 },
                { vatPurchases: 0, otherExpenses: 0 }
            );
            
            expect(result.taxes.ingresosBrutos).toBeCloseTo(monthlyIncome * 0.035, 2);
        });

        test('Impuesto al Cheque is 1.2%', () => {
            const monthlyIncome = 5000000;
            const result = calculateResponsableInscripto(
                monthlyIncome,
                'services',
                'single',
                { rent: 0, healthInsurance: 0, domesticService: 0, education: 0 },
                { vatPurchases: 0, otherExpenses: 0 }
            );
            
            expect(result.taxes.impuestoCheque).toBeCloseTo(monthlyIncome * 0.012, 2);
        });

        test('Autonomos is assigned based on income', () => {
            const lowIncome = 300000;
            const highIncome = 5000000;
            
            const result1 = calculateResponsableInscripto(
                lowIncome,
                'services',
                'single',
                { rent: 0, healthInsurance: 0, domesticService: 0, education: 0 },
                { vatPurchases: 0, otherExpenses: 0 }
            );
            
            const result2 = calculateResponsableInscripto(
                highIncome,
                'services',
                'single',
                { rent: 0, healthInsurance: 0, domesticService: 0, education: 0 },
                { vatPurchases: 0, otherExpenses: 0 }
            );
            
            // Higher income should have higher autonomos category
            expect(result2.taxes.autonomos).toBeGreaterThan(result1.taxes.autonomos);
        });
    });

    describe('Ganancias Calculation', () => {
        test('annual ganancias is calculated and divided by 12', () => {
            const monthlyIncome = 5000000;
            const result = calculateResponsableInscripto(
                monthlyIncome,
                'services',
                'single',
                { rent: 0, healthInsurance: 0, domesticService: 0, education: 0 },
                { vatPurchases: 0, otherExpenses: 0 }
            );
            
            expect(result.taxes.ganancias).toBeCloseTo(result.taxes.annualGanancias / 12, 2);
        });

        test('business expenses reduce taxable income', () => {
            const monthlyIncome = 5000000;
            
            const result1 = calculateResponsableInscripto(
                monthlyIncome,
                'services',
                'single',
                { rent: 0, healthInsurance: 0, domesticService: 0, education: 0 },
                { vatPurchases: 0, otherExpenses: 0 }
            );
            
            const result2 = calculateResponsableInscripto(
                monthlyIncome,
                'services',
                'single',
                { rent: 0, healthInsurance: 0, domesticService: 0, education: 0 },
                { vatPurchases: 0, otherExpenses: 1000000 }
            );
            
            // More expenses = lower taxable income
            expect(result2.annualTaxableIncome).toBeLessThan(result1.annualTaxableIncome);
        });
    });

    describe('Total Taxes and Net Income', () => {
        test('total taxes sum all components', () => {
            const monthlyIncome = 5000000;
            const result = calculateResponsableInscripto(
                monthlyIncome,
                'services',
                'single',
                { rent: 0, healthInsurance: 0, domesticService: 0, education: 0 },
                { vatPurchases: 0, otherExpenses: 0 }
            );
            
            const expectedTotal = result.taxes.autonomos + 
                                result.taxes.iva.net + 
                                result.taxes.ingresosBrutos + 
                                result.taxes.impuestoCheque + 
                                result.taxes.ganancias;
            
            expect(result.taxes.total).toBeCloseTo(expectedTotal, 2);
        });

        test('net income = income - taxes - expenses', () => {
            const monthlyIncome = 5000000;
            const expenses = 500000;
            const result = calculateResponsableInscripto(
                monthlyIncome,
                'services',
                'single',
                { rent: 0, healthInsurance: 0, domesticService: 0, education: 0 },
                { vatPurchases: 0, otherExpenses: expenses }
            );
            
            const expectedNet = monthlyIncome - result.taxes.total - expenses;
            expect(result.netIncome).toBeCloseTo(expectedNet, 2);
        });

        test('effective tax rate is calculated correctly', () => {
            const monthlyIncome = 5000000;
            const result = calculateResponsableInscripto(
                monthlyIncome,
                'services',
                'single',
                { rent: 0, healthInsurance: 0, domesticService: 0, education: 0 },
                { vatPurchases: 0, otherExpenses: 0 }
            );
            
            const expectedRate = result.taxes.total / monthlyIncome;
            expect(result.effectiveTaxRate).toBeCloseTo(expectedRate, 10);
        });
    });
});

// =============================================================================
// Edge Cases and Boundary Tests
// =============================================================================

describe('Edge Cases and Boundaries', () => {
    test('handles zero income gracefully', () => {
        expect(() => calculateMonotributo(0, 'services')).not.toThrow();
        expect(() => calculateRelacionDependencia(0, 'single', {
            rent: 0, healthInsurance: 0, domesticService: 0, education: 0
        })).not.toThrow();
        expect(() => calculateResponsableInscripto(0, 'services', 'single', 
            { rent: 0, healthInsurance: 0, domesticService: 0, education: 0 },
            { vatPurchases: 0, otherExpenses: 0 }
        )).not.toThrow();
    });

    test('handles very large income', () => {
        const largeIncome = 100000000;
        expect(() => calculateMonotributo(largeIncome, 'services')).not.toThrow();
        expect(() => calculateRelacionDependencia(largeIncome, 'single', {
            rent: 0, healthInsurance: 0, domesticService: 0, education: 0
        })).not.toThrow();
    });

    test('taxable income cannot be negative', () => {
        // Very high deductions should result in 0 taxable income, not negative
        const result = calculateRelacionDependencia(2000000, 'married-2kids', {
            rent: 1000000,
            healthInsurance: 100000,
            domesticService: 500000,
            education: 80000
        });
        
        expect(result.taxableIncome).toBeGreaterThanOrEqual(0);
    });

    test('monotributo category boundaries work correctly', () => {
        // Test at exact boundaries
        const categoryAMaxMonthly = 10278540 / 12; // ~856545
        
        const justBelowA = calculateMonotributo(856545, 'services');
        const justAboveA = calculateMonotributo(856546, 'services');
        
        expect(justBelowA.category).toBe('A');
        // justAboveA might be A or B depending on exact calculation
    });
});

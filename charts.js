/**
 * Charts and Visualizations using Chart.js
 * Enhanced graphics with dynamic, interactive charts
 */

// Chart instances for cleanup
let chartInstances = {};

// Default business expenses for projection/scenario charts
const DEFAULT_BUSINESS_EXPENSES = { vatPurchases: 0, otherExpenses: 0 };

// Chart styling constants
const TREEMAP_LABEL_FONT_SIZE = 14;

/**
 * Destroy all existing charts
 */
function destroyAllCharts() {
    Object.keys(chartInstances).forEach(key => {
        if (chartInstances[key]) {
            chartInstances[key].destroy();
            chartInstances[key] = null;
        }
    });
}

/**
 * Common chart configuration
 */
const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
        legend: {
            position: 'top',
            labels: {
                font: {
                    size: 14,
                    family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                },
                padding: 15,
                usePointStyle: true
            }
        },
        tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
                size: 14,
                weight: 'bold'
            },
            bodyFont: {
                size: 13
            },
            callbacks: {
                label: function(context) {
                    let label = context.dataset.label || '';
                    if (label) {
                        label += ': ';
                    }
                    if (context.parsed.y !== null) {
                        label += new Intl.NumberFormat('es-AR', {
                            style: 'currency',
                            currency: 'ARS',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                        }).format(context.parsed.y);
                    }
                    return label;
                }
            }
        }
    }
};

/**
 * Draw enhanced bar chart comparing net income and taxes
 */
function drawBarChart(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart
    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }
    
    chartInstances[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Relación de Dependencia', 'Monotributo', 'Responsable Inscripto'],
            datasets: [
                {
                    label: 'Ingreso Neto',
                    data: [
                        data.relacion?.netSalary || 0,
                        data.monotributo?.netIncome || 0,
                        data.responsable?.netIncome || 0
                    ],
                    backgroundColor: 'rgba(40, 167, 69, 0.8)',
                    borderColor: 'rgb(40, 167, 69)',
                    borderWidth: 2
                },
                {
                    label: 'Impuestos y Aportes',
                    data: [
                        ((data.relacion?.contributions?.total || 0) + (data.relacion?.ganancias || 0)),
                        data.monotributo?.monthlyFee || 0,
                        data.responsable?.taxes?.total || 0
                    ],
                    backgroundColor: 'rgba(220, 53, 69, 0.8)',
                    borderColor: 'rgb(220, 53, 69)',
                    borderWidth: 2
                }
            ]
        },
        options: {
            ...commonChartOptions,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return new Intl.NumberFormat('es-AR', {
                                style: 'currency',
                                currency: 'ARS',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                            }).format(value);
                        },
                        font: {
                            size: 12
                        }
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

/**
 * Draw line chart showing projection with different incomes
 */
function drawLineChart(canvasId, currentIncome, familySituation, activityType, deductions) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart
    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }
    
    // Generate income range (from 50% to 300% of current income)
    const incomes = [];
    const step = Math.max(100000, Math.floor(currentIncome / 10));
    const minIncome = Math.max(500000, Math.floor(currentIncome * 0.5));
    const maxIncome = Math.floor(currentIncome * 3);
    
    for (let income = minIncome; income <= maxIncome; income += step) {
        incomes.push(income);
    }
    
    // Calculate net income for each regime at different income levels
    const relacionData = [];
    const monotributoData = [];
    const responsableData = [];
    
    incomes.forEach(income => {
        try {
            const relacion = calculateRelacionDependencia(income, familySituation, deductions);
            const monotributo = calculateMonotributo(income, activityType);
            const responsable = calculateResponsableInscripto(income, activityType, familySituation, deductions, DEFAULT_BUSINESS_EXPENSES);
            
            relacionData.push(relacion.netSalary);
            monotributoData.push(monotributo.netIncome);
            responsableData.push(responsable.netIncome);
        } catch (e) {
            relacionData.push(0);
            monotributoData.push(0);
            responsableData.push(0);
        }
    });
    
    chartInstances[canvasId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: incomes.map(i => new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: 'ARS',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
                notation: 'compact',
                compactDisplay: 'short'
            }).format(i)),
            datasets: [
                {
                    label: 'Relación de Dependencia',
                    data: relacionData,
                    borderColor: 'rgb(0, 102, 204)',
                    backgroundColor: 'rgba(0, 102, 204, 0.1)',
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: 'Monotributo',
                    data: monotributoData,
                    borderColor: 'rgb(40, 167, 69)',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: 'Responsable Inscripto',
                    data: responsableData,
                    borderColor: 'rgb(102, 16, 242)',
                    backgroundColor: 'rgba(102, 16, 242, 0.1)',
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            ...commonChartOptions,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Ingreso Neto Mensual',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        callback: function(value) {
                            return new Intl.NumberFormat('es-AR', {
                                style: 'currency',
                                currency: 'ARS',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                                notation: 'compact',
                                compactDisplay: 'short'
                            }).format(value);
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Ingreso Bruto Mensual',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
}

/**
 * Draw treemap chart for tax distribution
 */
function drawPieChart(canvasId, data, regime) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart
    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }
    
    let labels = [];
    let labelsFull = []; // Full labels for tooltips
    let values = [];
    let colors = [];
    
    if (regime === 'relacion' && data) {
        labels = ['J', 'P', 'OS', 'G'];
        labelsFull = ['Jubilación (11%)', 'PAMI (3%)', 'Obra Social (3%)', 'Ganancias'];
        values = [
            data.contributions.jubilacion,
            data.contributions.pami,
            data.contributions.obraSocial,
            data.ganancias
        ];
        colors = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#A8E6CF'];
    } else if (regime === 'monotributo' && data) {
        labels = ['I', 'S', 'OS'];
        labelsFull = ['Impuesto Integrado', 'SIPA (Jubilación)', 'Obra Social'];
        values = [
            data.breakdown.impuesto,
            data.breakdown.sipa,
            data.breakdown.obraSocial
        ];
        colors = ['#28A745', '#17A2B8', '#FFC107'];
    } else if (regime === 'responsable' && data) {
        labels = ['A', 'IVA', 'G', 'IB', 'IC'];
        labelsFull = ['Autónomos', 'IVA Neto', 'Ganancias', 'Ingresos Brutos', 'Imp. Cheque'];
        values = [
            data.taxes.autonomos,
            data.taxes.iva.net,
            data.taxes.ganancias,
            data.taxes.ingresosBrutos,
            data.taxes.impuestoCheque
        ];
        colors = ['#6610F2', '#FF6B6B', '#FFD93D', '#FF8C42', '#A8E6CF'];
    }
    
    // Filter out zero values and prepare treemap data
    const filteredData = labels.map((label, index) => ({
        label,
        labelFull: labelsFull[index],
        value: values[index],
        color: colors[index]
    })).filter(item => item.value > 0);
    
    if (filteredData.length === 0) {
        return;
    }
    
    // Calculate total for percentages
    const total = filteredData.reduce((sum, item) => sum + item.value, 0);
    
    // Prepare treemap dataset
    const treemapData = filteredData.map((item, index) => ({
        value: item.value,
        label: item.label,
        labelFull: item.labelFull,
        color: item.color,
        percentage: ((item.value / total) * 100).toFixed(1)
    }));
    
    chartInstances[canvasId] = new Chart(ctx, {
        type: 'treemap',
        data: {
            datasets: [{
                tree: treemapData,
                key: 'value',
                groups: ['label'],
                spacing: 1,
                borderWidth: 2,
                borderColor: '#fff',
                backgroundColor: (ctx) => {
                    if (ctx.type !== 'data') return 'transparent';
                    const item = treemapData[ctx.dataIndex];
                    return item ? item.color : '#ccc';
                },
                labels: {
                    display: true,
                    formatter: (ctx) => {
                        if (ctx.type !== 'data') return '';
                        const item = treemapData[ctx.dataIndex];
                        if (!item) return '';
                        return [item.label, `${item.percentage}%`];
                    },
                    color: '#fff',
                    font: {
                        size: TREEMAP_LABEL_FONT_SIZE,
                        weight: 'bold'
                    },
                    position: 'top'
                }
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        title: function(context) {
                            const item = treemapData[context[0].dataIndex];
                            return item ? item.labelFull : '';
                        },
                        label: function(context) {
                            const item = treemapData[context.dataIndex];
                            if (!item) return '';
                            
                            const formattedValue = new Intl.NumberFormat('es-AR', {
                                style: 'currency',
                                currency: 'ARS',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                            }).format(item.value);
                            
                            return `${formattedValue} (${item.percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Draw scenarios comparison chart
 */
function drawScenariosChart(canvasId, familySituation, activityType, deductions) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart
    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }
    
    // Define salary scenarios
    const scenarios = [
        { name: 'Bajo', income: 800000 },
        { name: 'Medio-Bajo', income: 1500000 },
        { name: 'Medio', income: 2500000 },
        { name: 'Medio-Alto', income: 4000000 },
        { name: 'Alto', income: 6000000 },
        { name: 'Muy Alto', income: 10000000 }
    ];
    
    const relacionData = [];
    const monotributoData = [];
    const responsableData = [];
    
    scenarios.forEach(scenario => {
        try {
            const relacion = calculateRelacionDependencia(scenario.income, familySituation, deductions);
            const monotributo = calculateMonotributo(scenario.income, activityType);
            const responsable = calculateResponsableInscripto(scenario.income, activityType, familySituation, deductions, DEFAULT_BUSINESS_EXPENSES);
            
            relacionData.push(relacion.netSalary);
            monotributoData.push(monotributo.netIncome);
            responsableData.push(responsable.netIncome);
        } catch (e) {
            relacionData.push(0);
            monotributoData.push(0);
            responsableData.push(0);
        }
    });
    
    chartInstances[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: scenarios.map(s => s.name),
            datasets: [
                {
                    label: 'Relación de Dependencia',
                    data: relacionData,
                    backgroundColor: 'rgba(0, 102, 204, 0.7)',
                    borderColor: 'rgb(0, 102, 204)',
                    borderWidth: 2
                },
                {
                    label: 'Monotributo',
                    data: monotributoData,
                    backgroundColor: 'rgba(40, 167, 69, 0.7)',
                    borderColor: 'rgb(40, 167, 69)',
                    borderWidth: 2
                },
                {
                    label: 'Responsable Inscripto',
                    data: responsableData,
                    backgroundColor: 'rgba(102, 16, 242, 0.7)',
                    borderColor: 'rgb(102, 16, 242)',
                    borderWidth: 2
                }
            ]
        },
        options: {
            ...commonChartOptions,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Ingreso Neto Mensual',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        callback: function(value) {
                            return new Intl.NumberFormat('es-AR', {
                                style: 'currency',
                                currency: 'ARS',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                                notation: 'compact'
                            }).format(value);
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Escenario de Ingreso',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                }
            }
        }
    });
    
    // Create scenarios summary
    createScenariosSummary(scenarios, familySituation, activityType, deductions);
}

/**
 * Create scenarios summary cards
 */
function createScenariosSummary(scenarios, familySituation, activityType, deductions) {
    const container = document.getElementById('scenarios-summary');
    if (!container) return;
    
    container.innerHTML = '';
    
    scenarios.forEach((scenario, index) => {
        try {
            const relacion = calculateRelacionDependencia(scenario.income, familySituation, deductions);
            const monotributo = calculateMonotributo(scenario.income, activityType);
            const responsable = calculateResponsableInscripto(scenario.income, activityType, familySituation, deductions, DEFAULT_BUSINESS_EXPENSES);
            
            const results = [
                { name: 'Relación de Dependencia', net: relacion.netSalary },
                { name: 'Monotributo', net: monotributo.netIncome },
                { name: 'Responsable Inscripto', net: responsable.netIncome }
            ];
            
            const best = results.reduce((prev, current) => 
                (current.net > prev.net) ? current : prev
            );
            
            const card = document.createElement('div');
            card.className = `scenario-card ${['low', 'medium', 'medium', 'high', 'high', 'very-high'][index]}`;
            card.innerHTML = `
                <h4>${scenario.name}</h4>
                <div class="scenario-income">Ingreso bruto: ${formatCurrency(scenario.income)}</div>
                <div class="scenario-best">✅ Mejor opción: ${best.name}</div>
                <div class="scenario-detail">Ingreso neto: ${formatCurrency(best.net)}</div>
            `;
            
            container.appendChild(card);
        } catch (e) {
            // Skip if calculation fails
        }
    });
}

/**
 * Create all charts
 */
function createAllCharts(results, currentIncome, familySituation, activityType, deductions) {
    // Destroy all existing charts first
    destroyAllCharts();
    
    // Bar chart
    const barData = {
        relacion: {
            grossIncome: results.relacion.grossSalary,
            netIncome: results.relacion.netSalary,
            netSalary: results.relacion.netSalary,
            contributions: results.relacion.contributions,
            ganancias: results.relacion.ganancias
        },
        monotributo: {
            grossIncome: results.income,  // Use original income, not calculated sum
            netIncome: results.monotributo.netIncome,
            monthlyFee: results.monotributo.monthlyFee
        },
        responsable: {
            grossIncome: results.responsable.monthlyIncome,
            netIncome: results.responsable.netIncome,
            taxes: results.responsable.taxes
        }
    };
    drawBarChart('bar-chart', barData);
    
    // Line chart
    drawLineChart('line-chart', currentIncome, familySituation, activityType, deductions);
    
    // Pie charts
    drawPieChart('pie-chart-relacion', results.relacion, 'relacion');
    drawPieChart('pie-chart-monotributo', results.monotributo, 'monotributo');
    drawPieChart('pie-chart-responsable', results.responsable, 'responsable');
    
    // Scenarios chart
    drawScenariosChart('scenarios-chart', familySituation, activityType, deductions);
}

/**
 * Helper function to format currency
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createAllCharts,
        drawBarChart,
        drawLineChart,
        drawPieChart,
        drawScenariosChart,
        destroyAllCharts
    };
}

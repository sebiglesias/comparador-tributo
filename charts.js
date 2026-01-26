/**
 * Charts and Visualizations
 * Simple canvas-based charts (no external dependencies)
 */

/**
 * Draw a bar chart comparing net income and taxes
 */
function drawBarChart(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.parentElement.clientWidth;
    const height = 300;
    canvas.width = width;
    canvas.height = height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Chart dimensions
    const padding = 40;
    const chartWidth = width - (padding * 2);
    const chartHeight = height - (padding * 2);
    
    // Find max value for scaling
    const maxValue = Math.max(
        data.relacion.gross || 0,
        data.monotributo.gross || 0,
        data.responsable.gross || 0
    );
    
    // Bar width
    const barWidth = chartWidth / 9; // 3 regimes × 2 bars + spacing
    const groupSpacing = barWidth * 0.5;
    
    // Colors
    const colors = {
        relacion: { net: '#0066CC', tax: '#FF6B6B' },
        monotributo: { net: '#28A745', tax: '#FF8C42' },
        responsable: { net: '#6610F2', tax: '#FFD93D' }
    };
    
    // Draw axes
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    // Draw bars for each regime
    const regimes = [
        { name: 'Rel. Dep.', data: data.relacion, color: colors.relacion, x: padding + groupSpacing },
        { name: 'Monotributo', data: data.monotributo, color: colors.monotributo, x: padding + groupSpacing + (barWidth * 2.5) + groupSpacing },
        { name: 'Resp. Insc.', data: data.responsable, color: colors.responsable, x: padding + groupSpacing + (barWidth * 5) + (groupSpacing * 2) }
    ];
    
    regimes.forEach(regime => {
        const netHeight = (regime.data.net / maxValue) * chartHeight;
        const taxHeight = (regime.data.tax / maxValue) * chartHeight;
        
        // Draw tax bar (stacked on top)
        ctx.fillStyle = regime.color.tax;
        ctx.fillRect(
            regime.x,
            height - padding - netHeight - taxHeight,
            barWidth,
            taxHeight
        );
        
        // Draw net income bar
        ctx.fillStyle = regime.color.net;
        ctx.fillRect(
            regime.x,
            height - padding - netHeight,
            barWidth,
            netHeight
        );
        
        // Draw label
        ctx.fillStyle = '#333';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(regime.name, regime.x + barWidth / 2, height - padding + 20);
    });
    
    // Draw legend
    const legendY = padding;
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    
    // Net income legend
    ctx.fillStyle = '#28A745';
    ctx.fillRect(width - padding - 120, legendY, 15, 15);
    ctx.fillStyle = '#333';
    ctx.fillText('Ingreso Neto', width - padding - 100, legendY + 12);
    
    // Taxes legend
    ctx.fillStyle = '#FF6B6B';
    ctx.fillRect(width - padding - 120, legendY + 25, 15, 15);
    ctx.fillStyle = '#333';
    ctx.fillText('Impuestos', width - padding - 100, legendY + 37);
}

/**
 * Draw a pie chart for tax distribution
 */
function drawPieChart(containerId, label, data, colors) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Create canvas for this pie chart
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    canvas.className = 'pie-chart';
    
    const wrapper = document.createElement('div');
    wrapper.style.textAlign = 'center';
    wrapper.style.marginBottom = '20px';
    
    const labelElem = document.createElement('div');
    labelElem.textContent = label;
    labelElem.style.fontWeight = 'bold';
    labelElem.style.marginBottom = '10px';
    
    wrapper.appendChild(labelElem);
    wrapper.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    const centerX = 100;
    const centerY = 100;
    const radius = 80;
    
    // Calculate total
    const total = Object.values(data).reduce((sum, val) => sum + val, 0);
    
    if (total === 0) {
        ctx.fillStyle = '#E0E0E0';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#999';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Sin datos', centerX, centerY);
        
        container.appendChild(wrapper);
        return;
    }
    
    // Draw pie slices
    let currentAngle = -Math.PI / 2; // Start at top
    
    Object.entries(data).forEach(([key, value], index) => {
        const sliceAngle = (value / total) * 2 * Math.PI;
        
        ctx.fillStyle = colors[index % colors.length];
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fill();
        
        // Draw border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        currentAngle += sliceAngle;
    });
    
    // Add legend below chart
    const legend = document.createElement('div');
    legend.style.fontSize = '11px';
    legend.style.marginTop = '10px';
    
    Object.entries(data).forEach(([key, value], index) => {
        const percentage = (value / total * 100).toFixed(1);
        const item = document.createElement('div');
        item.style.marginBottom = '4px';
        
        const colorBox = document.createElement('span');
        colorBox.style.display = 'inline-block';
        colorBox.style.width = '12px';
        colorBox.style.height = '12px';
        colorBox.style.backgroundColor = colors[index % colors.length];
        colorBox.style.marginRight = '6px';
        colorBox.style.verticalAlign = 'middle';
        
        item.appendChild(colorBox);
        item.appendChild(document.createTextNode(`${key}: ${percentage}%`));
        legend.appendChild(item);
    });
    
    wrapper.appendChild(legend);
    container.appendChild(wrapper);
}

/**
 * Create all pie charts for tax distribution
 */
function createPieCharts(results) {
    const container = document.getElementById('pie-charts-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    const pieColors = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#A8E6CF', '#FF8C42'];
    
    // Relación de Dependencia pie chart
    if (results.relacion) {
        const relData = {
            'Jubilación': results.relacion.contributions.jubilacion,
            'PAMI': results.relacion.contributions.pami,
            'Obra Social': results.relacion.contributions.obraSocial,
            'Ganancias': results.relacion.ganancias
        };
        drawPieChart('pie-charts-container', 'Rel. Dependencia', relData, pieColors);
    }
    
    // Monotributo pie chart
    if (results.monotributo) {
        const monoData = {
            'Impuesto': results.monotributo.breakdown.impuesto,
            'SIPA': results.monotributo.breakdown.sipa,
            'Obra Social': results.monotributo.breakdown.obraSocial
        };
        drawPieChart('pie-charts-container', 'Monotributo', monoData, pieColors);
    }
    
    // Responsable Inscripto pie chart
    if (results.responsable) {
        const respData = {
            'Autónomos': results.responsable.taxes.autonomos,
            'IVA Neto': results.responsable.taxes.iva.net,
            'Ganancias': results.responsable.taxes.ganancias,
            'Ing. Brutos': results.responsable.taxes.ingresosBrutos,
            'Imp. Cheque': results.responsable.taxes.impuestoCheque
        };
        drawPieChart('pie-charts-container', 'Resp. Inscripto', respData, pieColors);
    }
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        drawBarChart,
        drawPieChart,
        createPieCharts
    };
}

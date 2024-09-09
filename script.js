document.getElementById('stockForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const ticker = document.getElementById('ticker').value;
    const response = await fetch(`/api/stock_data?ticker=${ticker}`);
    const data = await response.json();
    
    if (data.error) {
        alert(data.error);
        return;
    }

    displayHistoricalData(data);
    calculateMovingAverages(data);
    plotCharts(data);
});

function displayHistoricalData(data) {
    const tableBody = document.getElementById('priceTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    data.prices.forEach(row => {
        const tr = document.createElement('tr');
        const tdDate = document.createElement('td');
        const tdClose = document.createElement('td');
        
        tdDate.textContent = row.date;
        tdClose.textContent = row.close;
        
        tr.appendChild(tdDate);
        tr.appendChild(tdClose);
        tableBody.appendChild(tr);
    });
}

function calculateMovingAverages(data) {
    const prices = data.prices.map(item => parseFloat(item.close));
    
    const movingAverage = (period) => {
        const averages = [];
        for (let i = period - 1; i < prices.length; i++) {
            const avg = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b) / period;
            averages.push(avg);
        }
        return averages;
    };

    const ma50 = movingAverage(50);
    const ma100 = movingAverage(100);
    
    const movingAveragesEl = document.getElementById('movingAverages');
    movingAveragesEl.innerHTML = `
        50-Day Moving Average: ${ma50.length ? ma50[ma50.length - 1].toFixed(2) : 'N/A'}<br>
        100-Day Moving Average: ${ma100.length ? ma100[ma100.length - 1].toFixed(2) : 'N/A'}
    `;
}

function plotCharts(data) {
    const dates = data.prices.map(item => item.date);
    const prices = data.prices.map(item => parseFloat(item.close));
    const ma50 = calculateMovingAverage(prices, 50);
    const ma100 = calculateMovingAverage(prices, 100);

    // Chart for Historical Prices and Moving Averages
    const ctx1 = document.getElementById('priceChart').getContext('2d');
    new Chart(ctx1, {
        type: 'line',
        data: {
            labels: dates.slice(-prices.length),
            datasets: [
                {
                    label: 'Close Price',
                    data: prices,
                    borderColor: 'blue',
                    backgroundColor: 'rgba(0, 0, 255, 0.1)',
                    fill: true
                },
                {
                    label: '50-Day Moving Average',
                    data: ma50,
                    borderColor: 'orange',
                    backgroundColor: 'rgba(255, 165, 0, 0.1)',
                    fill: true
                },
                {
                    label: '100-Day Moving Average',
                    data: ma100,
                    borderColor: 'green',
                    backgroundColor: 'rgba(0, 128, 0, 0.1)',
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day'
                    }
                },
                y: {
                    beginAtZero: false
                }
            }
        }
    });

    // Chart for Difference Between Predicted and Actual Values
    const predictedPrices = data.prices.map(item => parseFloat(item.predicted || item.close)); // Replace `item.predicted` with your actual predicted values
    const difference = predictedPrices.map((predicted, index) => predicted - prices[index]);

    const ctx2 = document.getElementById('differenceChart').getContext('2d');
    new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: dates.slice(-difference.length),
            datasets: [
                {
                    label: 'Difference (Predicted - Actual)',
                    data: difference,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day'
                    }
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function calculateMovingAverage(prices, period) {
    const averages = [];
    for (let i = period - 1; i < prices.length; i++) {
        const avg = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b) / period;
        averages.push(avg);
    }
    return averages;
}

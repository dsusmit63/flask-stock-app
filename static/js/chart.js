let chart;
let currentSymbol = null;
let refreshInterval = null;


/* =========================
   LOAD STOCK DATA
========================= */
async function loadStock() {

    const symbol = document.getElementById("symbol").value.trim().toUpperCase();

    if (!symbol) {
        alert("Please enter a stock symbol");
        return;
    }

    currentSymbol = symbol;

    await fetchStock(symbol);

    startAutoRefresh();
}


/* =========================
   FETCH STOCK DATA
========================= */
async function fetchStock(symbol) {

    try {

        const res = await fetch("/stock", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ symbol: symbol })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error || "Stock not found");
            return;
        }

        updateDashboard(data);

    } catch (err) {

        console.error("Fetch error:", err);
        alert("Server error. Check logs.");

    }
}


/* =========================
   UPDATE UI DASHBOARD
========================= */
function updateDashboard(data) {

    document.getElementById("stockCard").classList.remove("hidden");

    document.getElementById("price").innerText = "$" + data.price;
    document.getElementById("open").innerText = "$" + data.open;
    document.getElementById("high").innerText = "$" + data.high;
    document.getElementById("low").innerText = "$" + data.low;
    document.getElementById("volume").innerText = data.volume;

    const ctx = document.getElementById("chart");

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {

        type: "line",

        data: {
            labels: data.dates,
            datasets: [{
                label: data.symbol + " Price",
                data: data.prices,
                borderColor: "#3b82f6",
                backgroundColor: "rgba(59,130,246,0.15)",
                fill: true,
                tension: 0.4
            }]
        },

        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }

    });
}


/* =========================
   AUTO REFRESH
========================= */
function startAutoRefresh() {

    if (refreshInterval) {
        clearInterval(refreshInterval);
    }

    refreshInterval = setInterval(() => {

        if (currentSymbol) {
            fetchStock(currentSymbol);
        }

    }, 10000); // 10 seconds
}


/* =========================
   ENTER KEY SEARCH
========================= */
document.getElementById("symbol").addEventListener("keypress", function (e) {

    if (e.key === "Enter") {
        loadStock();
    }

});


/* =========================
   TOP GAINERS PANEL
========================= */

const topGainers = [
    {symbol: "NVDA", change: "+5.12%"},
    {symbol: "TSLA", change: "+4.01%"},
    {symbol: "AMD", change: "+3.45%"},
    {symbol: "META", change: "+2.98%"},
    {symbol: "AAPL", change: "+2.12%"}
];

function renderTopGainers() {

    const container = document.getElementById("topGainers");

    if (!container) return;

    container.innerHTML = "";

    topGainers.forEach(stock => {

        const item = document.createElement("div");

        item.className = "gainer-item";

        item.innerHTML = `
            <span class="symbol">${stock.symbol}</span>
            <span class="change">${stock.change}</span>
        `;

        item.onclick = () => {

            document.getElementById("symbol").value = stock.symbol;

            loadStock();

        };

        container.appendChild(item);

    });

}


/* =========================
   INITIALIZE
========================= */

window.onload = function () {

    renderTopGainers();

};

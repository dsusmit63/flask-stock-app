from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

API_KEY = "YOUR_API_KEY_HERE"


def get_stock(symbol):

    try:

        url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={API_KEY}"

        response = requests.get(url)

        data = response.json()

        quote = data.get("Global Quote")

        if not quote:
            return None

        return {
            "symbol": symbol.upper(),
            "price": float(quote["05. price"]),
            "open": float(quote["02. open"]),
            "high": float(quote["03. high"]),
            "low": float(quote["04. low"]),
            "volume": int(quote["06. volume"]),
            "dates": [],
            "prices": []
        }

    except Exception as e:

        print("Stock fetch error:", e)

        return None


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/stock", methods=["POST"])
def stock():

    data = request.get_json()

    symbol = data.get("symbol")

    stock_data = get_stock(symbol)

    if not stock_data:
        return jsonify({"error": "Stock not found"}), 404

    return jsonify(stock_data)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)

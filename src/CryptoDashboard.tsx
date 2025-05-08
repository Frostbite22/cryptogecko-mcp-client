import React, { useEffect, useState } from "react";
import { CryptoMcpClient } from "./CryptoMcpClient"; // Your server-side client
import ChatComponent from "./Chat";
import Chat from "./Chat";


const ANTHROPIC_API_KEY = process.env.REACT_APP_ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY is not set");
}
interface BitcoinPrice {
  usd: number;
  eur: number;
}

interface CoinItem {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
}

const CryptoDashboard = () => {
  const [btcPrice, setBtcPrice] = useState<BitcoinPrice | null>(null);
  const [topCoins, setTopCoins] = useState<CoinItem[]>([]);
  const [trendingCoins, setTrendingCoins] = useState<CoinItem[]>([]);
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    if (!hasRun) {
      const fetchData = async () => {
        const client = new CryptoMcpClient("http://localhost:8000", ANTHROPIC_API_KEY);

        try {
          await client.connect();

          // Fetch Bitcoin Price (USD and EUR)
          const btcRes = await client.getPrice({ ids: "bitcoin", vs_currencies: "usd,eur" });
          if ("content" in btcRes && Array.isArray(btcRes.content) && btcRes.content.length > 0) {
            const btcJson = JSON.parse((btcRes.content as any)[0].text);
            setBtcPrice(btcJson.bitcoin);
          }

          // Fetch Top Coins (by market cap)
          const marketRes = await client.getMarketData({
            per_page: 10,
            page: 1,
            sparkline: false
          });
          if ("content" in marketRes && Array.isArray(marketRes.content) && marketRes.content.length > 0) {
            const parsedTopCoins = (marketRes.content as any).map((coinData: any) => {
              const coin = JSON.parse(coinData.text);
              return {
                id: coin.id,
                name: coin.name,
                symbol: coin.symbol,
                image: coin.image,
                current_price: coin.current_price,
                price_change_percentage_24h: coin.price_change_percentage_24h
              };
            });
            setTopCoins(parsedTopCoins);
          }

          // Fetch Trending Coins
          const trendingRes = await client.getTrending();
          if ("content" in trendingRes && Array.isArray(trendingRes.content) && trendingRes.content.length > 0) {
            const trendingJson = JSON.parse((trendingRes.content as any)[0].text);
            const parsedTrendingCoins = trendingJson.coins.map((coin: any) => {
              return {
                id: coin.item.id,
                name: coin.item.name,
                symbol: coin.item.symbol,
                image: coin.item.thumb,
                current_price: coin.item.price, // Ensure price exists in the data
                price_change_percentage_24h: coin.item.price_change_percentage_24h, // Adjust if necessary
              };
            });
            setTrendingCoins(parsedTrendingCoins);
          }

          setHasRun(true);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      fetchData();
    }
  }, [hasRun]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-12">
      <h1 className="text-4xl font-bold text-center">Crypto Dashboard</h1>
        {/* include the chat component */}
        <Chat/>
      {/* Bitcoin Price */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold mb-2">Bitcoin Price</h2>
        {btcPrice ? (
          <div className="text-lg">
            <p>USD: ${btcPrice.usd}</p>
            <p>EUR: €{btcPrice.eur}</p>
          </div>
        ) : (
          <p className="text-gray-500">Loading Bitcoin price...</p>
        )}
      </div>

      {/* Top Coins */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Top 10 Coins by Market Cap</h2>
        {topCoins.length > 0 ? (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {topCoins.map((coin, index) => (
              <li key={coin.id} className="bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition">
                <div className="flex items-center space-x-4">
                  <img
                    src={coin.image || "https://via.placeholder.com/30"}
                    alt={coin.name}
                    className="w-10 h-10"
                  />
                  <div>
                    <h3 className="font-semibold text-lg">
                      {coin.name} ({coin.symbol.toUpperCase()})
                    </h3>
                    <p>Price: ${coin.current_price.toFixed(2)}</p>
                    <p
                      className={
                        coin.price_change_percentage_24h >= 0
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      24h Change: {coin.price_change_percentage_24h.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Loading top coins...</p>
        )}
      </div>

      {/* Trending Coins */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Trending Coins</h2>
        {trendingCoins.length > 0 ? (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trendingCoins.map((coin, index) => (
              <li key={coin.id} className="bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition">
                <div className="flex items-center space-x-4">
                  <img
                    src={coin.image || "https://via.placeholder.com/30"}
                    alt={coin.name}
                    className="w-10 h-10"
                  />
                  <div>
                    <h3 className="font-semibold text-lg">
                      {coin.name} ({coin.symbol.toUpperCase()})
                    </h3>
                    <p className="text-gray-700">Trending Coin</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Loading trending coins...</p>
        )}
      </div>
    </div>
  );
};

export default CryptoDashboard;

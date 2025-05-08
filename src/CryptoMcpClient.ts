import { Client } from "@modelcontextprotocol/sdk/client/index";
import { SSEClientTransport  } from "@modelcontextprotocol/sdk/client/sse";
import { Anthropic } from "@anthropic-ai/sdk" ;
import {MessageParam,Tool} from "@anthropic-ai/sdk/resources/messages/messages.mjs";
import dotenv from "dotenv";
dotenv.config();


const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY is not set");
}

interface CryptoPrice {
  [coin: string]: {
    [currency: string]: number;
  };
}

interface CoinInfo {
  id: string;
  symbol: string;
  name: string;
}

interface MarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
}

interface TrendingCoin {
  id: string;
  coin_id: number;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
  small: string;
  large: string;
  slug: string;
  price_btc: number;
  score: number;
}

interface TrendingResponse {
  coins: Array<{item: TrendingCoin}>;
}

interface ErrorResponse {
  error: string;
}

export class CryptoMcpClient {
  private client: Client;
  private serverUrl: string;;
  private tools: Tool[] = []
  private anthropic : Anthropic ;

  constructor(serverUrl: string) {
    this.serverUrl = serverUrl;
    this.client = new Client({
      name: "crypto-mcp-client",
      version: "1.0.0"
    });
    this.anthropic = new Anthropic({
        apiKey: ANTHROPIC_API_KEY
    });
  }

  /**
   * Connect to the MCP Server
   */
  async connect(): Promise<void> {
    try {
      const transport = new SSEClientTransport (
        new URL(`${this.serverUrl}/sse`)
      );
      await this.client.connect(transport);
      console.log("Connected using SSE transport");
      const toolsResult = await this.client.listTools();
      this.tools = toolsResult.tools.map((tool) => {
        return {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters
        };
      }
      );
      console.log("Connected to server with tools:",
        this.tools.map((tool) => tool.name)
      );

    } catch (error) {
      console.error("Failed to connect to MCP server:", error);
      throw error;
    }
  }

 

  /**
   * Get cryptocurrency prices
   * @param options Options for the price request
   * @returns Promise with price data
   */
  async getPrice(options: {
    vs_currencies?: string;
    ids?: string;
    symbols?: string;
  }): Promise<CryptoPrice | ErrorResponse> {

    try {
      const { vs_currencies = "usd", ids, symbols } = options;
      const result = await this.client.callTool({name :"get_price", arguments : {
        vs_currencies,
        ids,
        symbols
      }});
      return result as CryptoPrice | ErrorResponse;
    } catch (error) {
      console.error("Error fetching price data:", error);
      return { error: `Failed to fetch price data: ${error}` };
    }
  }

  /**
   * Get list of available coins
   * @returns Promise with coin list
   */
  async getCoinList(): Promise<CoinInfo[] | ErrorResponse> {
    

    try {
      const result = await this.client.callTool({ name : "get_coin_list", arguments : {}});
      return result as unknown as CoinInfo[] | ErrorResponse;
    } catch (error) {
      console.error("Error fetching coin list:", error);
      return { error: `Failed to fetch coin list: ${error}` };
    }
  }

  /**
   * Get market data for cryptocurrencies
   * @param options Options for market data request
   * @returns Promise with market data
   */
  async getMarketData(options: {
    vs_currency?: string;
    ids?: string;
    category?: string;
    order?: string;
    per_page?: number;
    page?: number;
    sparkline?: boolean;
  }): Promise<MarketData[] | ErrorResponse> {
  

    try {
      const {
        vs_currency = "usd",
        ids,
        category,
        order = "market_cap_desc",
        per_page = 100,
        page = 1,
        sparkline = false
      } = options;

      const result = await this.client.callTool({name :"get_market_data",arguments : {
        vs_currency,
        ids,
        category,
        order,
        per_page,
        page,
        sparkline
      }});
      return result as unknown as MarketData[] | ErrorResponse;
    } catch (error) {
      console.error("Error fetching market data:", error);
      return { error: `Failed to fetch market data: ${error}` };
    }
  }

  /**
   * Get trending cryptocurrencies
   * @returns Promise with trending data
   */
  async getTrending(): Promise<TrendingResponse | ErrorResponse> {
  

    try {
      const result = await this.client.callTool({ name : "get_trending",arguments : {}});
      return result as unknown as TrendingResponse | ErrorResponse;
    } catch (error) {
      console.error("Error fetching trending data:", error);
      return { error: `Failed to fetch trending data: ${error}` };
    }
  }
}

// Example usage
async function main() {
  const client = new CryptoMcpClient("http://localhost:8000");
  
  try {
    // Connect to the server
    await client.connect();
    
    // Get Bitcoin price in USD and EUR
    const btcPrice = await client.getPrice({
      ids: "bitcoin",
      vs_currencies: "usd,eur"
    });
    console.log("Bitcoin price:", btcPrice);
    
    // Get top 10 coins by market cap
    const topCoins = await client.getMarketData({
      per_page: 10,
      page: 1
    });
    console.log("Top 10 coins:", topCoins);
    
    // Get trending coins
    const trending = await client.getTrending();
    console.log("Trending coins:", trending);
    
  } catch (error) {
    console.error("Error in main:", error);
  }
}

// Uncomment to run the example
// main();

export default CryptoMcpClient;
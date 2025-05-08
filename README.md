## Client Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Create a new React project:
   ```bash
   npx create-react-app crypto-mcp-client
   cd crypto-mcp-client
   ```

2. Install required dependencies:
   ```bash
   npm install @modelcontextprotocol/sdk tailwindcss
   npm install @anthropic-ai/sdk
   ```

You might need sometimes to use legacy peer dependencies 
```bash
--legacy-peer-deps
```
3. Set up Tailwind CSS:
   ```bash
   npx tailwindcss init
   ```

4. Update `tailwind.config.js`:
   ```javascript
   /** @type {import('tailwindcss').Config} */
   module.exports = {
     content: [
       "./src/**/*.{js,jsx,ts,tsx}",
     ],
     theme: {
       extend: {},
     },
     plugins: [],
   }
   ```

5. Add Tailwind directives to your CSS:
   ```css
   /* src/index.css */
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

6. Create TypeScript files:
   - Save the TypeScript client code to `src/CryptoMcpClient.ts`
   - Save the React component code to `src/CryptoDashboard.tsx`

7. Update `src/App.tsx` to use the dashboard:
   ```tsx
   import React from 'react';
   import './App.css';
   import CryptoDashboard from './CryptoDashboard';

   function App() {
     return (
       <div className="App">
         <CryptoDashboard />
       </div>
     );
   }

   export default App;
   ```
9. Add tsconfig.json
    ```json
    {
    "compilerOptions": {
        "target": "es5",
        "lib": ["dom", "dom.iterable", "esnext"],
        "allowJs": true,
        "skipLibCheck": true,
        "esModuleInterop": true,
        "allowSyntheticDefaultImports": true,
        "strict": true,
        "forceConsistentCasingInFileNames": true,
        "noFallthroughCasesInSwitch": true,
        "module": "esnext",
        "moduleResolution": "node",
        "resolveJsonModule": true,
        "isolatedModules": true,
        "noEmit": true,
        "jsx": "react-jsx",
        "baseUrl": ".",
        "paths": {
        "@modelcontextprotocol/sdk/*": ["node_modules/@modelcontextprotocol/sdk/*"]
        }
    },
    "include": ["src"]
    }
    ```
8. Start the client:
   ```bash
   npm start
   ```

The client will be available at `http://localhost:3000`.

## MCP Communication Flow

1. The client connects to the server using Server-Sent Events (SSE) at the `/sse` endpoint
2. The client creates a session with the server
3. The client calls MCP tools provided by the server
4. Communication between client and server happens through:
   - SSE connection for server-to-client messages
   - POST requests to `/messages/` for client-to-server messages
5. The server processes requests and returns results through the established SSE connection

## Available Tools

The server exposes four main tools:

1. **get_price**: Get cryptocurrency prices in various currencies
   - Parameters: `vs_currencies`, `ids`, `symbols`

2. **get_coin_list**: Get list of all available coins
   - No parameters required

3. **get_market_data**: Get detailed market data for cryptocurrencies
   - Parameters: `vs_currency`, `ids`, `category`, `order`, `per_page`, `page`, `sparkline`

4. **get_trending**: Get trending coins in the last 24 hours
   - No parameters required

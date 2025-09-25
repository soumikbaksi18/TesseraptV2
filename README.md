# 🚀 Tesserapt - AI-Powered DeFi Investment Platform

<div align="center">

<img width="1158" height="653" alt="image" src="https://github.com/user-attachments/assets/db0ea730-e455-4acb-94f5-44849124df77" />


  [![Demo Video](https://img.shields.io/badge/📹-Watch%20Demo-blue?style=for-the-badge)](https://drive.google.com/drive/folders/1mrCr7DbDFzfmmtmVIcTFToJWRDMvoD7C)
  [![Documentation](https://img.shields.io/badge/📚-Documentation-orange?style=for-the-badge)](#documentation)
</div>

## 🎯 Overview

<img width="500" height="500" alt="image" src="https://github.com/user-attachments/assets/41e411a0-ffa4-427b-aef5-69ee24f57c46" />

**Tesserapt** is a cutting-edge AI-powered DeFi investment platform that combines advanced machine learning algorithms with real-time market data to provide intelligent investment recommendations. Built on the Aptos blockchain, it offers users sophisticated tools for lending, borrowing, staking, liquidity pool optimization, yield farming, and automated trading strategies.

### 🌟 Key Features

- **🧠 AI Investment Advisor**: LSTM-based forecasting for optimal returns.
- **🏦 Lending & Borrowing**: AI-enhanced collateral management and borrowing strategies
- **💧 Liquidity Pool Recommendations**: AI-powered analysis of the best LP opportunities
- **📊 Real-time Market Data**: Live trading pairs and market analytics
- **📈 AI Staking & Trading Hub**: Smart staking allocation and predictive trading signals
- **🔗 Aptos Integration**: Native support for Aptos blockchain and Petra wallet
- **🎨 Modern UI/UX**: Sleek, responsive interface with dark mode support

## 🖼️ Screenshots

### Lending & Borrowing in Aptos
<img width="1908" height="963" alt="aptos-s1" src="https://github.com/user-attachments/assets/e2d089b6-9017-494c-949f-852734b62cbd" />


*Supply, borrow, and manage risk with AI-powered insights*

### AI Staking and Trading
<img width="1919" height="855" alt="aptos-s2" src="https://github.com/user-attachments/assets/15c4c341-3567-4a4c-b27a-bccdf8c149d0" />


*Smart staking allocation, predictive trading signals, and auto-trading strategies all in one place*

### Cyberpunk Cityscape
<img width="1423" height="792" alt="image" src="https://github.com/user-attachments/assets/e71fe0ef-663b-44c8-904f-c75424e93677" />

<img width="1716" height="961" alt="image" src="https://github.com/user-attachments/assets/10e7d9aa-62e7-46a8-a156-dd40e6acdde5" />

*Futuristic interface design with neon-lit aesthetics and advanced AI navigation*

## 🎥 Demo Video

Watch our comprehensive demo showcasing all features:
**[📹 Tesserapt Demo Video](https://drive.google.com/drive/folders/1mrCr7DbDFzfmmtmVIcTFToJWRDMvoD7C)**

## 🏗️ Architecture

The project consists of two main components:

### 1. Frontend Application (`staking-application/`)
- **Framework**: React 19 + TypeScript + Vite
- **UI Library**: Tailwind CSS + Radix UI components
- **Blockchain**: Aptos SDK integration
- **State Management**: React Query for server state
- **Wallet Integration**: Petra wallet adapter

### 2. AI Backend (`ai-agents/`)
- **Framework**: FastAPI + Python
- **ML Models**: LSTM neural networks for price prediction
- **Data Source**: DeFiLlama API integration
- **Deployment**: Render.com ready

## 🎯 Core Features (Expanded)

### 1. AI Investment Advisor
- **LSTM Forecasting**: Advanced neural networks predict token price movements.
- **Risk Assessment**: Personalized recommendations based on user-defined risk profiles.
- **PT/YT Optimization**: Intelligent allocation between Principal Tokens and Yield Tokens.

### 2. Lending & Borrowing on Aptos
- **Decentralized Lending Markets**: Supply assets to earn yield, or borrow against your collateral with seamless Aptos-native integration.
- **AI-Backed Credit Scoring**: ML models analyze wallet history, collateral volatility, and liquidity trends to offer **dynamic borrow limits** and **optimized interest rates**.
- **Collateral Optimization**: AI continuously monitors collateral-to-debt ratios and alerts users before liquidation risks.
- **Multi-Asset Support**: Deposit APT, stablecoins, or ecosystem tokens into lending pools with adaptive APY curves.
- **Flash Loan Ready**: Future-proof architecture to enable AI-driven arbitrage and advanced trading strategies.

### 3. AI-Powered Staking & Trading Hub
- **Smart Staking Allocator**: AI agents recommend staking pools with the best **APY-to-risk ratios** across Aptos and partner protocols.
- **Dynamic Rebalancing**: Portfolios are automatically adjusted when staking rewards or market conditions shift.
- **Predictive Trading Signals**: LSTM-based AI provides **buy/sell confidence scores** for supported tokens.
- **Auto-Trading Strategies**: Execute trades with AI-powered bots balancing **short-term opportunities** and **long-term yield**.
- **Unified Hub**: Stake, lend, borrow, and trade in one dashboard with **real-time portfolio analytics** and **P&L breakdowns**.

### 4. Liquidity Pool Recommendations
- **Pool Analysis**: AI-driven screening of LP opportunities across Aptos DEXs.
- **APY Optimization**: Suggests pools with the highest sustainable returns.
- **Risk Profiling**: AI classifies pools as conservative, moderate, or aggressive.

### 5. Live Market Data
- **Real-time Prices**: Live price feeds for Aptos tokens and top crypto assets.
- **Market Analytics**: Technical indicators and charting powered by AI.
- **Trading Pairs**: AI-driven pair discovery to catch early momentum shifts.

### 6. Aptos Integration
- **Petra Wallet**: Native wallet integration.
- **Smart Contracts**: DeFi protocol interactions.
- **Transaction Management**: Seamless blockchain transactions.

## 📊 API Endpoints

### AI Optimization
```http
POST /optimize
Content-Type: application/json

{
  "coin_id": "bitcoin",
  "risk_profile": "moderate",
  "maturity_months": 6
}
```

### Market Data
```http
GET /coins/{coin_id}
GET /coins/{coin_id}/history?days=30
```

### Health Check
```http
GET /health
```

## 🎨 Design System

### Color Palette
- **Primary**: `#F5F02C` (Yellow)
- **Secondary**: `#FF9450` (Orange)
- **Dark**: `#000000` (Black)
- **Light**: `#FFFFFF` (White)

### Typography
- Modern, clean fonts optimized for readability
- Consistent hierarchy across all components

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder to your preferred platform
```

### Backend (Render.com)
```bash
# Configure render.yaml for automatic deployment
# Set environment variables in Render dashboard
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **DeFiLlama** for providing comprehensive DeFi data
- **Aptos Labs** for blockchain infrastructure
- **React Team** for the amazing framework
- **FastAPI** for the robust backend framework

## 📞 Support

- **Documentation**: [Full Documentation](#)
- **Issues**: [GitHub Issues](#)
- **Discord**: [Community Discord](#)
- **Email**: support@tesserapt.com

---

<div align="center">
  <p>Built with ❤️ by the Tesserapt Team</p>
  <p>
    <a href="#top">⬆️ Back to Top</a>
  </p>
</div>

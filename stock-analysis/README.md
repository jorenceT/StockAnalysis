# Stock Analysis App (Angular + Android-ready)

This project is an Angular standalone app designed to be converted to Android via Capacitor.

## Features implemented
- Indian stock universe with rule-based buy/sell scoring.
- Watchlist management (add/remove stocks).
- Performance outlook for each watchlist stock (`Good` / `Bad`) with action suggestions (`Buy` / `Sell` / `Hold`).
- Daily morning notification with top 5 suggestions.
- Change alerts for major movement in watchlist stock score.

> ⚠️ This is a demo analytics engine, not financial advice. Use verified market data + risk controls before production use.

## Run
```bash
npm install
npm start
```

## Convert to Android
```bash
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

## Production notes
1. Replace mock market data with NSE/BSE compliant market-data provider.
2. Move rule-engine to backend (Node/Python) and secure APIs.
3. Add authentication and encrypted watchlist sync.
4. Use FCM/APNs push pipeline for reliable notifications when app is not active.

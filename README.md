# 🛰️ Forest Sentinel - Real-time Forest Risk Monitoring

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/forest-sentinel)
[![NASA Space Apps 2025](https://img.shields.io/badge/NASA-Space%20Apps%202025-blue)](https://www.spaceappschallenge.org/)

## 🌲 Overview

Forest Sentinel is a real-time forest risk monitoring system that uses satellite data from NASA and ESA to detect and predict forest fires, deforestation, and ecological threats. The system works through clouds using Sentinel-1 SAR technology and provides 7-day risk forecasts. This project has been created as part of NASA Space Apps Hackathon!!

## ✨ Key Features

- **🛰️ Real Satellite Data**: Integrates Sentinel-1 SAR, MODIS, FIRMS, and Landsat
- **☁️ Cloud-Penetrating**: Works through smoke and clouds using SAR technology  
- **🔥 Live Fire Detection**: Real-time fire data updated every 3 hours from NASA FIRMS
- **📈 7-Day Forecast**: ML-powered predictions with confidence intervals
- **🗺️ Interactive Maps**: Uses OpenStreetMap (no API key required!)
- **⚠️ Smart Alerts**: Customizable risk thresholds and notifications
- **🔍 Google-like Search**: Search any location on Earth instantly

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- NASA FIRMS API key (free, instant via email)
- Google Earth Engine access (optional but recommended)

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/forest-sentinel.git
cd forest-sentinel

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Add your API keys to .env.local

# Run development server
npm run dev

# Open http://localhost:3000

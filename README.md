# Phishing Detection System

A modern phishing detection system with a browser extension and a server-side component.

## Features
- Real-time phishing detection
- Browser extension for seamless protection
- Server-side analysis and confidence scoring
- Secure dashboard for monitoring

## Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/PodaMounitha/phishing-detection-system.git
   cd phishing-detection-system
   ```
2. Install dependencies:
   ```bash
   npm install
   cd server
   npm install
   ```

### Running the Project
1. Start the development server for the frontend:
   ```bash
   npm run dev
   ```
2. Start the backend server:
   ```bash
   cd server
   npm run start
   ```

## Project Structure
- `src/`: Frontend React application
- `server/`: Express.js backend for analysis
- `extension/`: Browser extension source code
- `PHISHING_DETECTION.md`: Detailed documentation on the detection logic

# 🌤️ Officience Meteo

A Sales Pipeline Intelligence Dashboard built with React, TypeScript, and Gemini AI.

![Officience Meteo](https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6)

## ✨ Features

- **Real-time Pipeline Dashboard** - Visual overview of your sales pipeline
- **AI-Powered Insights** - Get strategic recommendations from Gemini AI
- **Deal Health Tracking** - Monitor deal momentum and risk levels
- **Forecast Intelligence** - AI-adjusted forecasting based on deal signals
- **Team Staffing View** - Track team workload and prevent burnout
- **Google Sheets Integration** - Live data sync from your spreadsheet

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Gemini API key (get one at [Google AI Studio](https://aistudio.google.com/app/apikey))

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/officience-meteo.git
   cd officience-meteo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` and add your Gemini API key:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📦 Deployment to Vercel

### Step-by-Step Guide (No Coding Required!)

#### Step 1: Create a GitHub Account (if you don't have one)
1. Go to [github.com](https://github.com)
2. Click "Sign up" and follow the instructions
3. Verify your email address

#### Step 2: Create a New Repository
1. Click the **+** icon in the top right corner
2. Select **"New repository"**
3. Name it `officience-meteo`
4. Keep it **Public** or **Private** (your choice)
5. Click **"Create repository"**

#### Step 3: Upload Your Code to GitHub
**Option A: Using GitHub Web Interface (Easiest)**
1. On your new repository page, click **"uploading an existing file"**
2. Drag and drop ALL the project files (except `node_modules` folder)
3. Add a commit message like "Initial commit"
4. Click **"Commit changes"**

**Option B: Using Git Command Line**
```bash
# In your project folder
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/officience-meteo.git
git push -u origin main
```

#### Step 4: Create a Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"** (recommended)
4. Authorize Vercel to access your GitHub

#### Step 5: Deploy to Vercel
1. On Vercel dashboard, click **"Add New..."** → **"Project"**
2. Find and select your `officience-meteo` repository
3. Click **"Import"**

#### Step 6: Configure Environment Variables (Important!)
Before clicking Deploy:
1. Expand **"Environment Variables"** section
2. Add your Gemini API key:
   - **Name:** `VITE_GEMINI_API_KEY`
   - **Value:** `your_actual_gemini_api_key`
3. Click **"Add"**

#### Step 7: Deploy!
1. Click **"Deploy"**
2. Wait 1-2 minutes for deployment
3. 🎉 Your app is live! Vercel will give you a URL like `officience-meteo.vercel.app`

### Updating Your App
After making changes:
1. Push changes to GitHub (or upload files again)
2. Vercel automatically redeploys!

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_GEMINI_API_KEY` | Your Google Gemini API key | Yes |

### Google Sheets Setup
The app fetches data from a Google Sheet. To use your own:
1. Create a Google Sheet with the required columns
2. Publish it to the web (File → Share → Publish to web)
3. Update the `SHEET_ID` in `services/dealService.ts`

## 🛠️ Tech Stack

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **AI:** Google Gemini AI
- **Charts:** Recharts
- **Icons:** Lucide React

## 📁 Project Structure

```
officience-meteo/
├── components/        # React components
│   ├── Dashboard.tsx  # Main dashboard view
│   ├── Deals.tsx      # Deals list view
│   ├── DealDetail.tsx # Single deal view
│   ├── Forecast.tsx   # Forecast analytics
│   ├── Ranking.tsx    # Team rankings
│   └── ...
├── services/          # Business logic
│   ├── gemini.ts      # Gemini AI integration
│   ├── dealService.ts # Data fetching
│   └── mockData.ts    # Mock data for testing
├── App.tsx            # Main app component
├── index.tsx          # Entry point
├── types.ts           # TypeScript definitions
└── constants.ts       # App constants
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙋 Support

If you have questions or run into issues:
1. Check the [Issues](https://github.com/YOUR_USERNAME/officience-meteo/issues) page
2. Create a new issue with details about your problem
3. Include screenshots if possible!

---

Made with ❤️ by Officience

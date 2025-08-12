# HealthCheck AI - Misinformation Verification Platform

A comprehensive AI-powered health misinformation verification platform that analyzes health claims and articles to determine their accuracy using trusted medical sources.

## 🚀 Features

### Core Functionality
- **AI-Powered Verification**: Uses BioBERT/MedBERT and OpenAI GPT models for accurate health claim analysis
- **Trusted Source Integration**: Cross-references with WHO, CDC, PubMed, and other authoritative medical sources
- **Real-time News**: Live updates from trusted health organizations
- **Multilingual Support**: Processes claims in multiple languages
- **Confidence Scoring**: Provides detailed confidence metrics for each analysis
- **Citation System**: Comprehensive source citations with links

### User Experience
- **Clean, Medical-Grade Interface**: Professional design with trust-building aesthetics
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **History Management**: Track and manage past verifications
- **Share Results**: Easy sharing via WhatsApp, copy links, or social media
- **Real-time Updates**: Auto-refreshing news and seamless interactions

### Technical Features
- **Full-Stack Architecture**: React frontend with Python Flask backend
- **Modern Tech Stack**: TypeScript, Tailwind CSS, and comprehensive API integrations
- **Modular Codebase**: Clean, maintainable architecture following best practices
- **Mock API Layer**: Ready for production backend integration
- **Local Storage**: Persistent verification history

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons
- **React Hot Toast** for notifications

### Backend (Ready for Integration)
- **Python Flask** REST API
- **BioBERT/MedBERT** via HuggingFace Inference API
- **OpenAI GPT API** for natural language processing
- **newspaper3k** for article text extraction
- **spaCy** for text preprocessing
- **langdetect** for language detection

### APIs & Services
- WHO News API
- CDC News API
- PubMed RSS feeds
- Google Fact Check Tools API
- Google Translate API
- Feedparser for RSS parsing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Python 3.8+ (for backend)
- npm or yarn

### Quick Start (Full Stack)

1. **Install dependencies:**
   ```bash
   npm install
   cd backend && pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Install spaCy English model:**
   ```bash
   python -m spacy download en_core_web_sm
   ```

4. **Start both frontend and backend:**
   ```bash
   npm run dev:full
   ```

5. **Open in browser:**
   Navigate to `http://localhost:5173`

### Separate Setup

#### Frontend Only
```bash
npm install
npm run dev
```

#### Backend Only

1. **Set up Python environment:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python -m spacy download en_core_web_sm
   ```

2. **Start Flask server:**
   ```bash
   python app.py
   ```

The backend will run on `http://localhost:5000`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx       # Navigation header
│   ├── TrustedNews.tsx  # News sidebar component
│   ├── ConfidenceBar.tsx # Confidence visualization
│   └── CitationCard.tsx # Citation display
├── pages/               # Main page components
│   ├── LandingPage.tsx  # Home page with input form
│   ├── ResultsPage.tsx  # Verification results display
│   └── HistoryPage.tsx  # Verification history
├── context/             # React context providers
│   └── VerificationContext.tsx # State management
├── services/            # API integration layer
│   ├── api.ts          # Main verification API
│   └── newsApi.ts      # News fetching service
└── App.tsx             # Main application component

backend/
├── app.py              # Flask application entry point
├── services/           # External API services
│   ├── verification_service.py # Main AI verification logic
│   ├── news_service.py # News fetching from trusted sources
│   └── source_checker.py # Trusted source verification
├── utils/              # Utility functions
│   ├── text_processor.py # Text processing and NLP
│   └── validators.py   # Input validation
└── requirements.txt    # Python dependencies
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3B82F6) - Trust and medical authority
- **Secondary**: Teal (#14B8A6) - Clean, modern feel
- **Accent**: Orange (#F97316) - Call-to-action elements
- **Success**: Green (#10B981) - Verified claims
- **Warning**: Amber (#F59E0B) - Claims needing review
- **Error**: Red (#EF4444) - Misleading claims

### Typography
- **Headlines**: Bold, clear hierarchy
- **Body**: 150% line height for readability
- **Captions**: 120% line height for compact info

### Components
- **Rounded corners**: 8px, 12px, 16px system
- **Shadows**: Subtle depth with multiple layers
- **Spacing**: 8px grid system
- **Animations**: Smooth 200ms transitions

## 🔗 API Integration Guide

### Verification Endpoint
```typescript
POST /api/verify
{
  "input": "health claim or article URL",
  "language": "en" // optional
}
```

### Response Format
```typescript
{
  "verdict": "true" | "misleading" | "needs review",
  "confidence": 85,
  "explanation": "Detailed explanation...",
  "citations": [
    {
      "title": "Source title",
      "source": "WHO/CDC/PubMed",
      "url": "https://...",
      "publishedAt": "2024-01-15",
      "summary": "Brief summary..."
    }
  ],
  "language": "English",
  "model": "BioBERT + GPT-4",
  "processingTime": "2.3s"
}
```

### News Endpoint
```typescript
GET /api/news?source=all&limit=10
```

### Health Check
```typescript
GET /api/health
```

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
1. **Build production version:**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel:**
   ```bash
   npx vercel --prod
   ```

3. **Or deploy to Netlify:**
   - Connect GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`
    - Add environment variable: `VITE_API_BASE_URL=https://your-backend-url.com`

### Backend Deployment (Render/Heroku)

#### Render Deployment
1. **Connect GitHub repository to Render**
2. **Set build command:** `cd backend && pip install -r requirements.txt && python -m spacy download en_core_web_sm`
3. **Set start command:** `cd backend && gunicorn app:app`
4. **Add environment variables** from `.env.example`

#### Heroku Deployment
1. **Create Heroku app:**
   ```bash
   heroku create your-app-name
   ```

2. **Set buildpacks:**
   ```bash
   heroku buildpacks:set heroku/python
   ```

3. **Deploy:**
   ```bash
   git subtree push --prefix backend heroku main
   ```

## 🔧 Configuration

### Required API Keys

1. **OpenAI API Key** - For GPT-4 powered explanations
   - Get from: https://platform.openai.com/api-keys
   - Required for: AI-powered claim analysis and explanation generation

2. **HuggingFace API Key** - For BioBERT/MedBERT models
   - Get from: https://huggingface.co/settings/tokens
   - Required for: Medical text classification

3. **Google Cloud APIs** (Optional but recommended)
   - Google Translate API - For multilingual support
   - Google Fact Check Tools API - For additional source verification
   - Get from: https://console.cloud.google.com/

4. **Health Organization APIs** (Optional)
   - WHO API Key - For WHO news and information
   - CDC API Key - For CDC data access

### Environment Variables

Create a `.env` file in the root directory:

```env
# Required
OPENAI_API_KEY=your_openai_api_key
HUGGINGFACE_API_KEY=your_huggingface_api_key

# Optional
GOOGLE_TRANSLATE_API_KEY=your_google_translate_key
GOOGLE_FACTCHECK_API_KEY=your_google_factcheck_key
WHO_API_KEY=your_who_api_key
CDC_API_KEY=your_cdc_api_key

# Frontend
VITE_API_BASE_URL=http://localhost:5000
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
python -m pytest tests/
```

### Frontend Testing
### Run tests:
```bash
npm run test
```

### Linting:
```bash
npm run lint
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 🔍 API Documentation

### Health Claim Verification

**Endpoint:** `POST /api/verify`

**Request Body:**
```json
{
  "input": "Drinking lemon water boosts metabolism",
  "language": "auto"
}
```

**Response:**
```json
{
  "verdict": "needs review",
  "confidence": 72,
  "explanation": "While lemon water can be part of a healthy routine...",
  "citations": [...],
  "language": "English",
  "model": "BioBERT + GPT-4",
  "processingTime": "2.3s",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Trusted News

**Endpoint:** `GET /api/news`

**Query Parameters:**
- `source`: `all`, `who`, `cdc`, `pubmed` (default: `all`)
- `limit`: Number of articles (default: `10`)

**Response:**
```json
{
  "articles": [...],
  "total": 8,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 🚨 Troubleshooting

### Common Issues

1. **Backend not starting:**
   - Check Python version (3.8+)
   - Install spaCy model: `python -m spacy download en_core_web_sm`
   - Verify environment variables in `.env`

2. **API calls failing:**
   - Check if backend is running on port 5000
   - Verify CORS settings in backend
   - Check browser console for errors

3. **AI models not working:**
   - Verify OpenAI API key is valid
   - Check HuggingFace API key
   - Monitor API usage limits

4. **News not loading:**
   - Check internet connection
   - Verify RSS feed URLs are accessible
   - Check backend logs for errors

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@healthcheck-ai.com or open an issue on GitHub.

## 🎯 Roadmap

### Phase 1 (Completed)
- ✅ Full-stack implementation with Flask backend
- ✅ AI-powered health claim verification
- ✅ Responsive design and UI/UX
- ✅ History management and sharing
- ✅ Real-time trusted news integration

### Phase 2 (In Progress)
- 🔄 Enhanced AI model accuracy
- 🔄 Advanced source verification
- 🔄 Multilingual support expansion

### Phase 3 (Future)
- 📋 Public API for third-party integrations
- 📋 Advanced analytics dashboard
- 📋 Mobile app development
- 📋 Enterprise features
- 📋 Real-time collaboration features

---

**Built with ❤️ for combating health misinformation and promoting evidence-based health information**
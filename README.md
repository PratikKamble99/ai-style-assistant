# AI Stylist & Grooming Assistant

A full-stack, cross-platform AI-driven personal stylist and grooming assistant that provides personalized style recommendations based on user photos, body type, and occasions.

## 🎯 Features

- **AI-Powered Analysis**: Body type detection, face shape analysis, and skin tone matching
- **Smart Recommendations**: Clothing, hairstyles, accessories, and skincare suggestions
- **Shopping Integration**: Product recommendations from Myntra, Amazon, and H&M
- **Cross-Platform**: Web (React) and Mobile (React Native) applications
- **Virtual Try-On**: AI-generated style previews
- **Personalization**: Learning from user feedback and preferences

## 🧩 Tech Stack

- **Frontend Web**: React + TypeScript + TailwindCSS + Axios
- **Frontend Mobile**: React Native (Expo) + Axios
- **Backend**: Node.js (Express) + PostgreSQL + Zod Validation
- **AI Layer**: OpenAI Vision, Replicate APIs
- **Storage**: Cloudinary for image management
- **Authentication**: JWT + OAuth (Google/Apple)
- **Deployment**: Docker + AWS EC2/Vercel

## 📁 Project Structure

```
ai-stylist-app/
├── backend/                 # Node.js Express API
├── web-frontend/           # React web application
├── mobile-app/             # React Native mobile app
├── ai-services/            # AI/ML processing services
├── shared/                 # Shared types and utilities
└── docker-compose.yml      # Development environment
```

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies: `npm install` in each directory
3. Set up environment variables
4. Run development servers
5. Access web app at http://localhost:3000

## 🔧 Development

Each component can be developed and deployed independently:
- Backend API: Port 5000
- Web Frontend: Port 3000
- Mobile App: Expo development server
- AI Services: Port 8000
# 🚀 Quick Deploy to Google Cloud

[![Deploy to Google Cloud](https://img.shields.io/badge/Deploy-Google%20Cloud-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)](https://cloud.google.com/run)
[![GitHub](https://img.shields.io/badge/GitHub-narenkarthikx-181717?style=for-the-badge&logo=github)](https://github.com/narenkarthikx/GenAi-hackathon)

**One-command deployment to Google Cloud Run!** Your AI Skill Gap Radar can be live in 10 minutes.

## Prerequisites

1. **Google Cloud Account** - [Create free account](https://console.cloud.google.com)
2. **Google Cloud SDK** - [Download installer](https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe)

## Deploy in 3 Steps

### Step 1: Install & Login (2 minutes)
```powershell
# After installing Google Cloud SDK, login:
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### Step 2: Deploy (10 minutes)
```powershell
# Navigate to project folder
cd ai-skill-gap-radar

# Run deployment script
.\deploy-to-gcloud.ps1
```

### Step 3: Update Supabase (2 minutes)
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. **Authentication** → **URL Configuration**
3. Add your Cloud Run URL: `https://your-app-xxxxx.run.app`

## That's It! 🎉

Your app is now live with:
- ✅ Auto-scaling (0-100 instances)
- ✅ HTTPS with SSL certificate
- ✅ Global CDN
- ✅ $0-20/month cost
- ✅ 99.95% uptime SLA

## Environment Variables

The deployment script uses your existing `.env.local` file. Your app uses **2 environments**:

- **Development**: `localhost:3000` (uses `.env.local`)
- **Production**: Cloud Run URL (uses `env.yaml`)

Both can share the same Supabase project.

## Manual Deployment (Alternative)

```powershell
gcloud run deploy ai-skill-gap-radar \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars "NEXT_PUBLIC_SUPABASE_URL=your_url" \
  --set-env-vars "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key" \
  --set-env-vars "GEMINI_API_KEY=your_key"
```

## CI/CD with GitHub Actions

Automatic deployment on push to `main`:

1. Create Google Cloud service account
2. Add secrets to GitHub repository
3. Push to `main` → Auto-deploy! 🚀

See [.github/workflows/deploy.yml](.github/workflows/deploy.yml)

## Cost Estimate

| Users/Month | Cost |
|-------------|------|
| 100 users | **$0** (free tier) |
| 1,000 users | **$0-5** |
| 10,000 users | **$10-20** |

**Free Tier**: 2 million requests/month

## Monitoring

```powershell
# View real-time logs
gcloud run services logs tail ai-skill-gap-radar --region asia-south1

# Cloud Console
https://console.cloud.google.com/run
```

## Update Deployment

```powershell
# Make your code changes, then:
.\deploy-to-gcloud.ps1
```

## Documentation

- 📖 **[Complete Deployment Guide](./DEPLOYMENT_GUIDE.md)**
- 🚀 **[Quick Start Guide](./DEPLOY_QUICKSTART.md)**
- ☁️ **[Google Cloud Docs](./docs/GOOGLE_CLOUD_DEPLOYMENT.md)**

## Features Included

- **6 AI Agents** - Specialized tutoring agents
- **Adaptive Learning** - Personalized for each student
- **Multi-subject Coverage** - Math, Science, English, Tamil, Social
- **Teacher Dashboard** - Track student progress
- **Interactive Flashcards** - Grade-specific content
- **Gemini 2.5-flash** - Latest Google AI

## Need Help?

- Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- View logs: `gcloud run services logs tail`
- Open an issue on GitHub

---

**Ready to deploy?** Run `.\deploy-to-gcloud.ps1` and go live! 🚀

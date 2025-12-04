# Deployment Guide - Render.com

This guide walks you through deploying the coding interview platform to Render.com.

## Why Render?

- ✅ **Free Tier Available** - No credit card required
- ✅ **Dockerfile Support** - Uses our existing Dockerfile
- ✅ **Managed PostgreSQL** - Free 90-day trial, then $7/month
- ✅ **Auto-Deploy from GitHub** - Automatic deployments on push
- ✅ **HTTPS by Default** - Free SSL certificates
- ✅ **WebSocket Support** - Works with Socket.io out of the box

## Prerequisites

- GitHub account with your code pushed
- Render account (create at https://render.com)

## Step-by-Step Deployment

### Step 1: Create Render Account

1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub (recommended for easier integration)
4. Verify your email address

### Step 2: Create PostgreSQL Database

1. From Render Dashboard, click **"New +"** → **"PostgreSQL"**
2. Configure the database:
   - **Name**: `coding-interview-db`
   - **Database**: `coding_interview`
   - **User**: `coding_interview_user` (auto-generated)
   - **Region**: Choose closest to your users
   - **Instance Type**: Select **"Free"** (90-day trial)
3. Click **"Create Database"**
4. Wait for database to provision (~2 minutes)
5. **Save these credentials** (found in database info page):
   - Internal Database URL
   - External Database URL
   - Username
   - Password
   - Database Name

### Step 3: Create Web Service

1. From Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository:
   - Click **"Connect account"** if not already connected
   - Select repository: `Solovechik/ai_zoomcamp`
   - You may need to grant Render access to your repositories
3. Configure the web service:

   **Basic Settings:**
   - **Name**: `coding-interview-app`
   - **Region**: Same as your database
   - **Branch**: `master`
   - **Root Directory**: `02-coding-interview`
   - **Runtime**: `Docker`
   - **Dockerfile Path**: `Dockerfile` (should auto-detect)

   **Instance Type:**
   - Select **"Free"** (512 MB RAM, sleeps after inactivity)
   - Note: Free instances spin down after 15 min of inactivity

4. Click **"Advanced"** to configure environment variables

### Step 4: Configure Environment Variables

Add these environment variables (click **"Add Environment Variable"** for each):

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Required |
| `PORT` | `3001` | Required |
| `DB_HOST` | `<from database info>` | Use **Internal** hostname |
| `DB_PORT` | `5432` | Default PostgreSQL port |
| `DB_NAME` | `coding_interview` | Your database name |
| `DB_USER` | `<from database info>` | Database username |
| `DB_PASSWORD` | `<from database info>` | Database password |
| `CORS_ORIGIN` | `*` | Or specific domain if preferred |

**How to get database credentials:**
1. Go to your PostgreSQL database in Render dashboard
2. Scroll to **"Connections"** section
3. Use the **"Internal Database URL"** format:
   - Hostname: `<db-name>.internal`
   - Port: `5432`
   - Username: Shown in connection info
   - Password: Click "eye" icon to reveal

**Alternative: Use Database URL (simpler)**

Instead of individual variables, you can use a single `DATABASE_URL`:

```
DATABASE_URL=postgresql://username:password@hostname:5432/coding_interview
```

Then modify your `server/src/config/database.js` to parse this URL.

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Render will:
   - Clone your repository
   - Build Docker image (takes 3-5 minutes first time)
   - Deploy the container
   - Assign a public URL: `https://coding-interview-app.onrender.com`

3. Monitor deployment progress:
   - View build logs in real-time
   - Check for any errors
   - Wait for status to show **"Live"**

### Step 6: Run Database Migrations

Your database migrations should run automatically on container startup via the mounted init script. However, if you need to run them manually:

1. Go to your Web Service in Render
2. Click on **"Shell"** tab
3. Run migration:
   ```bash
   psql $DATABASE_URL < /app/database/migrations/001_initial_schema.sql
   ```

Or connect to your PostgreSQL database directly:
1. Go to your PostgreSQL database in Render
2. Click **"Connect"** → **"External Connection"**
3. Use provided psql command:
   ```bash
   psql postgresql://username:password@hostname/database
   ```
4. Run migration SQL manually

### Step 7: Test Your Deployment

1. Open your app URL: `https://coding-interview-app.onrender.com`
2. Test health endpoint: `https://coding-interview-app.onrender.com/health`
3. Create a new session and test:
   - Code editing
   - Code execution (Python/JavaScript)
   - Real-time sync (open in 2 tabs)
   - Socket.io connection

## Post-Deployment Configuration

### Custom Domain (Optional)

1. Go to your Web Service settings
2. Scroll to **"Custom Domain"**
3. Click **"Add Custom Domain"**
4. Follow DNS configuration instructions
5. Render provides automatic HTTPS

### Auto-Deploy on Git Push

Already configured! Every push to `master` branch triggers automatic deployment:

```bash
git add .
git commit -m "Update feature"
git push origin master
# Render automatically deploys changes
```

### Environment Updates

To update environment variables:
1. Go to Web Service → **"Environment"** tab
2. Edit or add variables
3. Click **"Save Changes"**
4. Service automatically redeploys

## Monitoring & Logs

### View Application Logs

1. Go to Web Service in Render
2. Click **"Logs"** tab
3. Real-time log streaming
4. Filter by log level or search

### Metrics

1. Go to Web Service
2. Click **"Metrics"** tab
3. View:
   - CPU usage
   - Memory usage
   - Request counts
   - Response times

### Health Checks

Render automatically monitors your `/health` endpoint:
- Interval: 30 seconds
- Timeout: 5 seconds
- Restarts service if unhealthy

## Troubleshooting

### Build Fails

**Problem: Docker build times out**
```
Solution: Free tier has 10-minute build timeout
- Optimize Dockerfile (already done)
- Consider upgrading to paid tier if needed
```

**Problem: npm install fails**
```
Check package.json for correct dependencies
View build logs for specific error
```

### Runtime Issues

**Problem: Can't connect to database**
```bash
# Check environment variables
- Verify DB_HOST uses INTERNAL hostname (.internal)
- Check DB_PASSWORD is correct
- Ensure database is in same region
```

**Problem: WebSocket connection fails**
```bash
# Render supports WebSocket by default
- Check CORS_ORIGIN includes your domain
- Verify Socket.io client connects to correct URL
```

**Problem: App sleeps (Free tier)**
```
Free instances spin down after 15 min of inactivity
- First request after sleep takes 30-60 seconds
- Consider upgrading to paid tier ($7/month) for always-on
- Or use a service like UptimeRobot to ping every 14 minutes
```

### Database Issues

**Problem: Database connection limit reached**
```
Free PostgreSQL: 97 connections
Paid PostgreSQL: 400+ connections

Check connection pooling in database.js
```

**Problem: Database runs out of storage**
```
Free PostgreSQL: 1 GB storage
Monitor storage in database dashboard
Upgrade to paid tier for more storage
```

## Scaling & Optimization

### Upgrade to Paid Tier

**Web Service ($7/month per instance):**
- Always-on (no sleep)
- 512 MB RAM
- Faster performance
- No build time limits

**PostgreSQL ($7/month):**
- After 90-day free trial
- 256 MB RAM
- 1 GB storage
- Automatic backups

### Horizontal Scaling

For high traffic:
1. Upgrade instance type
2. Add multiple instances (load balanced)
3. Enable autoscaling (paid feature)

### Database Optimization

1. Add indexes for frequently queried fields
2. Enable connection pooling (already configured)
3. Monitor slow queries in Render dashboard

## Cost Estimation

### Free Tier (Current Setup)
- Web Service: **$0** (with sleep)
- PostgreSQL: **$0** (90-day trial)
- Total: **$0/month**

### After Free Trial
- Web Service: **$7/month** (always-on)
- PostgreSQL: **$7/month** (after trial)
- Total: **$14/month**

### Alternative: Separate Frontend Deployment

Deploy frontend separately to Vercel/Netlify (free):
- Frontend: **$0** (Vercel/Netlify)
- Backend: **$7/month** (Render Web Service)
- PostgreSQL: **$7/month** (Render)
- Total: **$14/month**

## Alternative: Railway Deployment

If Render doesn't meet your needs, try Railway:
- Similar pricing model
- $5 free credit monthly
- Easier CLI deployment
- GitHub integration

See Railway deployment at the end of this guide.

## Security Best Practices

1. **Use Strong Database Password**
   - Auto-generated by Render (keep it safe)

2. **Set Proper CORS**
   ```
   CORS_ORIGIN=https://your-actual-domain.com
   ```

3. **Enable Render's DDoS Protection**
   - Automatically enabled for all services

4. **Use Environment Variables for Secrets**
   - Never commit passwords to git
   - Use Render's secret file feature if needed

5. **Monitor Logs Regularly**
   - Check for suspicious activity
   - Set up log alerts (paid feature)

## Success Checklist

- ✅ Code pushed to GitHub
- ✅ Render account created
- ✅ PostgreSQL database provisioned
- ✅ Web service created and deployed
- ✅ Environment variables configured
- ✅ Database migrations run
- ✅ Application accessible at public URL
- ✅ Health check endpoint responding
- ✅ Can create and join sessions
- ✅ Real-time code editing works
- ✅ Code execution works (Python/JavaScript)
- ✅ Socket.io connections stable

## Final URLs

After deployment, you'll have:

- **Application**: `https://coding-interview-app.onrender.com`
- **Health Check**: `https://coding-interview-app.onrender.com/health`
- **API**: `https://coding-interview-app.onrender.com/api/sessions`
- **Database**: `<db-name>.render.com` (internal: `<db-name>.internal`)

## Support

- Render Documentation: https://render.com/docs
- Render Community: https://community.render.com
- Render Status: https://status.render.com

---

## Summary

**Deployment Service Used:** Render.com

**Deployment Strategy:** Single Docker container with external PostgreSQL

**Deployment Time:** ~10 minutes total
- Database: 2 minutes
- Build: 5 minutes
- Deploy: 3 minutes

**Cost:** Free tier available, $14/month after trial

Your application is now deployed and accessible worldwide! 🚀

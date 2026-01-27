# Railway Backend - Additional Environment Variables

After deploying your frontend and admin on Vercel, add these environment variables in Railway:

1. Go to your Railway project
2. Click on your backend service
3. Go to "Variables" tab
4. Add these variables:

```
FRONTEND_URL=https://your-frontend-url.vercel.app
ADMIN_URL=https://your-admin-url.vercel.app
```

Replace with your actual Vercel URLs after deployment.

This will enable CORS for your deployed frontend and admin panels.

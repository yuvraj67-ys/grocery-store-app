# 🛒 Grocery Store E-Commerce App

Welcome to your new Grocery Store! This project is built with Next.js 14, Firebase, Tailwind CSS, and ImgBB.

## 🚀 Deployment Guide (NO TERMINAL REQUIRED)

### STEP 1: Prepare Your Files
1. Create a folder named `grocery-store-app` on your computer.
2. Inside it, create a `frontend` folder.
3. Copy and paste all the files provided below into their exact folder structures.

### STEP 2: Upload to GitHub
1. Go to [GitHub](https://github.com/new) and create a new **Public** repository named `grocery-store-app`.
2. Do NOT check the "Add a README file" box (we already have one). Click **Create repository**.
3. On the next page, click the **"uploading an existing file"** link near the top.
4. Drag and drop your ENTIRE `grocery-store-app` folder into the browser window.
5. Wait for the upload, then click **Commit changes**.

### STEP 3: Deploy to Vercel
1. Go to [Vercel](https://vercel.com/) and log in with your GitHub account.
2. Click **Add New...** -> **Project**.
3. Find `grocery-store-app` in your list and click **Import**.
4. **CRITICAL STEP:** In the "Root Directory" section, click **Edit** and select the `frontend` folder.
5. In the "Environment Variables" section, add:
   - Name: `NEXT_PUBLIC_FIREBASE_API_KEY` | Value: `AIzaSyB7w39TxtRpE2lD-aWTd_BzZE1dNYzaUIo`
   - Name: `NEXT_PUBLIC_IMGBB_API_KEY` | Value: `754fb1f38b724ff3f863299e38fcab47`
6. Click **Deploy**. Vercel will automatically read your `package.json` and build the app!

### STEP 4: First Time Admin Setup
1. Once deployed, visit your live website.
2. Click **Login** -> **Register** and create an account (e.g., `admin@grocery.com`).
3. Go to [Firebase Console](https://console.firebase.google.com/) -> Project `grosry-dad49`.
4. Go to **Authentication**, find your new user, and copy the `User UID`.
5. Go to **Realtime Database** -> `users` -> [Your UID].
6. Click the `+` icon on your user, add Name: `role`, Value: `"admin"`.
7. Refresh your live app. You now have access to the Admin Panel!

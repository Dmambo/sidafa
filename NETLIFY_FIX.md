# Netlify Deployment Fix

## Issue
Netlify was using Node 18, but your project requires Node 20+.

## Solution Applied

1. **Updated `netlify.toml`:**
   - Changed `NODE_VERSION` from `18` to `20`
   - Added explicit `npm install` to build command

2. **Created `.nvmrc` file:**
   - Specifies Node 20 for Netlify to use

## If Build Still Fails

If you still get errors, try these steps:

1. **Clear Netlify build cache:**
   - Go to Site settings → Build & deploy → Clear cache
   - Redeploy

2. **Verify dependencies:**
   - Make sure `package.json` has all dependencies
   - Run `npm install` locally to ensure `package-lock.json` is up to date
   - Commit and push `package-lock.json`

3. **Check build logs:**
   - Ensure Node 20 is being used
   - Verify all dependencies install correctly

4. **Alternative: Use Netlify's Node version selector:**
   - In Netlify dashboard → Site settings → Build & deploy → Environment
   - Set Node version to `20` manually


# Recipe Image Population System

Complete guide for populating recipe images using Unsplash API.

## 🎯 What This Does

This system automatically:
1. **Searches Unsplash** for high-quality recipe images
2. **Downloads images** from Unsplash
3. **Uploads to Supabase** storage bucket (`recipe-images`)
4. **Updates database** with image URLs
5. **Updates local JSON** file with new image URLs

## 📦 Installation

Install the required dependency:

```bash
npm install
```

This will install `unsplash-js` package.

## ⚙️ Configuration

The system is already configured with:
- ✅ Unsplash API Key (in `.env`)
- ✅ Supabase credentials (in `.env`)
- ✅ Storage bucket: `recipe-images`

## 🚀 Usage

### 1. Populate First 100 Recipes (Recommended Start)

```bash
npm run populate:images -- --start=0 --end=100
```

This will:
- Process recipes 0-99 (first 100 recipes)
- Take approximately **2 hours** (1.2s delay between requests)
- Use ~100 of your 50/hour Unsplash API limit (spread over time)
- Update both Supabase DB and local `en.json` file

### 2. Populate Next Batch (100-200)

```bash
npm run populate:images -- --start=100 --end=200
```

### 3. Populate Remaining Recipes (200-271)

```bash
npm run populate:images -- --start=200 --end=271
```

### 4. Populate ALL Recipes at Once

```bash
npm run populate:images:all
```

**⚠️ Warning**: This will take ~5-6 hours to complete all 271 recipes (rate limiting).

### 5. Force Re-process (Skip Existing Images)

By default, the script skips recipes that already have images. To force re-download:

```bash
npm run populate:images -- --start=0 --end=100 --force
```

## 📊 What to Expect

### Console Output

```
🚀 CookPro Recipe Image Populator

⚙️  Configuration:
   Start index: 0
   End index: 100
   Skip if exists: true
   Unsplash API Key: ✅ Set

📖 Loaded 271 recipes from en.json

🎯 Processing recipes 0 to 99 (100 recipes)

============================================================

📸 Processing: Menemen (Turkish Scrambled Eggs) (tr_000001)
🔍 Searching Unsplash for: "Menemen food dish"
   ✅ Found image by John Doe
   ⬇️  Downloading image...
   📤 Uploading to Supabase: tr_000001_a1b2c3d4.jpg
   ✅ Uploaded: https://mdetucneptjlkbkzddpu.supabase.co/storage/v1/object/public/recipe-images/tr_000001_a1b2c3d4.jpg
   ✅ Database updated for tr_000001
   ⏳ Waiting 1200ms before next request...

📊 Progress: 1/100 (1.0%) - Status: success

[... continues for all recipes ...]

============================================================
📊 PROCESSING SUMMARY
============================================================
✅ Success: 87
❌ Failed: 3
⏭️  Skipped: 10
📦 Already exists: 0
📈 Total: 100
============================================================

❌ Failed recipes:
   - Some Recipe (tr_000042): No image found on Unsplash
   - Another Recipe (tr_000078): Failed to upload to Supabase

📝 Updating local en.json file...
✅ Updated 87 recipes in en.json

⏱️  Total time: 120.5 seconds

✨ Done!
```

## 🎨 Unsplash API Rate Limits

- **Free Tier**: 50 requests per hour
- **Script Rate Limit**: 1.2 seconds between requests (~3 requests/minute)
- **Safe Processing**: ~30 recipes per hour

### Recommended Strategy

**Day 1**: Process 0-100 (run in background, ~2 hours)
**Day 2**: Process 100-200 (another 2 hours)
**Day 3**: Process 200-271 (final batch, ~1.5 hours)

**OR** run overnight: `npm run populate:images:all` (~5-6 hours total)

## 📁 What Gets Updated

### 1. Supabase Storage (`recipe-images` bucket)
```
recipe-images/
├── tr_000001_a1b2c3d4.jpg
├── tr_000002_e5f6g7h8.jpg
├── tr_000003_i9j0k1l2.jpg
└── ...
```

### 2. Supabase Database (`recipes` table)
```sql
UPDATE recipes
SET image_source = 'https://mdetucneptjlkbkzddpu.supabase.co/storage/v1/object/public/recipe-images/tr_000001_a1b2c3d4.jpg'
WHERE id = 'tr_000001';
```

### 3. Local JSON (`db/en.json`)
```json
{
  "recipes": [
    {
      "id": "tr_000001",
      "title": "Menemen",
      "image_source": "https://mdetucneptjlkbkzddpu.supabase.co/storage/v1/object/public/recipe-images/tr_000001_a1b2c3d4.jpg",
      ...
    }
  ]
}
```

## 🔧 Troubleshooting

### Error: "UNSPLASH_ACCESS_KEY not found"
- Check `.env` file has the key
- Restart terminal/script after adding

### Error: "Failed to upload to Supabase"
- Check Supabase storage bucket exists: `recipe-images`
- Verify bucket is **public** (or has proper RLS policies)
- Check `.env` has correct Supabase credentials

### Error: "No image found on Unsplash"
- Some recipes may not have good matches
- Script continues with other recipes
- You can manually add images later for failed ones

### Rate Limit Errors
- Unsplash may return 429 errors if rate limit exceeded
- Wait 1 hour and resume with `--start=X` where X is last successful index

## 📝 Manual Fixes for Failed Recipes

If some recipes fail to find images, you can:

1. **Check the summary** for failed recipe IDs
2. **Manually search** Unsplash for better images
3. **Update `en.json`** directly with image URLs
4. **Re-run import** script to sync to Supabase

```bash
npm run import:recipes
```

## 🎯 Next Steps After Population

1. **Commit updated `en.json`** to git
2. **Test in app** - images should load from Supabase
3. **Monitor Supabase storage** usage (free tier: 1GB)
4. **Optimize images** if needed (resize, compress)

## 📊 Storage Estimates

- **Average image size**: 200-500 KB
- **100 recipes**: ~20-50 MB
- **271 recipes**: ~54-135 MB
- **Free tier limit**: 1 GB ✅ Plenty of space

## 🔄 Re-running for Updated Recipes

When you add new recipes to `en.json`:

```bash
# Process only new recipes (e.g., 271-300)
npm run populate:images -- --start=271 --end=300
```

## 🛠️ Architecture

```
┌─────────────────┐
│  en.json        │
│  (271 recipes)  │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ populate-images.ts  │ (Main script)
└──────────┬──────────┘
           │
           ├─► unsplashService.ts
           │   ├─ Search images
           │   ├─ Download images
           │   └─ Trigger download tracking
           │
           ├─► supabaseImageService.ts
           │   ├─ Upload to storage bucket
           │   ├─ Update recipes table
           │   └─ Check if exists
           │
           └─► recipeImageProcessor.ts
               ├─ Process single recipe
               ├─ Batch processing
               ├─ Rate limiting
               └─ Progress tracking
```

## 📜 Unsplash Attribution

Images are from Unsplash (free to use). The script automatically:
- ✅ Triggers download endpoint (required by Unsplash API terms)
- ✅ Stores photographer credit (in metadata)

If displaying in app, consider adding attribution:
```
Photo by [Photographer Name] on Unsplash
```

## 🎉 Success Checklist

After running the script, verify:

- [ ] Supabase storage has new images in `recipe-images` bucket
- [ ] Supabase `recipes` table has `image_source` URLs
- [ ] Local `en.json` file updated with image URLs
- [ ] App shows recipe images when loaded
- [ ] No rate limit errors in console
- [ ] Summary shows high success rate (>80%)

## 🤝 Support

If you encounter issues:
1. Check console output for specific errors
2. Verify `.env` configuration
3. Check Supabase storage bucket permissions
4. Review Unsplash API dashboard for rate limits

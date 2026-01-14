# Quick Start: Recipe Image Population

## 🚀 First Time Setup (Done ✅)

```bash
npm install
```

## 📝 Usage Commands

### Process First 100 Recipes
```bash
npm run populate:images -- --start=0 --end=100
```

### Process Next 100 (100-200)
```bash
npm run populate:images -- --start=100 --end=200
```

### Process Remaining (200-271)
```bash
npm run populate:images -- --start=200 --end=271
```

### Process ALL Recipes (5-6 hours)
```bash
npm run populate:images:all
```

### Custom Range
```bash
npm run populate:images -- --start=50 --end=150
```

### Force Re-process (Ignore Existing)
```bash
npm run populate:images -- --start=0 --end=100 --force
```

## ⏱️ Time Estimates

- **Per recipe**: ~1.2 seconds (rate limiting)
- **100 recipes**: ~2 hours
- **271 recipes**: ~5.5 hours

## 📊 Expected Results

✅ **Success Rate**: 80-90%
❌ **Failed**: 5-10% (no matching images)
⏭️ **Skipped**: 5% (already have images)

## 🎯 Recommended Strategy

**Option A: Spread Over Days**
- Day 1: `--start=0 --end=100`
- Day 2: `--start=100 --end=200`
- Day 3: `--start=200 --end=271`

**Option B: Overnight Run**
- Run `npm run populate:images:all` before sleep
- Check results in morning

## ✨ What Happens

1. Script searches Unsplash for recipe images
2. Downloads best match
3. Uploads to Supabase `recipe-images` bucket
4. Updates database `recipes.image_source`
5. Updates local `db/en.json` file

## 🔍 Monitoring Progress

Watch console for:
```
📊 Progress: 45/100 (45.0%) - Status: success
```

## ✅ After Completion

1. Check summary for failed recipes
2. Commit updated `en.json` to git
3. Test images in app
4. (Optional) Manually fix failed recipes

## 🆘 If Something Goes Wrong

### Unsplash Rate Limit Hit
Wait 1 hour, then resume:
```bash
npm run populate:images -- --start=X --end=100
# X = last successful index
```

### Network Error
Just re-run same command - script skips completed recipes

### Supabase Error
- Check bucket `recipe-images` exists
- Verify bucket is public
- Check `.env` credentials

## 📁 Files Modified

- ✅ `db/en.json` (local copy updated)
- ✅ Supabase `recipes` table
- ✅ Supabase storage `recipe-images/`

## 🎉 Done!

Your recipes now have beautiful images!

# Upload Local Image Script

This script uploads a local image from your project to Supabase storage and updates the recipe in both the database and `en.json` file.

## Quick Start

```bash
npm run upload:image <recipe-id> <image-filename>
```

## Example

If you have `mercimek_corbasi.jpeg` for recipe `tr_000002`:

```bash
npm run upload:image tr_000002 mercimek_corbasi.jpeg
```

## Requirements

1. **Image location**: Place your image in `assets/images/recipe/` folder
2. **Recipe ID**: Must exist in `db/en.json`
3. **Environment**: Supabase credentials must be set in `.env`

## What happens when you run it

1. ✅ Validates recipe ID exists in `db/en.json`
2. ✅ Reads the local image from `assets/images/recipe/<filename>`
3. ✅ Uploads it to Supabase storage (`recipe-images` bucket)
4. ✅ Updates the recipe in Supabase database (`recipes` table)
5. ✅ Updates the `image_source` field in `db/en.json`
6. ✅ Shows you the final public URL

## Complete Workflow Example

### Step 1: Place your image
```bash
# Make sure your image is here:
assets/images/recipe/mercimek_corbasi.jpeg
```

### Step 2: Run the script
```bash
npm run upload:image tr_000002 mercimek_corbasi.jpeg
```

### Step 3: Expected output
```
🚀 CookPro Local Image Uploader

⚙️  Configuration:
   Recipe ID: tr_000002
   Image filename: mercimek_corbasi.jpeg
   Supabase URL: ✅ Set

📖 Found recipe: Mercimek Çorbası (Red Lentil Soup)

📂 Reading local image file...
   ✅ Loaded 245.32 KB

📤 Uploading to Supabase storage...
   📤 Uploading to Supabase: tr_000002_a1b2c3d4.jpg
   ✅ Uploaded: https://mdetucneptjlkbkzddpu.supabase.co/storage/v1/object/public/recipe-images/tr_000002_a1b2c3d4.jpg
   ✅ Image uploaded successfully!

💾 Updating recipe in Supabase database...
   ✅ Database updated for tr_000002
   ✅ Database updated successfully

📝 Updating en.json file...
   ✅ en.json updated successfully

============================================================
✨ Upload Complete!

Recipe ID:    tr_000002
Recipe Title: Mercimek Çorbası (Red Lentil Soup)
Image URL:    https://mdetucneptjlkbkzddpu.supabase.co/storage/v1/object/public/recipe-images/tr_000002_a1b2c3d4.jpg
Image Size:   245.32 KB

📋 What was updated:
   ✅ Supabase storage (recipe-images bucket)
   ✅ Supabase database (recipes table)
   ✅ Local en.json file

💡 Next steps:
   - Verify the image in your app
   - Commit the updated en.json file
   - Delete the local image from assets/ if no longer needed
```

## Error Handling

### Image file not found
```bash
❌ Error: Image file not found at /path/to/assets/images/recipe/missing.jpg
   Make sure the file exists in assets/images/recipe/ folder
```

**Solution**: Check that your image is in the correct folder with the correct filename.

### Recipe ID not found
```bash
❌ Error: Recipe with ID "invalid_id" not found in en.json
   Available IDs: tr_000001, tr_000002, tr_000003, tr_000004, tr_000005...
```

**Solution**: Use a valid recipe ID from `db/en.json`.

### Missing Supabase credentials
```bash
❌ Error: Supabase credentials not found in environment variables
```

**Solution**: Ensure your `.env` file has:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## File Locations

- **Script**: [scripts/upload-local-image.ts](upload-local-image.ts)
- **Images**: `assets/images/recipe/<filename>`
- **Recipe data**: [db/en.json](../db/en.json)
- **Supabase bucket**: `recipe-images`

## Notes

- The script generates a unique filename with a hash (e.g., `tr_000002_a1b2c3d4.jpg`)
- Images are uploaded as JPEG format
- If an image already exists, it will be overwritten (`upsert: true`)
- The script is safe to run multiple times for the same recipe

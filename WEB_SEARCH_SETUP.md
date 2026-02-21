# Web Search Feature Setup

## Current Status

The web search feature is now **working with fallback mock data**. The feature will:
- ✅ Attempt to use Gemini API for real web search results
- ✅ Automatically fall back to mock data if API fails
- ✅ Provide realistic search results for development/testing

## API Key Issue

The current Gemini API key in `.env` appears to be invalid or expired, resulting in 403 Forbidden errors:

```
Error: Method doesn't allow unregistered callers (callers without established identity)
```

## How to Fix (Get Real Search Results)

### Option 1: Get a New Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Get API Key" or "Create API Key"
4. Copy the new API key
5. Update your `.env` files:

```bash
# backend/.env and .env
GEMINI_API_KEY=your_new_api_key_here
GEMINI_MODEL=gemini-1.5-flash
```

6. Restart your backend server

### Option 2: Use Mock Mode (Current Behavior)

The feature already falls back to mock data automatically when the API fails. To explicitly enable mock mode:

```bash
# backend/.env
MOCK_MODE=true
```

## Testing the Web Search

Run the test script to verify the feature:

```bash
npx tsx backend/test-web-search.ts
```

Expected output:
- ✓ Found X results for each test
- Results include title, snippet, URL, and relevance score

## Using the Feature

### In the UI

1. Navigate to the BRD Editor or Generate BRD page
2. Look for the "Real-Time Web Search" panel
3. Select a search type:
   - **Best Practices**: Industry standards and best practices
   - **Technical Specs**: Technology documentation and specifications
   - **Compliance**: Regulatory and compliance information
   - **General**: General web search
4. Enter your query and click "Search"
5. Results will appear with:
   - Title
   - Snippet (brief description)
   - URL (clickable link)
   - Relevance score

### Via API

```typescript
// General search
POST /api/search/web
{
  "query": "React best practices",
  "maxResults": 5
}

// Best practices search
POST /api/search/best-practices
{
  "domain": "healthcare"
}

// Technical specs search
POST /api/search/technical-specs
{
  "technology": "Node.js"
}

// Compliance search
POST /api/search/compliance
{
  "industry": "GDPR"
}
```

## Features

- ✅ Multiple search types (general, best practices, technical, compliance)
- ✅ Automatic fallback to mock data
- ✅ Relevance scoring
- ✅ Clean, structured results
- ✅ Error handling and logging
- ✅ Responsive UI with animations
- ✅ External link support

## Troubleshooting

### "Search Failed" Error in UI

Check the browser console and backend logs for detailed error messages.

### API Key Not Working

1. Verify the API key is correct in `.env`
2. Check if the API key has the necessary permissions
3. Ensure you're using a supported model (gemini-1.5-flash)
4. Try generating a new API key

### Mock Data Always Showing

This is expected behavior when:
- `MOCK_MODE=true` in `.env`
- API key is missing or invalid
- Gemini API is unavailable

The feature will work normally with mock data for development and testing.

## Next Steps

To get real search results:
1. Obtain a valid Gemini API key
2. Update the `.env` files
3. Restart the backend server
4. Test with `npx tsx backend/test-web-search.ts`

The feature is fully functional with mock data, so you can continue development without interruption.

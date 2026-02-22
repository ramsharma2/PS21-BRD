# Quick Test Guide

## 🚀 Fast Testing (5 minutes)

### Option 1: Simple Project (Recommended for first test)
```bash
File: test-samples/simple-project.txt
Size: ~3 KB
Complexity: Low
Processing Time: ~30 seconds
```

**What to expect:**
- ~15 functional requirements
- ~10 non-functional requirements
- 2 stakeholders
- Clear scope definition
- Quick BRD generation

**Test this first to verify:**
- ✅ File upload works
- ✅ Text parsing works
- ✅ Extraction works
- ✅ BRD generation works
- ✅ Citations appear

### Option 2: E-Commerce Platform (Medium complexity)
```bash
File: test-samples/sample-requirements.txt
Size: ~8 KB
Complexity: Medium-High
Processing Time: ~1-2 minutes
```

**What to expect:**
- ~35 functional requirements
- ~22 non-functional requirements
- 3 stakeholders
- Detailed scope and timeline
- Comprehensive BRD

### Option 3: Healthcare Platform (High complexity)
```bash
File: test-samples/healthcare-app-requirements.txt
Size: ~12 KB
Complexity: High
Processing Time: ~2-3 minutes
```

**What to expect:**
- ~55 functional requirements
- ~32 non-functional requirements
- 3 stakeholders
- Complex compliance requirements
- Detailed regulatory section

## 📋 Testing Steps

### 1. Upload File
```
1. Navigate to http://localhost:3000
2. Click "New Project"
3. Enter project name
4. Go to "Data Ingestion"
5. Click "Upload Document"
6. Select test file
7. Click "Upload"
```

### 2. Process Project
```
1. Wait for upload to complete
2. Click "Process Project"
3. Monitor processing status
4. Check for extractions in backend logs
```

### 3. Generate BRD
```
1. Go to "Generate BRD"
2. Select template (Standard recommended)
3. Click "Generate BRD"
4. Wait for generation to complete
5. View generated BRD
```

### 4. Verify Results
```
✅ Check Scope section has content (not "No items defined")
✅ Check Requirements have citation badges [1], [2], etc.
✅ Click citation badges to see source
✅ Verify all sections are populated
✅ Check Traceability page shows RTM
```

## 🐛 Common Issues & Solutions

### Issue: "No items defined" in Scope
**Solution:** This is now fixed! Scope should always show 5 in-scope and 5 out-of-scope items.

### Issue: No citations showing
**Solution:** 
- Check backend logs for extraction IDs
- Verify citations array in BRD data
- Ensure latest code is deployed

### Issue: Processing stuck
**Solution:**
- Check backend logs for errors
- Verify GEMINI_API_KEY is set
- Try with MOCK_MODE=true for testing

### Issue: BRD generation fails
**Solution:**
- Check if extractions exist
- Verify API key is valid
- Check backend logs for specific error

## 🔍 What to Look For

### Good Signs ✅
- Scope has 5+ items in each category
- Requirements show citation badges
- Citations are clickable and show source
- All BRD sections have content
- Traceability matrix is populated
- No "undefined" or "null" values

### Bad Signs ❌
- "No items defined" in any section
- No citation badges on requirements
- Empty sections in BRD
- Processing status stuck
- Error messages in console

## 📊 Expected Processing Times

| File | Size | Extractions | Processing | BRD Gen | Total |
|------|------|-------------|------------|---------|-------|
| Simple | 3 KB | ~25 | 30s | 20s | ~50s |
| E-Commerce | 8 KB | ~60 | 1m | 40s | ~1m 40s |
| Healthcare | 12 KB | ~90 | 2m | 1m | ~3m |

*Times may vary based on API response times*

## 🎯 Testing Checklist

### Basic Functionality
- [ ] File upload successful
- [ ] Text parsing works
- [ ] Extractions created
- [ ] BRD generation completes
- [ ] BRD displays correctly

### Scope Section
- [ ] In Scope has 5+ items
- [ ] Out of Scope has 5+ items
- [ ] Content is meaningful (not generic)
- [ ] No "No items defined" message

### Citations
- [ ] Requirements show citation badges
- [ ] Citation numbers are sequential [1], [2], [3]
- [ ] Clicking citation opens dialog
- [ ] Dialog shows source content
- [ ] Source information is correct

### All Sections
- [ ] Executive Summary populated
- [ ] Business Objectives listed
- [ ] Stakeholders identified
- [ ] Functional Requirements with citations
- [ ] Non-Functional Requirements with citations
- [ ] Assumptions listed
- [ ] Constraints defined
- [ ] Risks identified
- [ ] Success Metrics defined
- [ ] Timeline/Milestones shown
- [ ] Glossary has terms

### Traceability
- [ ] RTM page loads
- [ ] Requirements linked to sources
- [ ] Can navigate from requirement to source
- [ ] Source details are accurate

## 💡 Pro Tips

1. **Start Simple**: Use `simple-project.txt` for your first test
2. **Check Logs**: Backend logs show detailed extraction info
3. **Use Mock Mode**: Set `MOCK_MODE=true` to test without API calls
4. **Clear Data**: Delete project and recreate if testing changes
5. **Browser Console**: Check for frontend errors in browser console

## 🔄 Quick Reset

If you need to start fresh:

```bash
# Backend
cd backend
rm src/db/dev.db
npx prisma migrate reset --force
npx prisma migrate deploy

# Frontend
# Just refresh the page
```

## 📞 Need Help?

Check these files for more info:
- `WEB_SEARCH_SETUP.md` - Web search feature setup
- `WEB_SEARCH_FIX_SUMMARY.md` - Recent fixes
- `README.md` - Main project documentation

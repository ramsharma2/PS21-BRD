# Chunk Ranking UI - User Guide

## Accessing Chunk Ranking

You can now see and interact with chunk rankings in your BRDify application!

### How to Access:

1. **From the Sidebar**: 
   - Open any project
   - Click on "Chunk Ranking" in the sidebar (under "Current Project" section)
   - Icon: TrendingUp 📈

2. **Direct URL**:
   ```
   http://localhost:3000/projects/{projectId}/ranking
   ```

## What You'll See

### 1. Statistics Dashboard

At the top of the page, you'll see 4 key metrics:

- **Total Chunks**: All chunks in the project
- **Relevant Chunks**: Chunks marked as relevant (after noise filtering)
- **Average Score**: Average relevance score across all chunks
- **High Quality**: Number of chunks with score 0.8-1.0

### 2. Score Distribution Chart

A visual bar chart showing how chunks are distributed across score ranges:
- 0.0-0.2 (Very Low)
- 0.2-0.4 (Low)
- 0.4-0.6 (Medium)
- 0.6-0.8 (High)
- 0.8-1.0 (Very High)

### 3. Re-ranking Configuration

Configure how chunks should be ranked:

**Category Selection:**
- All Chunks (default)
- Functional Requirements
- Non-Functional Requirements
- Business Objectives
- Stakeholders
- Constraints
- Risks
- Timeline

**Top N Chunks:**
- Select how many top chunks to retrieve (1-200)
- Default: 50

**For "All Chunks" category, you can also configure:**

- **Semantic Query**: Keywords for semantic matching
  - Example: "business requirements, functional requirements, objectives"
  
- **Weight Sliders** (0.0 - 1.0):
  - Relevance Weight (default: 0.5)
  - Semantic Weight (default: 0.3)
  - Diversity Weight (default: 0.2)

### 4. Action Buttons

- **Re-rank Chunks**: Run the ranking algorithm with your configuration
- **Batch Re-rank & Update DB**: Re-rank all chunks and update the database (permanent)

### 5. Ranked Results

After clicking "Re-rank Chunks", you'll see:

For each chunk:
- **Rank Number**: Position in the ranking (1, 2, 3, etc.)
- **Final Score**: Combined weighted score
- **Individual Scores**:
  - Relevance: How relevant to business requirements
  - Semantic: How similar to your query
  - Diversity: How different from other chunks
- **Content Preview**: First ~200 characters of the chunk

## Use Cases

### 1. Find Best Chunks for BRD Generation
```
Category: All Chunks
Top N: 50
Relevance Weight: 0.5
Semantic Weight: 0.3
Diversity Weight: 0.2
```

### 2. Focus on Functional Requirements
```
Category: Functional Requirements
Top N: 20
```

### 3. Prioritize Semantic Similarity
```
Category: All Chunks
Top N: 30
Query: "user authentication security login"
Relevance Weight: 0.3
Semantic Weight: 0.6
Diversity Weight: 0.1
```

### 4. Maximize Content Diversity
```
Category: All Chunks
Top N: 40
Relevance Weight: 0.4
Semantic Weight: 0.2
Diversity Weight: 0.4
```

## Tips

1. **Start with Statistics**: Check the score distribution to understand your data quality

2. **Use Category-Specific Ranking**: When you need chunks for a specific BRD section

3. **Adjust Weights**: 
   - High relevance weight = trust the noise filter
   - High semantic weight = match specific keywords
   - High diversity weight = avoid redundant content

4. **Batch Update**: Use "Batch Re-rank & Update DB" to permanently improve chunk scores for future BRD generations

5. **Experiment**: Try different configurations to see what works best for your project

## Backend API

The UI calls these endpoints:

- `GET /api/ranking/:projectId/stats` - Get statistics
- `POST /api/ranking/:projectId/rerank` - Re-rank chunks
- `POST /api/ranking/:projectId/batch-rerank` - Batch update
- `POST /api/ranking/:projectId/category/:category` - Category-specific ranking

## Testing

To test the backend directly:

```bash
cd backend
npx tsx --env-file=.env test-chunk-ranking.ts
```

This will show you:
- Ranking statistics
- Top 10 ranked chunks
- Category-specific results
- Batch re-ranking process

## Troubleshooting

**No chunks showing?**
- Make sure you've processed the project first (Data Ingestion → Process)
- Check that chunks were marked as relevant

**Low scores across the board?**
- Your source documents might not contain clear requirements
- Try adjusting the noise filter threshold
- Consider adding more specific source documents

**Ranking takes too long?**
- Reduce the "Top N" value
- Use category-specific ranking instead of "All Chunks"
- Semantic similarity calculation requires embeddings (can be slow for many chunks)

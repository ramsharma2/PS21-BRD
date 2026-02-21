# Chunk Ranking Feature

## Overview

The Chunk Ranking system intelligently re-ranks and prioritizes chunks within a project based on multiple criteria to ensure the most relevant and diverse content is used for BRD generation.

## Features

### 1. Multi-Criteria Ranking

Chunks are ranked based on three key factors:

- **Relevance Score** (default weight: 0.5)
  - Based on initial noise filtering
  - Measures how relevant the chunk is to business requirements

- **Semantic Score** (default weight: 0.3)
  - Calculated using embedding similarity
  - Measures how semantically similar the chunk is to a target query
  - Uses cosine similarity between embeddings

- **Diversity Score** (default weight: 0.2)
  - Prevents redundant information
  - Measures how different the chunk is from previously selected chunks
  - Ensures variety in the selected content

### 2. Configurable Selection

- Select top N chunks from X total chunks
- Customize weights for each ranking criterion
- Category-specific ranking (functional requirements, objectives, etc.)

### 3. Batch Processing

- Re-rank all chunks in a project
- Update chunk priorities in the database
- Optimize for large-scale processing

## API Endpoints

### 1. Re-rank Chunks

```http
POST /api/ranking/:projectId/rerank
```

**Request Body:**
```json
{
  "topN": 50,
  "relevanceWeight": 0.5,
  "semanticWeight": 0.3,
  "diversityWeight": 0.2,
  "query": "business requirements, functional requirements"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRanked": 50,
    "chunks": [
      {
        "id": "chunk_id",
        "content": "chunk content preview...",
        "rank": 1,
        "finalScore": 0.892,
        "relevanceScore": 0.95,
        "semanticScore": 0.88,
        "diversityScore": 0.75
      }
    ]
  }
}
```

### 2. Batch Re-rank and Update

```http
POST /api/ranking/:projectId/batch-rerank
```

**Request Body:**
```json
{
  "topN": 100
}
```

Updates chunk relevance scores in the database based on re-ranking.

### 3. Get Ranking Statistics

```http
GET /api/ranking/:projectId/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalChunks": 150,
    "relevantChunks": 120,
    "averageScore": 0.72,
    "scoreDistribution": [
      { "range": "0.0-0.2", "count": 5 },
      { "range": "0.2-0.4", "count": 15 },
      { "range": "0.4-0.6", "count": 30 },
      { "range": "0.6-0.8", "count": 45 },
      { "range": "0.8-1.0", "count": 25 }
    ]
  }
}
```

### 4. Category-Specific Ranking

```http
POST /api/ranking/:projectId/category/:category
```

**Categories:**
- `functional_req` - Functional requirements
- `nonfunctional_req` - Non-functional requirements
- `objective` - Business objectives
- `stakeholder` - Stakeholder information
- `constraint` - Constraints and limitations
- `risk` - Risks and challenges
- `timeline` - Timeline and milestones

**Request Body:**
```json
{
  "topN": 20
}
```

## Usage Examples

### Example 1: Basic Re-ranking

```typescript
// Re-rank chunks with default settings
const rankedChunks = await chunkRankingService.reRankChunks(projectId, {
  topN: 50,
  relevanceWeight: 0.5,
  semanticWeight: 0.3,
  diversityWeight: 0.2,
});
```

### Example 2: Prioritize Semantic Similarity

```typescript
// Emphasize semantic similarity for specific requirements
const rankedChunks = await chunkRankingService.reRankChunks(projectId, {
  topN: 30,
  relevanceWeight: 0.3,
  semanticWeight: 0.6,  // Higher weight
  diversityWeight: 0.1,
  query: 'user authentication and security requirements',
});
```

### Example 3: Maximize Diversity

```typescript
// Prioritize diverse content to avoid redundancy
const rankedChunks = await chunkRankingService.reRankChunks(projectId, {
  topN: 40,
  relevanceWeight: 0.4,
  semanticWeight: 0.2,
  diversityWeight: 0.4,  // Higher weight
});
```

### Example 4: Category-Specific Ranking

```typescript
// Get top chunks for functional requirements
const functionalChunks = await chunkRankingService.getRankedChunksForCategory(
  projectId,
  'functional_req',
  20
);
```

### Example 5: Batch Processing

```typescript
// Re-rank and update all chunks in database
await chunkRankingService.batchReRankAndUpdate(projectId, 100);
```

## Algorithm Details

### 1. Score Calculation

For each chunk, the final score is calculated as:

```
finalScore = (relevanceScore × relevanceWeight) + 
             (semanticScore × semanticWeight) + 
             (diversityScore × diversityWeight)
```

### 2. Semantic Similarity

Uses cosine similarity between embeddings:

```
similarity = (vec1 · vec2) / (||vec1|| × ||vec2||)
```

### 3. Diversity Calculation

Diversity score for chunk i:

```
diversityScore[i] = 1 - max(similarity(chunk[i], chunk[j])) for all j < i
```

Higher diversity score means the chunk is less similar to previously selected chunks.

### 4. Normalization

All scores are normalized to [0, 1] range before weighting:

```
normalizedScore = (score - min) / (max - min)
```

## Testing

Run the test script to see chunk ranking in action:

```bash
cd backend
npx tsx --env-file=.env test-chunk-ranking.ts
```

## Integration with BRD Generation

The chunk ranking system can be integrated into the BRD generation process:

1. **Pre-processing**: Re-rank chunks before extraction
2. **Category-specific**: Use ranked chunks for each BRD section
3. **Quality improvement**: Select only high-scoring chunks
4. **Efficiency**: Process fewer, more relevant chunks

## Configuration

Environment variables (optional):

```env
# Chunk ranking defaults
CHUNK_RANKING_TOP_N=50
CHUNK_RANKING_RELEVANCE_WEIGHT=0.5
CHUNK_RANKING_SEMANTIC_WEIGHT=0.3
CHUNK_RANKING_DIVERSITY_WEIGHT=0.2
```

## Performance Considerations

- **Embedding calculation**: Cached in database
- **Batch processing**: Recommended for large projects (>100 chunks)
- **Category-specific**: More efficient than full re-ranking
- **Score updates**: Async batch updates to avoid blocking

## Future Enhancements

1. **Machine Learning**: Train custom ranking models
2. **User Feedback**: Incorporate user ratings into ranking
3. **Temporal Ranking**: Consider recency of information
4. **Context-Aware**: Rank based on project-specific context
5. **A/B Testing**: Compare different ranking strategies

# Real-Time Web Search Feature

## Overview
The Web Search feature enhances BRD generation by providing real-time access to current industry standards, best practices, technical specifications, and compliance information.

## Features

### 1. Search Types

#### General Web Search
- Free-form search for any topic
- Returns top 5 relevant results
- Includes title, snippet, URL, and relevance score

#### Best Practices Search
- Domain/industry-specific best practices
- Current standards and methodologies
- Industry trends and recommendations

#### Technical Specifications Search
- Technology-specific documentation
- Framework requirements
- API specifications and standards

#### Compliance Search
- Regulatory requirements
- Industry compliance standards
- Legal and security requirements

### 2. Integration Points

#### BRD Editor
- Web Search Panel appears in BRD Editor
- Search results can inform requirement writing
- Real-time validation against industry standards

#### Requirement Enrichment
- Automatically enhance requirements with web context
- Add citations from authoritative sources
- Validate against current best practices

## API Endpoints

### POST /api/search/web
General web search
```json
{
  "query": "string",
  "maxResults": 5
}
```

### POST /api/search/best-practices
Search for best practices
```json
{
  "domain": "healthcare | fintech | e-commerce"
}
```

### POST /api/search/technical-specs
Search for technical specifications
```json
{
  "technology": "React | Node.js | AWS"
}
```

### POST /api/search/compliance
Search for compliance information
```json
{
  "industry": "GDPR | HIPAA | SOC 2"
}
```

### POST /api/search/enrich-requirements
Enrich requirements with web context
```json
{
  "requirements": ["string array"]
}
```

## Usage Examples

### 1. Search for Best Practices
```typescript
const results = await api.post('/api/search/best-practices', {
  domain: 'healthcare'
});
```

### 2. Search Technical Specs
```typescript
const results = await api.post('/api/search/technical-specs', {
  technology: 'React 18'
});
```

### 3. Enrich Requirements
```typescript
const enriched = await api.post('/api/search/enrich-requirements', {
  requirements: [
    'User authentication with OAuth 2.0',
    'HIPAA compliant data storage'
  ]
});
```

## Components

### WebSearchPanel
React component for web search interface
- Located: `frontend/src/components/brd/WebSearchPanel.tsx`
- Props:
  - `projectName?: string` - Current project name
  - `onResultsFound?: (results) => void` - Callback when results are found

### WebSearchService
Backend service for web search
- Located: `backend/src/services/webSearchService.ts`
- Uses Gemini AI for intelligent search results
- Methods:
  - `search(query, maxResults)` - General search
  - `searchBestPractices(domain)` - Best practices search
  - `searchTechnicalSpecs(technology)` - Technical specs search
  - `searchCompliance(industry)` - Compliance search
  - `enrichRequirements(requirements)` - Enrich requirements

## Configuration

### Environment Variables
```env
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.0-flash-exp
```

## Benefits

1. **Current Information**: Access to latest industry standards and best practices
2. **Validation**: Verify requirements against authoritative sources
3. **Compliance**: Ensure regulatory requirements are met
4. **Quality**: Improve BRD quality with expert knowledge
5. **Citations**: Add credible sources to requirements

## Future Enhancements

1. **Real-time Grounding**: Integrate Google Search API for live web results
2. **Source Caching**: Cache frequently searched topics
3. **Auto-enrichment**: Automatically enrich all requirements during generation
4. **Custom Sources**: Allow users to add preferred authoritative sources
5. **Conflict Detection**: Identify conflicts between requirements and standards

## Notes

- Current implementation uses Gemini AI to generate search-like results
- For production, consider integrating actual Google Search API
- Rate limiting is recommended for API calls
- Results are AI-generated and should be verified

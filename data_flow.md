"## 📊 Data Flow Example

### Input
```
Source 1 (Email): "Hi team, we need OAuth 2.0 authentication. Thanks!"
Source 2 (Slack): "The system must support 1000 concurrent users"
Source 3 (Meeting): "Let's meet at 3pm to discuss the timeline"
Source 4 (Doc): "Performance requirement: page load < 2 seconds"
```

### Processing Pipeline

**Step 1: Chunking**
```
Chunk 1: "Hi team, we need OAuth 2.0 authentication. Thanks!"
Chunk 2: "The system must support 1000 concurrent users"
Chunk 3: "Let's meet at 3pm to discuss the timeline"
Chunk 4: "Performance requirement: page load < 2 seconds"
```

**Step 2: Noise Filtering**
```
Chunk 1: NOISE (greeting + thanks) → Filtered out
Chunk 2: RELEVANT (requirement) → Keep
Chunk 3: NOISE (scheduling) → Filtered out
Chunk 4: RELEVANT (requirement) → Keep
```

**Step 3: Information Extraction**
```
From Chunk 2:
{
  category: "nonfunctional_req",
  content: "System must support 1000 concurrent users",
  priority: "must_have",
  citations: [Source 2, Chunk 2]
}

From Chunk 4:
{
  category: "nonfunctional_req",
  content: "Page load time must be under 2 seconds",
  priority: "must_have",
  citations: [Source 4, Chunk 4]
}
```

**Step 4: BRD Generation**
```
## Non-Functional Requirements

### Performance
- **NFR-001**: System must support 1000 concurrent users
  - Priority: Must Have
  - Source: Slack conversation (2024-01-15)
  
- **NFR-002**: Page load time must be under 2 seconds
  - Priority: Must Have
  - Source: Requirements Document (Section 3.2)
```"## 📊 Data Flow Example

### Input
```
Source 1 (Email): "Hi team, we need OAuth 2.0 authentication. Thanks!"
Source 2 (Slack): "The system must support 1000 concurrent users"
Source 3 (Meeting): "Let's meet at 3pm to discuss the timeline"
Source 4 (Doc): "Performance requirement: page load < 2 seconds"
```

### Processing Pipeline

**Step 1: Chunking**
```
Chunk 1: "Hi team, we need OAuth 2.0 authentication. Thanks!"
Chunk 2: "The system must support 1000 concurrent users"
Chunk 3: "Let's meet at 3pm to discuss the timeline"
Chunk 4: "Performance requirement: page load < 2 seconds"
```

**Step 2: Noise Filtering**
```
Chunk 1: NOISE (greeting + thanks) → Filtered out
Chunk 2: RELEVANT (requirement) → Keep
Chunk 3: NOISE (scheduling) → Filtered out
Chunk 4: RELEVANT (requirement) → Keep
```

**Step 3: Information Extraction**
```
From Chunk 2:
{
  category: "nonfunctional_req",
  content: "System must support 1000 concurrent users",
  priority: "must_have",
  citations: [Source 2, Chunk 2]
}

From Chunk 4:
{
  category: "nonfunctional_req",
  content: "Page load time must be under 2 seconds",
  priority: "must_have",
  citations: [Source 4, Chunk 4]
}
```

**Step 4: BRD Generation**
```
## Non-Functional Requirements

### Performance
- **NFR-001**: System must support 1000 concurrent users
  - Priority: Must Have
  - Source: Slack conversation (2024-01-15)
  
- **NFR-002**: Page load time must be under 2 seconds
  - Priority: Must Have
  - Source: Requirements Document (Section 3.2)
```
"
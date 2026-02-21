# BRD Template Selection Feature

## Overview
Users can now choose from 4 different BRD templates before generating their document, allowing customization based on project type and needs.

## Available Templates

### 1. 📄 Standard BRD (Default)
**Best for:** Most projects requiring comprehensive documentation
**Sections:** 12 sections
- Executive Summary
- Business Objectives
- Stakeholder Analysis
- Scope (In/Out)
- Functional Requirements
- Non-Functional Requirements
- Assumptions & Dependencies
- Constraints
- Risks & Open Questions
- Success Metrics
- Timeline & Milestones
- Glossary

### 2. ⚡ Agile/Lean BRD
**Best for:** Agile teams, startups, iterative development
**Sections:** 7 sections (lightweight)
- Executive Summary
- Business Objectives
- Stakeholder Analysis
- Functional Requirements
- Non-Functional Requirements
- Success Metrics
- Timeline & Milestones

### 3. ⚙️ Technical BRD
**Best for:** Complex technical projects, system integrations
**Sections:** 10 sections (technical focus)
- Executive Summary
- Business Objectives
- Scope (In/Out)
- Functional Requirements
- Non-Functional Requirements
- Assumptions & Dependencies
- Constraints
- Risks & Open Questions
- Timeline & Milestones
- Glossary

### 4. 📋 Minimal BRD
**Best for:** Small projects, POCs, quick documentation
**Sections:** 5 sections (essential only)
- Executive Summary
- Business Objectives
- Functional Requirements
- Non-Functional Requirements
- Timeline & Milestones

## How It Works

### Backend
1. **Template Definitions** (`backend/src/utils/brdTemplates.ts`)
   - Defines 4 templates with their sections
   - Helper functions to check which sections to generate

2. **BRD Generator Service** (`backend/src/services/brdGeneratorService.ts`)
   - Updated to accept `templateId` parameter
   - Only generates sections included in selected template
   - Reduces generation time for lighter templates

3. **API Route** (`backend/src/routes/brd.ts`)
   - POST `/api/brd/generate/:projectId` now accepts `templateId` in body
   - Defaults to 'standard' if not provided

### Frontend
1. **Template Selector Component** (`frontend/src/components/brd/TemplateSelector.tsx`)
   - Beautiful card-based UI for template selection
   - Shows template icon, name, description, and included sections
   - Visual feedback for selected template

2. **Generate BRD Page** (`frontend/src/pages/GenerateBRD.tsx`)
   - Displays template selector before generation
   - Shows loading state during generation
   - Redirects to BRD editor after completion

## Usage

### For Users
1. Navigate to project
2. Click "Generate BRD"
3. Choose template from 4 options
4. Click "Generate BRD with [Template Name]"
5. Wait for AI to generate document
6. View/edit generated BRD

### For Developers

**Backend API:**
```typescript
POST /api/brd/generate/:projectId
Body: {
  templateId: 'standard' | 'agile' | 'technical' | 'minimal'
}
```

**Frontend Usage:**
```tsx
import { TemplateSelector } from '@/components/brd/TemplateSelector';

<TemplateSelector 
  onSelect={(templateId) => generateBRD(templateId)}
  onCancel={() => navigate('/projects')}
/>
```

## Benefits

1. **Flexibility:** Choose the right level of detail for your project
2. **Time Savings:** Lighter templates generate faster
3. **Focus:** Only get the sections you need
4. **Customization:** Different templates for different project types
5. **User Experience:** Clear visual selection process

## Future Enhancements

- Custom template creation
- Save template preferences per user
- Template preview before generation
- Export templates as JSON
- Share templates across teams

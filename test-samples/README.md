# Test Sample Files for BRD Generation

This directory contains sample requirement documents for testing the BRD generation system.

## Available Samples

### 1. E-Commerce Platform Modernization
**File:** `sample-requirements.txt`

**Project Type:** E-commerce / Retail
**Complexity:** Medium-High
**Key Features:**
- User authentication and social login
- Product catalog with advanced search
- Shopping cart and checkout
- Order management
- Admin dashboard
- Performance and security requirements

**Best for testing:**
- Functional requirements extraction
- Non-functional requirements (performance, security, scalability)
- Stakeholder analysis
- Risk identification
- Timeline and milestone tracking

### 2. TeleMed Healthcare Platform
**File:** `healthcare-app-requirements.txt`

**Project Type:** Healthcare / Telemedicine
**Complexity:** High
**Key Features:**
- HIPAA compliance requirements
- Video consultation system
- Electronic Health Records (EHR)
- E-prescribing
- Provider credentialing
- Complex security and regulatory requirements

**Best for testing:**
- Compliance and regulatory requirements
- Complex security requirements
- Interoperability standards
- High reliability and availability requirements
- Detailed stakeholder requirements

### 3. Simple Task Management App
**File:** `simple-project.txt`

**Project Type:** Productivity / Task Management
**Complexity:** Low
**Key Features:**
- Basic CRUD operations
- User management
- Dashboard and filtering
- Email notifications
- Simple requirements structure

**Best for testing:**
- Quick validation of basic functionality
- First-time testing
- Simple extraction and BRD generation
- Fast processing time (~30 seconds)

### 4. Mobile App Email Thread
**File:** `sample-email-thread.txt`

**Project Type:** Mobile Application
**Format:** Email conversation thread
**Complexity:** Medium
**Key Features:**
- Multi-stakeholder email discussion
- Requirements emerging through conversation
- Technical and design perspectives
- Scope negotiation and decisions
- Phase planning

**Best for testing:**
- Email parsing functionality
- Extracting requirements from conversations
- Stakeholder identification from email headers
- Handling threaded discussions
- Scope changes and decisions tracking

### 5. Customer Support Portal Email
**File:** `customer-support-email.txt`

**Project Type:** Customer Support / Ticketing System
**Format:** Email conversation
**Complexity:** Medium-High
**Key Features:**
- Detailed feature requirements
- Technical architecture discussion
- Risk assessment
- Budget breakdown
- Resource allocation

**Best for testing:**
- Email format parsing
- Technical requirements extraction
- Risk and dependency identification
- Budget and resource constraints
- Multi-party email threads

## How to Use

### Upload via UI
1. Start the frontend application
2. Create a new project
3. Go to Data Ingestion page
4. Upload one of the `.txt` files
5. Process the project
6. Generate BRD

### Upload via API
```bash
# Upload sample file
curl -X POST http://localhost:3001/api/ingestion/upload \
  -F "file=@test-samples/sample-requirements.txt" \
  -F "projectId=YOUR_PROJECT_ID" \
  -F "sourceLabel=Requirements Document"
```

### Convert to PDF (Optional)

If you need PDF versions for testing PDF parsing:

**Using LibreOffice (Mac/Linux):**
```bash
# Install LibreOffice if not already installed
# Mac: brew install --cask libreoffice
# Linux: sudo apt-get install libreoffice

# Convert to PDF
libreoffice --headless --convert-to pdf test-samples/sample-requirements.txt --outdir test-samples/
libreoffice --headless --convert-to pdf test-samples/healthcare-app-requirements.txt --outdir test-samples/
```

**Using Python (Cross-platform):**
```bash
# Install required package
pip install fpdf2

# Run the conversion script
python test-samples/convert-to-pdf.py
```

**Using Online Tools:**
- Upload the .txt file to https://www.online-convert.com/
- Select "Convert to PDF"
- Download the converted file

## Expected Extraction Results

### E-Commerce Sample
- **Functional Requirements:** ~30-40 items
- **Non-Functional Requirements:** ~20-25 items
- **Stakeholders:** 3 (Product Owner, Tech Lead, UX Designer)
- **Business Objectives:** 5
- **Risks:** 5
- **Constraints:** 5
- **Assumptions:** 6

### Healthcare Sample
- **Functional Requirements:** ~50-60 items
- **Non-Functional Requirements:** ~30-35 items
- **Stakeholders:** 3 (CMO, CTO, Patient Advocate)
- **Business Objectives:** 5
- **Risks:** 7
- **Compliance Requirements:** 10+
- **Success Metrics:** 10

### Simple Task Management
- **Functional Requirements:** ~15-20 items
- **Non-Functional Requirements:** ~10-12 items
- **Stakeholders:** 2 (Product Manager, Developer)
- **Business Objectives:** 4
- **Risks:** 2
- **Constraints:** 4
- **Success Metrics:** 4

### Mobile App Email Thread
- **Functional Requirements:** ~25-30 items
- **Non-Functional Requirements:** ~15-20 items
- **Stakeholders:** 4 (Product Manager, Engineer, Designer, Backend Lead)
- **Business Objectives:** 3
- **Risks:** 3
- **Scope Decisions:** Multiple in/out of scope items
- **Timeline:** Phased approach

### Customer Support Email
- **Functional Requirements:** ~35-40 items
- **Non-Functional Requirements:** ~18-22 items
- **Stakeholders:** 3 (Support Manager, Engineering Lead, PM)
- **Business Objectives:** 5
- **Risks:** 6 (categorized by priority)
- **Budget:** Detailed breakdown
- **Success Metrics:** 6

## Testing Checklist

- [ ] File upload successful
- [ ] Text parsing extracts content correctly
- [ ] Requirements categorized properly (functional vs non-functional)
- [ ] Stakeholders identified and analyzed
- [ ] Business objectives extracted
- [ ] Risks and constraints captured
- [ ] Timeline and milestones parsed
- [ ] BRD generation completes successfully
- [ ] Citations link back to source document
- [ ] All BRD sections populated with relevant content
- [ ] Scope section has meaningful in/out of scope items
- [ ] Success metrics captured

## Troubleshooting

**Issue:** No extractions found
- Check if the file was uploaded successfully
- Verify the project status is "processing" or "processed"
- Check backend logs for extraction errors

**Issue:** BRD generation fails
- Ensure GEMINI_API_KEY is set in backend/.env
- Check if extractions exist for the project
- Review backend logs for API errors

**Issue:** Citations not showing
- Verify extractions have valid IDs
- Check if citations array is populated in BRD data
- Ensure frontend is loading extractions correctly

## Additional Test Scenarios

### Minimal Requirements
Create a simple text file with just a few requirements to test minimal data handling.

### Mixed Content
Combine meeting notes, emails, and formal requirements in one document.

### Large Document
Test with a document containing 100+ requirements to verify performance.

### Special Characters
Include requirements with special characters, emojis, and formatting to test parsing robustness.

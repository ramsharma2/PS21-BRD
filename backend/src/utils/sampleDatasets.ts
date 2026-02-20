/**
 * Built-in sample datasets for hackathon demo
 * These allow the demo to work instantly without downloading the full datasets
 */

export interface SampleEmail {
    from: string;
    to: string;
    subject: string;
    date: string;
    body: string;
    folder: string;
}

export interface SampleTranscript {
    title: string;
    participants: string[];
    content: string;
}

// ============================================
// ENRON-STYLE SAMPLE EMAILS
// Realistic business emails with requirements buried in noise
// ============================================

export const SAMPLE_ENRON_EMAILS: SampleEmail[] = [
    // NOISE - should be filtered
    {
        from: 'sarah.jones@company.com',
        to: 'team@company.com',
        subject: 'Lunch tomorrow?',
        date: 'Mon, 15 Jan 2001 09:15:00 -0600',
        folder: 'inbox',
        body: `Hey everyone,

Anyone up for lunch at the Italian place on Main St tomorrow around noon?
Let me know!

Sarah`,
    },
    // SIGNAL - project requirements
    {
        from: 'john.smith@company.com',
        to: 'dev-team@company.com',
        subject: 'Re: Energy Trading Platform - Requirements Update',
        date: 'Tue, 16 Jan 2001 14:32:00 -0600',
        folder: 'projects/trading-platform',
        body: `Team,

Following up on yesterday's call with the stakeholders. Here are the confirmed requirements for Phase 1:

1. The system MUST support real-time price feeds from at least 5 external data providers simultaneously.
2. Trade execution latency must be under 500ms for 99% of transactions.
3. The platform must handle a minimum of 10,000 concurrent users during peak trading hours.
4. All trades must be logged with full audit trail for regulatory compliance (FERC requirements).
5. The system must support multi-currency transactions (USD, EUR, GBP at minimum).

Risk flagged by legal: We need to ensure the system complies with FERC Order 2000 before go-live. This is a blocker.

Timeline: Phase 1 delivery expected by Q3 2001. We need to finalize the architecture by end of January.

Please review and confirm by Friday.

John Smith
VP Engineering`,
    },
    // NOISE - auto-reply
    {
        from: 'auto-reply@company.com',
        to: 'john.smith@company.com',
        subject: 'Out of Office: Re: Energy Trading Platform',
        date: 'Tue, 16 Jan 2001 14:35:00 -0600',
        folder: 'sent',
        body: `I am out of office until January 22nd. For urgent matters please contact my assistant.`,
    },
    // SIGNAL - stakeholder feedback
    {
        from: 'mary.chen@company.com',
        to: 'john.smith@company.com',
        subject: 'Stakeholder Review - Trading Platform UI',
        date: 'Wed, 17 Jan 2001 10:05:00 -0600',
        folder: 'projects/trading-platform',
        body: `John,

Had a productive session with the traders this morning. Key feedback:

MUST HAVE for launch:
- Dashboard must show portfolio P&L in real-time (traders said this is non-negotiable)
- Risk alerts must be configurable per trader, not just system-wide
- Mobile access is required - traders need to monitor positions from their phones
- Export to Excel is mandatory for end-of-day reporting

NICE TO HAVE (Phase 2):
- Automated hedging suggestions
- Integration with Bloomberg terminal

The traders were very clear: if the real-time P&L isn't there on day one, they won't use the system.

Also, the compliance team flagged that we need a full audit log accessible to regulators within 24 hours of any request.

Mary Chen
Product Manager`,
    },
    // SIGNAL - technical decision
    {
        from: 'bob.wilson@company.com',
        to: 'dev-team@company.com',
        subject: 'Architecture Decision: Database Selection',
        date: 'Thu, 18 Jan 2001 16:20:00 -0600',
        folder: 'projects/trading-platform',
        body: `Dev Team,

After evaluating Oracle, SQL Server, and PostgreSQL, we've decided to go with Oracle 9i for the following reasons:
- Better support for high-frequency transaction workloads
- Existing enterprise license
- DBA team already has Oracle expertise

This decision is final and approved by the CTO.

Non-functional requirements confirmed:
- Database must support 99.99% uptime (4 nines)
- Backup and recovery RTO: 4 hours, RPO: 1 hour
- Data retention: 7 years for all trade records

Action items:
- Bob: Set up Oracle dev environment by Jan 22
- Sarah: Update architecture docs by Jan 25
- Team: Review Oracle connection pooling options

Bob Wilson
Lead Architect`,
    },
    // NOISE - newsletter
    {
        from: 'newsletter@industry.com',
        to: 'john.smith@company.com',
        subject: 'Energy Industry Weekly Newsletter - Jan 2001',
        date: 'Fri, 19 Jan 2001 08:00:00 -0600',
        folder: 'inbox',
        body: `ENERGY INDUSTRY WEEKLY
        
Top stories this week:
- Natural gas prices hit record highs
- FERC announces new regulations
- Industry conference next month

Click here to read more...`,
    },
    // SIGNAL - timeline and scope
    {
        from: 'lisa.park@company.com',
        to: 'stakeholders@company.com',
        subject: 'Project Scope Confirmation - Trading Platform v2',
        date: 'Mon, 22 Jan 2001 09:00:00 -0600',
        folder: 'projects/trading-platform',
        body: `All,

Following the steering committee meeting on Friday, here is the confirmed scope for the Trading Platform v2:

IN SCOPE:
- Real-time trade execution engine
- Portfolio management dashboard
- Risk management module with configurable alerts
- Regulatory reporting (FERC, CFTC)
- Mobile web interface (iOS and Android browsers)
- Integration with 5 data providers: Reuters, Bloomberg, ICE, CME, NYMEX

OUT OF SCOPE (deferred to v3):
- Automated trading algorithms
- Machine learning price prediction
- Legacy system migration

TIMELINE:
- Jan 31: Architecture finalized
- Feb 28: Core trading engine complete
- Apr 30: Dashboard and reporting complete
- Jun 30: UAT and compliance testing
- Aug 1: Go-live

BUDGET: $4.2M approved by board

This is the final scope. Any changes require steering committee approval.

Lisa Park
Program Manager`,
    },
    // SIGNAL - security requirements
    {
        from: 'security@company.com',
        to: 'dev-team@company.com',
        subject: 'Security Requirements for Trading Platform',
        date: 'Tue, 23 Jan 2001 11:30:00 -0600',
        folder: 'projects/trading-platform',
        body: `Dev Team,

Security review complete. The following requirements are MANDATORY before go-live:

Authentication & Authorization:
- Multi-factor authentication required for all users
- Role-based access control (Trader, Risk Manager, Admin, Auditor roles)
- Session timeout after 15 minutes of inactivity
- All API endpoints must require authentication

Data Security:
- All data in transit must use TLS 1.2 or higher
- Sensitive data at rest must be encrypted (AES-256)
- PII data must be masked in logs

Audit & Compliance:
- All user actions must be logged with timestamp, user ID, and IP
- Logs must be tamper-proof and retained for 7 years
- System must support regulatory audit access within 24 hours

Penetration testing must be completed before UAT.

Security Team`,
    },
];

// ============================================
// AMI-STYLE SAMPLE MEETING TRANSCRIPTS
// ============================================

export const SAMPLE_AMI_TRANSCRIPTS: SampleTranscript[] = [
    {
        title: 'Trading Platform - Kickoff Meeting',
        participants: ['PM', 'ID', 'ME', 'UI'],
        content: `Trading Platform - Kickoff Meeting
Date: January 15, 2001
Participants: PM (Project Manager), ID (Industrial Designer), ME (Marketing Executive), UI (UI Designer)

PM: Alright, let's get started. The goal of today's meeting is to align on the core requirements for the new trading platform. We have a hard deadline of August 1st for go-live.

ME: From a market perspective, we need to make sure traders can see their positions in real-time. That's the number one ask from our sales team. If we don't have real-time P&L, traders won't switch from their current tools.

PM: Agreed. So real-time portfolio visibility is a must-have. Let's put that as a critical requirement.

ID: I've been looking at competitor platforms. The ones traders love have very clean, customizable dashboards. We should support drag-and-drop widget arrangement. Traders want to see what matters to them, not a one-size-fits-all layout.

UI: I can design that. We'll need to decide on a component library early though. I'm thinking we go with a React-based approach for the frontend. That decision needs to be made this week.

PM: Let's decide that now. We'll use React. That's final.

ME: What about mobile? Our traders are increasingly working from home and need mobile access.

PM: Mobile is in scope. We need to support iOS and Android browsers at minimum. Native apps are out of scope for v1.

ID: We also need to think about the risk alert system. Traders need configurable thresholds. If a position moves more than X%, they need an alert. The X should be settable per trader.

ME: That's a great point. And alerts should be multi-channel - in-app, email, and SMS.

PM: Agreed. Action item for me: document the alert requirements and share with the team by Friday.

UI: I'll start on the dashboard wireframes this week. I'll have initial mockups ready by January 22nd.

ID: I'll research the data visualization libraries we should use for the charts. Highcharts or D3.js are the main candidates.

ME: One more thing - we need Excel export for end-of-day reporting. The finance team requires it.

PM: Noted. Excel export is a must-have. Let's wrap up. Key decisions today: React frontend, mobile browser support, real-time P&L is critical. Next meeting Thursday at 2pm.`,
    },
    {
        title: 'Trading Platform - Requirements Review',
        participants: ['PM', 'TECH', 'COMPLIANCE', 'TRADER'],
        content: `Trading Platform - Requirements Review Session
Date: January 22, 2001

PM: We have the compliance team and a representative trader joining us today to validate the requirements.

TRADER: I've reviewed the requirements doc. The real-time P&L is good. But I need to flag something - the 500ms latency requirement isn't good enough for our high-frequency desk. They need sub-100ms for their strategies.

TECH: That's a significant change. Sub-100ms requires a completely different architecture - we'd need to move away from the web-based approach for that desk.

PM: Let's separate the requirements. Standard traders get the web platform with 500ms. The HFT desk gets a separate API with sub-100ms. That way we don't hold up the main project.

TRADER: That works. Also, I need to be able to set up to 50 custom alerts per account. The current spec says 10.

PM: We'll change that to 50. Agreed.

COMPLIANCE: I need to raise the audit log requirement. We said 7 years retention, but FERC is now requiring 10 years for energy trading records. This is a regulatory requirement, not optional.

TECH: That affects our storage estimates significantly. We need to revise the infrastructure budget.

PM: Compliance requirement takes priority. We'll update to 10 years retention and revise the budget accordingly. Action item: TECH to provide updated storage cost estimate by Thursday.

COMPLIANCE: Also, we need to add a requirement for real-time regulatory reporting. FERC requires large trades to be reported within 15 minutes of execution.

PM: That's new. Is that a hard requirement?

COMPLIANCE: Absolutely. Non-compliance is a $1M per day fine. This is a blocker.

PM: Understood. Adding real-time FERC reporting as a critical requirement. TECH, can we meet the 15-minute window?

TECH: Yes, we can build a reporting queue that handles this. It's additional work but doable within the timeline.

PM: Good. Let's update the requirements doc. Summary of changes: HFT API added, alert limit increased to 50, retention extended to 10 years, real-time FERC reporting added as critical. I'll send the updated doc by end of day.`,
    },
];

/**
 * Get sample emails as formatted text for ingestion
 */
export function getSampleEmailsText(): string[] {
    return SAMPLE_ENRON_EMAILS
        .filter(e => !isNoiseSampleEmail(e))
        .map(email => `[EMAIL]
From: ${email.from}
To: ${email.to}
Subject: ${email.subject}
Date: ${email.date}
Folder: ${email.folder}

${email.body}
[/EMAIL]`);
}

/**
 * Get sample transcripts as formatted text for ingestion
 */
export function getSampleTranscriptsText(): string[] {
    return SAMPLE_AMI_TRANSCRIPTS.map(t => t.content);
}

function isNoiseSampleEmail(email: SampleEmail): boolean {
    const noiseSubjects = ['Lunch tomorrow?', 'Out of Office', 'Energy Industry Weekly Newsletter'];
    return noiseSubjects.some(s => email.subject.includes(s));
}

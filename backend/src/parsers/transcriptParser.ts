/**
 * Meeting Transcript Parser
 * Supports:
 * - AMI Meeting Corpus format (plain text with speaker labels)
 * - HuggingFace AMI JSON format
 * - Generic meeting transcript text
 */

export interface SpeakerTurn {
    speaker: string;
    text: string;
    timestamp?: string;
    isDecision: boolean;
    isActionItem: boolean;
    isRequirement: boolean;
}

export interface ParsedTranscript {
    meetingId: string;
    title: string;
    participants: string[];
    turns: SpeakerTurn[];
    decisions: string[];
    actionItems: string[];
    requirements: string[];
    summary?: string;
}

// Patterns for detecting key content in meeting transcripts
const DECISION_PATTERNS = [
    /we('ve| have)? (decided|agreed|concluded|resolved)/i,
    /decision[:\s]/i,
    /it('s| is) (decided|agreed|settled)/i,
    /let'?s go with/i,
    /we('ll| will) (use|go with|adopt|implement)/i,
    /approved|sign.?off|confirmed/i,
    /final(ly|ized)?[:\s].*(will|shall|must)/i,
];

const ACTION_ITEM_PATTERNS = [
    /action item[:\s]/i,
    /\b(i|you|we|they|he|she)\s+(will|shall|need to|have to|must)\s+\w/i,
    /follow.?up[:\s]/i,
    /next step[s]?[:\s]/i,
    /todo[:\s]/i,
    /assigned to/i,
    /by (monday|tuesday|wednesday|thursday|friday|next week|end of)/i,
];

const REQUIREMENT_PATTERNS = [
    /must (have|support|include|provide|be|do)/i,
    /should (have|support|include|provide|be|do)/i,
    /need[s]? to (have|support|include|provide|be|do)/i,
    /requirement[s]?[:\s]/i,
    /feature[:\s]/i,
    /the system (must|should|shall|will)/i,
    /user[s]? (must|should|need|want|expect)/i,
    /it('s| is) (required|necessary|essential|critical)/i,
    /we need (a|an|the|to)/i,
];

/**
 * Parse a speaker turn line like "PM: We need to finalize the requirements."
 * or "A: [time=00:01:23] Let's discuss the scope."
 */
function parseSpeakerLine(line: string): { speaker: string; text: string; timestamp?: string } | null {
    // Format: "SPEAKER: text" or "SPEAKER [timestamp]: text"
    const match = line.match(/^([A-Z][A-Z0-9\s]{0,20}?)(?:\s*\[([^\]]+)\])?\s*:\s*(.+)$/);
    if (match) {
        return {
            speaker: match[1].trim(),
            timestamp: match[2]?.trim(),
            text: match[3].trim(),
        };
    }
    return null;
}

/**
 * Classify a text segment for decision/action/requirement signals
 */
function classifyText(text: string): { isDecision: boolean; isActionItem: boolean; isRequirement: boolean } {
    return {
        isDecision: DECISION_PATTERNS.some(p => p.test(text)),
        isActionItem: ACTION_ITEM_PATTERNS.some(p => p.test(text)),
        isRequirement: REQUIREMENT_PATTERNS.some(p => p.test(text)),
    };
}

/**
 * Parse AMI-style plain text transcript
 * 
 * Expected format:
 *   PM: Let's start with the requirements.
 *   ME: I think we need a touchscreen interface.
 *   ID: The budget allows for that.
 */
export function parseAMITranscript(text: string, meetingId?: string): ParsedTranscript {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const turns: SpeakerTurn[] = [];
    const participantSet = new Set<string>();
    let title = meetingId || 'Meeting Transcript';
    let summary: string | undefined;

    // Check for a title line at the top
    if (lines[0] && !parseSpeakerLine(lines[0]) && lines[0].length < 100) {
        title = lines[0].replace(/^#\s*/, '');
    }

    // Check for summary section
    const summaryIdx = lines.findIndex(l => /^(summary|abstract|overview)[:\s]/i.test(l));
    if (summaryIdx > -1) {
        summary = lines.slice(summaryIdx + 1, summaryIdx + 5).join(' ');
    }

    let currentSpeaker = '';
    let currentText = '';
    let currentTimestamp: string | undefined;

    const flushTurn = () => {
        if (currentSpeaker && currentText) {
            const classification = classifyText(currentText);
            turns.push({
                speaker: currentSpeaker,
                text: currentText.trim(),
                timestamp: currentTimestamp,
                ...classification,
            });
            participantSet.add(currentSpeaker);
        }
        currentText = '';
        currentTimestamp = undefined;
    };

    for (const line of lines) {
        const parsed = parseSpeakerLine(line);
        if (parsed) {
            flushTurn();
            currentSpeaker = parsed.speaker;
            currentTimestamp = parsed.timestamp;
            currentText = parsed.text;
        } else if (currentSpeaker) {
            // Continuation of previous speaker's turn
            currentText += ' ' + line;
        }
    }
    flushTurn();

    // Extract decisions, action items, requirements
    const decisions = turns.filter(t => t.isDecision).map(t => `[${t.speaker}] ${t.text}`);
    const actionItems = turns.filter(t => t.isActionItem).map(t => `[${t.speaker}] ${t.text}`);
    const requirements = turns.filter(t => t.isRequirement).map(t => `[${t.speaker}] ${t.text}`);

    return {
        meetingId: meetingId || title,
        title,
        participants: Array.from(participantSet),
        turns,
        decisions,
        actionItems,
        requirements,
        summary,
    };
}

/**
 * Parse HuggingFace AMI JSON format
 * { "meeting_id": "...", "transcript": "...", "summary": "..." }
 */
export function parseAMIJson(jsonText: string): ParsedTranscript {
    const data = JSON.parse(jsonText);
    const transcript = parseAMITranscript(
        data.transcript || data.text || '',
        data.meeting_id || data.id
    );
    if (data.summary) {
        transcript.summary = data.summary;
    }
    return transcript;
}

/**
 * Convert a parsed transcript to formatted text for AI ingestion
 */
export function transcriptToIngestionText(transcript: ParsedTranscript): string {
    const sections: string[] = [];

    sections.push(`[MEETING TRANSCRIPT]`);
    sections.push(`Title: ${transcript.title}`);
    sections.push(`Participants: ${transcript.participants.join(', ')}`);
    if (transcript.summary) {
        sections.push(`\nSummary: ${transcript.summary}`);
    }

    if (transcript.decisions.length > 0) {
        sections.push(`\n--- KEY DECISIONS ---`);
        transcript.decisions.forEach(d => sections.push(`• ${d}`));
    }

    if (transcript.requirements.length > 0) {
        sections.push(`\n--- REQUIREMENTS DISCUSSED ---`);
        transcript.requirements.forEach(r => sections.push(`• ${r}`));
    }

    if (transcript.actionItems.length > 0) {
        sections.push(`\n--- ACTION ITEMS ---`);
        transcript.actionItems.forEach(a => sections.push(`• ${a}`));
    }

    sections.push(`\n--- FULL TRANSCRIPT ---`);
    transcript.turns.forEach(turn => {
        sections.push(`${turn.speaker}: ${turn.text}`);
    });

    sections.push(`[/MEETING TRANSCRIPT]`);
    return sections.join('\n');
}

/**
 * Parse a generic meeting transcript (auto-detects format)
 */
export function parseGenericTranscript(text: string, filename?: string): ParsedTranscript {
    // Try JSON first
    try {
        if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
            const data = JSON.parse(text);
            if (Array.isArray(data)) {
                // Array of turns: [{speaker, text}, ...]
                const turns: SpeakerTurn[] = data.map(item => ({
                    speaker: item.speaker || item.name || 'Unknown',
                    text: item.text || item.content || item.message || '',
                    timestamp: item.timestamp || item.time,
                    ...classifyText(item.text || item.content || ''),
                }));
                const participantSet = new Set(turns.map(t => t.speaker));
                return {
                    meetingId: filename || 'transcript',
                    title: filename || 'Meeting Transcript',
                    participants: Array.from(participantSet),
                    turns,
                    decisions: turns.filter(t => t.isDecision).map(t => `[${t.speaker}] ${t.text}`),
                    actionItems: turns.filter(t => t.isActionItem).map(t => `[${t.speaker}] ${t.text}`),
                    requirements: turns.filter(t => t.isRequirement).map(t => `[${t.speaker}] ${t.text}`),
                };
            }
            return parseAMIJson(text);
        }
    } catch {
        // Fall through to text parsing
    }

    // Parse as AMI-style text
    return parseAMITranscript(text, filename);
}

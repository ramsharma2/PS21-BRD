/**
 * Enron Email Dataset Parser
 * Parses emails from the Enron dataset (CSV format or raw .eml/.mbox files)
 * 
 * Enron CSV format columns: file, message
 * The "message" column contains the full RFC 2822 email including headers + body
 */

import fs from 'fs/promises';
import path from 'path';

export interface ParsedEmail {
    messageId: string;
    from: string;
    to: string[];
    cc: string[];
    subject: string;
    date: string;
    body: string;
    folder: string;
    isNoise: boolean;
    noiseReason?: string;
}

// Patterns that indicate noise emails (not relevant to project requirements)
const NOISE_PATTERNS = [
    /^(re:|fwd?:|fw:)\s*(re:|fwd?:|fw:)\s*(re:|fwd?:|fw:)/i,  // Triple-forwarded
    /unsubscribe/i,
    /out of office/i,
    /auto.?reply/i,
    /delivery (status|failure|notification)/i,
    /\[spam\]/i,
    /newsletter/i,
    /no-?reply@/i,
    /postmaster@/i,
    /mailer-daemon@/i,
    /lunch|dinner|happy hour|birthday|party invite/i,
    /^(thanks|thank you|thx|ty)\.?\s*$/im,
    /^(ok|okay|sounds good|got it|will do|noted)\.?\s*$/im,
];

// Patterns that signal business-relevant content
const SIGNAL_PATTERNS = [
    /requirement[s]?/i,
    /must (have|support|include|provide)/i,
    /should (have|support|include|provide)/i,
    /deadline|milestone|timeline|schedule/i,
    /stakeholder|decision|approve[d]?|sign.?off/i,
    /feature|functionality|capability/i,
    /budget|cost|resource/i,
    /risk|issue|concern|blocker/i,
    /action item|follow.?up|next step/i,
    /project|deliverable|scope/i,
    /meeting|discussion|review|proposal/i,
    /system|platform|application|service/i,
];

/**
 * Parse a single RFC 2822 email string into structured fields
 */
export function parseEmailMessage(rawMessage: string): ParsedEmail {
    const lines = rawMessage.split('\n');
    const headers: Record<string, string> = {};
    let bodyStart = 0;
    let inHeader = true;

    // Parse headers
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (inHeader) {
            if (line.trim() === '') {
                bodyStart = i + 1;
                inHeader = false;
                break;
            }
            // Handle multi-line headers (continuation lines start with whitespace)
            if (line.match(/^\s+/) && Object.keys(headers).length > 0) {
                const lastKey = Object.keys(headers).pop()!;
                headers[lastKey] += ' ' + line.trim();
            } else {
                const colonIdx = line.indexOf(':');
                if (colonIdx > 0) {
                    const key = line.substring(0, colonIdx).trim().toLowerCase();
                    const value = line.substring(colonIdx + 1).trim();
                    headers[key] = value;
                }
            }
        }
    }

    const body = lines.slice(bodyStart).join('\n').trim();

    // Parse recipients
    const parseAddressList = (val: string): string[] => {
        if (!val) return [];
        return val.split(',').map(a => a.trim()).filter(Boolean);
    };

    const email: ParsedEmail = {
        messageId: headers['message-id'] || '',
        from: headers['from'] || headers['x-from'] || '',
        to: parseAddressList(headers['to'] || headers['x-to'] || ''),
        cc: parseAddressList(headers['cc'] || headers['x-cc'] || ''),
        subject: headers['subject'] || '(no subject)',
        date: headers['date'] || '',
        body: body,
        folder: headers['x-folder'] || '',
        isNoise: false,
    };

    // Classify as noise or signal
    const fullText = `${email.subject}\n${email.body}`;
    for (const pattern of NOISE_PATTERNS) {
        if (pattern.test(fullText) || pattern.test(email.from)) {
            email.isNoise = true;
            email.noiseReason = `Matched noise pattern: ${pattern.source}`;
            break;
        }
    }

    // Override noise if strong signal found
    if (email.isNoise) {
        const hasSignal = SIGNAL_PATTERNS.some(p => p.test(fullText));
        if (hasSignal) {
            email.isNoise = false;
            email.noiseReason = undefined;
        }
    }

    // Very short bodies are likely noise
    if (!email.isNoise && body.length < 30) {
        email.isNoise = true;
        email.noiseReason = 'Body too short to contain requirements';
    }

    return email;
}

/**
 * Convert a parsed email to a formatted text block for AI ingestion
 */
export function emailToIngestionText(email: ParsedEmail): string {
    const toStr = email.to.join(', ');
    const ccStr = email.cc.length > 0 ? `\nCC: ${email.cc.join(', ')}` : '';
    return `[EMAIL]
From: ${email.from}
To: ${toStr}${ccStr}
Subject: ${email.subject}
Date: ${email.date}
Folder: ${email.folder}

${email.body}
[/EMAIL]`;
}

/**
 * Parse Enron CSV file (columns: file, message) using streaming readline
 * This handles the full 1.7GB Enron dataset without loading it all into memory.
 * Returns only non-noise emails, up to maxEmails.
 */
export async function parseEnronCSV(
    filePath: string,
    maxEmails: number = 100
): Promise<{ emails: ParsedEmail[]; total: number; filtered: number }> {
    const { createReadStream } = await import('fs');
    const { createInterface } = await import('readline');

    return new Promise((resolve, reject) => {
        const emails: ParsedEmail[] = [];
        let total = 0;
        let filtered = 0;
        let currentMessage = '';
        let isFirstLine = true;
        let done = false;

        const fileStream = createReadStream(filePath, { encoding: 'utf8' });
        const rl = createInterface({ input: fileStream, crlfDelay: Infinity });

        const processCurrentMessage = () => {
            if (!currentMessage) return;
            total++;
            try {
                const parsed = parseEmailMessage(currentMessage);
                if (!parsed.isNoise) {
                    emails.push(parsed);
                } else {
                    filtered++;
                }
            } catch {
                filtered++;
            }
            currentMessage = '';
        };

        rl.on('line', (line: string) => {
            if (done) return;

            if (isFirstLine) {
                isFirstLine = false;
                return; // skip header row
            }

            // Detect start of a new CSV record
            // Enron CSV rows start with a path like: enron_mail_20110402/maildir/...
            // or quoted: "enron_mail_20110402/maildir/..."
            const isNewRecord = /^"?[a-zA-Z0-9_]+\//.test(line);

            if (isNewRecord) {
                processCurrentMessage();

                if (emails.length >= maxEmails) {
                    done = true;
                    rl.close();
                    fileStream.destroy();
                    return;
                }

                // Extract message content (everything after the first comma)
                const commaIdx = line.indexOf(',');
                if (commaIdx > 0) {
                    currentMessage = line.substring(commaIdx + 1).replace(/^"/, '');
                }
            } else {
                // Continuation of current email body
                currentMessage += '\n' + line;
            }
        });

        rl.on('close', () => {
            // Process the last email if we didn't hit the limit
            if (!done && currentMessage && emails.length < maxEmails) {
                processCurrentMessage();
            }
            resolve({ emails, total, filtered });
        });

        rl.on('error', reject);
        fileStream.on('error', reject);
    });
}

/**
 * Parse a directory of .eml files
 */
export async function parseEmlDirectory(
    dirPath: string,
    maxEmails: number = 100
): Promise<{ emails: ParsedEmail[]; total: number; filtered: number }> {
    const emails: ParsedEmail[] = [];
    let total = 0;
    let filtered = 0;

    const files = await fs.readdir(dirPath);
    const emlFiles = files.filter(f => f.endsWith('.eml') || f.endsWith('.txt'));

    for (const file of emlFiles.slice(0, maxEmails * 3)) {
        if (emails.length >= maxEmails) break;
        try {
            const content = await fs.readFile(path.join(dirPath, file), 'utf-8');
            total++;
            const parsed = parseEmailMessage(content);
            parsed.folder = path.basename(dirPath);
            if (!parsed.isNoise) {
                emails.push(parsed);
            } else {
                filtered++;
            }
        } catch {
            // Skip unreadable files
        }
    }

    return { emails, total, filtered };
}

/**
 * Parse raw email text (single email pasted as text)
 */
export function parseRawEmailText(text: string): ParsedEmail {
    return parseEmailMessage(text);
}

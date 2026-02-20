import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Project } from '@/types';

// ============================================
// PDF EXPORT
// ============================================

export const exportToPDF = (project: Project, sections: any[]) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    // Title
    doc.setFontSize(22);
    doc.text(project.name, margin, y);
    y += 10;

    // Description/Meta
    doc.setFontSize(12);
    doc.setTextColor(100);
    const descLines = doc.splitTextToSize(project.description || 'Business Requirements Document', contentWidth);
    doc.text(descLines, margin, y);
    y += descLines.length * 7 + 10;

    doc.setTextColor(0);

    // Sections
    sections.forEach((section) => {
        // Check for page break
        if (y > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            y = margin;
        }

        // Section Title
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(section.title, margin, y);
        y += 8;

        // Section Content
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');

        const content = section.content || '(No content)';
        const lines = doc.splitTextToSize(content, contentWidth);

        // Check spacing for content
        if (y + lines.length * 5 > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            y = margin;
        }

        doc.text(lines, margin, y);
        y += lines.length * 5 + 10;
    });

    doc.save(`${project.name.replace(/\s+/g, '_')}_BRD.pdf`);
};

// ============================================
// DOCX EXPORT
// ============================================

export const exportToDOCX = async (project: Project, sections: any[]) => {
    const docChildren = [
        new Paragraph({
            text: project.name,
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
            text: project.description || 'Business Requirements Document',
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
        }),
    ];

    sections.forEach(section => {
        docChildren.push(
            new Paragraph({
                text: section.title,
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 400, after: 200 },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: section.content || '(No content)',
                        size: 24, // 12pt
                    }),
                ],
                spacing: { after: 200 },
            })
        );
    });

    const doc = new Document({
        sections: [{
            properties: {},
            children: docChildren,
        }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${project.name.replace(/\s+/g, '_')}_BRD.docx`);
};

// ============================================
// MARKDOWN EXPORT
// ============================================

export const exportToMarkdown = (project: Project, sections: any[]) => {
    let content = `# ${project.name}\n\n`;
    content += `> ${project.description || 'Business Requirements Document'}\n\n`;
    content += `---\n\n`;

    sections.forEach(section => {
        content += `## ${section.title}\n\n`;
        content += `${section.content || '(No content)'}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, `${project.name.replace(/\s+/g, '_')}_BRD.md`);
};

// ============================================
// EXCEL EXPORT (RTM)
// ============================================

export const exportRTMToExcel = (project: Project, rtmData: any[]) => {
    if (!rtmData || rtmData.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(rtmData.map(item => ({
        ID: item.requirementId,
        Requirement: item.requirement,
        Source: item.sourceName,
        'BRD Section': item.brdSection,
        Priority: item.priority,
        Status: item.status
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "RTM");

    // Adjust column widths
    const wscols = [
        { wch: 10 }, // ID
        { wch: 60 }, // Req
        { wch: 20 }, // Source
        { wch: 20 }, // Section
        { wch: 10 }, // Priority
        { wch: 10 }, // Status
    ];
    worksheet['!cols'] = wscols;

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${project.name.replace(/\s+/g, '_')}_RTM.xlsx`);
};

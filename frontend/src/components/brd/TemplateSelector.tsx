import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Check } from 'lucide-react';

interface Template {
    id: string;
    name: string;
    description: string;
    icon: string;
    sections: string[];
}

const TEMPLATES: Template[] = [
    {
        id: 'standard',
        name: 'Standard BRD',
        description: 'Comprehensive 12-section document suitable for most projects',
        icon: '📄',
        sections: [
            'Executive Summary',
            'Business Objectives',
            'Stakeholder Analysis',
            'Scope',
            'Functional Requirements',
            'Non-Functional Requirements',
            'Assumptions',
            'Constraints',
            'Risks',
            'Success Metrics',
            'Timeline',
            'Glossary',
        ],
    },
    {
        id: 'agile',
        name: 'Agile/Lean BRD',
        description: 'Lightweight template focused on user stories and acceptance criteria',
        icon: '⚡',
        sections: [
            'Executive Summary',
            'Business Objectives',
            'Stakeholder Analysis',
            'Functional Requirements',
            'Non-Functional Requirements',
            'Success Metrics',
            'Timeline',
        ],
    },
    {
        id: 'technical',
        name: 'Technical BRD',
        description: 'Detailed technical specifications for complex systems',
        icon: '⚙️',
        sections: [
            'Executive Summary',
            'Business Objectives',
            'Scope',
            'Functional Requirements',
            'Non-Functional Requirements',
            'Assumptions',
            'Constraints',
            'Risks',
            'Timeline',
            'Glossary',
        ],
    },
    {
        id: 'minimal',
        name: 'Minimal BRD',
        description: 'Quick overview for small projects or proof of concepts',
        icon: '📋',
        sections: [
            'Executive Summary',
            'Business Objectives',
            'Functional Requirements',
            'Non-Functional Requirements',
            'Timeline',
        ],
    },
];

interface TemplateSelectorProps {
    onSelect: (templateId: string) => void;
    onCancel: () => void;
}

export function TemplateSelector({ onSelect, onCancel }: TemplateSelectorProps) {
    const [selectedTemplate, setSelectedTemplate] = useState<string>('standard');

    const handleGenerate = () => {
        onSelect(selectedTemplate);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Choose BRD Template</h2>
                <p className="text-muted-foreground">
                    Select a template that best fits your project needs
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TEMPLATES.map((template) => (
                    <Card
                        key={template.id}
                        className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                            selectedTemplate === template.id
                                ? 'ring-2 ring-primary border-primary'
                                : 'hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedTemplate(template.id)}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <span className="text-4xl">{template.icon}</span>
                                <div>
                                    <h3 className="font-semibold text-lg">{template.name}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {template.description}
                                    </p>
                                </div>
                            </div>
                            {selectedTemplate === template.id && (
                                <div className="bg-primary text-primary-foreground rounded-full p-1">
                                    <Check className="h-4 w-4" />
                                </div>
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t">
                            <p className="text-xs font-medium text-muted-foreground mb-2">
                                Includes {template.sections.length} sections:
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {template.sections.slice(0, 4).map((section, idx) => (
                                    <span
                                        key={idx}
                                        className="text-xs bg-secondary px-2 py-1 rounded"
                                    >
                                        {section}
                                    </span>
                                ))}
                                {template.sections.length > 4 && (
                                    <span className="text-xs text-muted-foreground px-2 py-1">
                                        +{template.sections.length - 4} more
                                    </span>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button onClick={handleGenerate}>
                    Generate BRD with {TEMPLATES.find((t) => t.id === selectedTemplate)?.name}
                </Button>
            </div>
        </div>
    );
}

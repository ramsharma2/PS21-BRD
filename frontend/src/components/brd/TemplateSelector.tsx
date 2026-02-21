import { useState } from 'react';
import { Button } from '../ui/button';
import { Check, FileText, Zap, Settings, ClipboardList } from 'lucide-react';

interface Template {
    id: string;
    name: string;
    description: string;
    icon: any;
    sections: number;
    details: string[];
}

const TEMPLATES: Template[] = [
    {
        id: 'standard',
        name: 'Standard BRD',
        description: 'Comprehensive documentation',
        icon: FileText,
        sections: 12,
        details: [
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
        description: 'Lightweight template',
        icon: Zap,
        sections: 7,
        details: [
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
        description: 'Technical specifications',
        icon: Settings,
        sections: 10,
        details: [
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
        description: 'Quick overview',
        icon: ClipboardList,
        sections: 5,
        details: [
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
        <div className="max-w-4xl mx-auto space-y-8 py-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-normal text-foreground">Choose Your BRD Template</h2>
                <p className="text-sm text-muted-foreground">
                    Select the template that best matches your project type and documentation needs
                </p>
            </div>

            {/* Template Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TEMPLATES.map((template) => {
                    const Icon = template.icon;
                    const isSelected = selectedTemplate === template.id;
                    
                    return (
                        <button
                            key={template.id}
                            onClick={() => setSelectedTemplate(template.id)}
                            className={`relative text-left p-6 rounded-lg border transition-all ${
                                isSelected
                                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                                    : 'border-border bg-background hover:border-blue-300 hover:bg-accent/50'
                            }`}
                        >
                            {/* Selected Indicator */}
                            {isSelected && (
                                <div className="absolute top-4 right-4 flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                                    <span>Selected</span>
                                    <Check className="h-3.5 w-3.5" />
                                </div>
                            )}

                            {/* Icon & Title */}
                            <div className="flex items-start gap-3 mb-3">
                                <div className={`p-2 rounded-lg ${
                                    isSelected 
                                        ? 'bg-blue-100 dark:bg-blue-900/30' 
                                        : 'bg-muted'
                                }`}>
                                    <Icon className={`h-5 w-5 ${
                                        isSelected 
                                            ? 'text-blue-600 dark:text-blue-400' 
                                            : 'text-muted-foreground'
                                    }`} />
                                </div>
                                <div className="flex-1 pt-0.5">
                                    <h3 className="font-medium text-base text-foreground">
                                        {template.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-0.5">
                                        {template.description}
                                    </p>
                                </div>
                            </div>

                            {/* Section Count */}
                            <div className="mt-4 pt-3 border-t border-border/50">
                                <span className="text-xs text-muted-foreground">
                                    {template.sections} sections
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Help Text */}
            <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                <div className="flex gap-3">
                    <div className="text-muted-foreground mt-0.5">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-foreground mb-1">
                            Not sure which template to choose?
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Start with Standard BRD for comprehensive documentation, or Agile/Lean for faster, iterative projects.
                        </p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={onCancel} className="font-normal">
                    Cancel
                </Button>
                <Button onClick={handleGenerate} className="font-normal">
                    Generate BRD
                </Button>
            </div>
        </div>
    );
}

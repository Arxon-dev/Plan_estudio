import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ComparisonTableProps {
    comparison: string;
    aspect: string;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ comparison, aspect }) => {
    return (
        <div className="my-4 border rounded-lg overflow-hidden bg-card">
            <div className="p-2 bg-muted/50 border-b font-medium text-sm">
                Comparativa: {aspect}
            </div>
            <div className="p-4 overflow-x-auto prose dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {comparison}
                </ReactMarkdown>
            </div>
        </div>
    );
};

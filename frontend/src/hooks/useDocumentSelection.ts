import { useState, useEffect, useCallback } from 'react';
import { chatApi } from '../services/chatApi';

export interface DocumentSelection {
    bloque: string;
    tema: string;
}

export interface AvailableBlock {
    bloque: string;
    temas: { id: string; title: string }[];
}

export const useDocumentSelection = () => {
    const [availableDocs, setAvailableDocs] = useState<AvailableBlock[]>([]);
    const [selectedDocs, setSelectedDocs] = useState<DocumentSelection[]>([]);
    const [isLoadingDocs, setIsLoadingDocs] = useState(false);

    const fetchDocuments = useCallback(async () => {
        setIsLoadingDocs(true);
        try {
            const docs = await chatApi.getDocuments();
            setAvailableDocs(docs);
        } catch (error) {
            console.error('Error fetching documents:', error);
        } finally {
            setIsLoadingDocs(false);
        }
    }, []);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const toggleSelection = (bloque: string, tema: string) => {
        setSelectedDocs(prev => {
            const exists = prev.some(d => d.bloque === bloque && d.tema === tema);
            if (exists) {
                return prev.filter(d => !(d.bloque === bloque && d.tema === tema));
            } else {
                return [...prev, { bloque, tema }];
            }
        });
    };

    const selectAll = () => {
        const all: DocumentSelection[] = [];
        availableDocs.forEach(b => {
            b.temas.forEach(t => {
                all.push({ bloque: b.bloque, tema: t.id });
            });
        });
        setSelectedDocs(all);
    };

    const clearSelection = () => {
        setSelectedDocs([]);
    };

    return {
        availableDocs,
        selectedDocs,
        isLoadingDocs,
        toggleSelection,
        selectAll,
        clearSelection,
        refreshDocuments: fetchDocuments
    };
};

export interface ChatResponse {
    response: string;
    sources: Array<{
        documento: string;
        texto: string;
        score: number;
    }>;
    usage?: {
        queries_used: number;
        queries_limit: number;
        queries_remaining: number;
        reset_date: string;
    };
}

export interface ChatUsage {
    queries_used: number;
    queries_limit: number;
    queries_remaining: number;
    reset_date: string;
    plan_type: 'free' | 'premium';
}

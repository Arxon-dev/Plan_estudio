import React from 'react';
import { ChatInterface } from '../components/Chat/ChatInterface';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const ChatPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="h-screen flex flex-col bg-background">
            {/* Header móvil / simple */}
            <div className="border-b p-4 flex items-center gap-4 md:hidden">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-accent rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="font-semibold">Chat IA</h1>
            </div>

            <div className="flex-1 overflow-hidden">
                <ChatInterface onClose={() => navigate('/dashboard')} />
            </div>
        </div>
    );
};

export default ChatPage;

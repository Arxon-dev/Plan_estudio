import React from 'react';
import { AlertCircle, Crown } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

interface LimitReachedModalProps {
    isOpen: boolean;
    onClose: () => void;
    usage: any;
}

export const LimitReachedModal: React.FC<LimitReachedModalProps> = ({ isOpen, onClose, usage }) => {
    if (!usage) return null;

    const isFree = usage.plan_type === 'free';

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
                <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className={`p-3 rounded-full ${isFree ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>
                            {isFree ? <Crown className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
                        </div>

                        <Dialog.Title className="text-xl font-semibold">
                            {isFree ? '¡Mejora tu plan!' : 'Límite mensual alcanzado'}
                        </Dialog.Title>

                        <Dialog.Description className="text-muted-foreground">
                            {isFree
                                ? 'Has alcanzado el límite de consultas gratuitas. Pásate a Premium para obtener 10x más consultas y acceso ilimitado.'
                                : `Has consumido tus ${usage.queries_limit} consultas mensuales. Tu cuota se renovará el ${new Date(usage.reset_date).toLocaleDateString()}.`
                            }
                        </Dialog.Description>

                        <div className="flex gap-3 w-full mt-4">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border rounded-md hover:bg-accent"
                            >
                                Cerrar
                            </button>
                            {isFree && (
                                <button
                                    onClick={() => window.location.href = '/premium'} // O usar navigate
                                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium"
                                >
                                    Ver planes Premium
                                </button>
                            )}
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

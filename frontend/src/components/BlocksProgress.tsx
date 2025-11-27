import React from 'react';

interface BlocksProgressProps {
    totalBlocks: number;
    currentBlock: number;
    completedBlocks: number[];
    blocksConfig?: any[];
}

export const BlocksProgress: React.FC<BlocksProgressProps> = ({ totalBlocks, currentBlock, completedBlocks, blocksConfig }) => {
    return (
        <div className="flex items-center justify-between w-full mb-8 px-2">
            {Array.from({ length: totalBlocks }).map((_, index) => {
                const blockNum = index + 1;
                const isCompleted = completedBlocks.includes(blockNum);
                const isCurrent = currentBlock === blockNum;

                let statusClass = 'bg-gray-200 text-gray-500 border-gray-300';
                if (isCompleted) statusClass = 'bg-green-500 text-white border-green-500';
                if (isCurrent) statusClass = 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-200';

                return (
                    <div key={blockNum} className="flex flex-col items-center relative flex-1">
                        {/* Connector Line */}
                        {index !== 0 && (
                            <div className={`absolute top-4 right-[50%] w-full h-0.5 -z-10 ${isCompleted || isCurrent ? 'bg-green-500' : 'bg-gray-200'
                                }`} style={{ right: '50%', width: '100%' }}></div>
                        )}

                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold text-sm transition-all duration-300 ${statusClass}`}>
                            {isCompleted ? '✓' : blockNum}
                        </div>
                        <span className={`text-xs mt-1 font-medium ${isCurrent ? 'text-blue-700' : 'text-gray-500'}`}>
                            Bloque {blockNum}
                        </span>
                        {blocksConfig && blocksConfig[index] && (
                            <span className="text-[10px] text-gray-400 mt-0.5">
                                {new Date(blocksConfig[index].startDate).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })} - {new Date(blocksConfig[index].endDate).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })}
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

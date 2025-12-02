import React from 'react';

interface ReportHeaderProps {
    className?: string;
}

const ReportHeader: React.FC<ReportHeaderProps> = ({ className }) => {
    return (
        <header className={`pb-2 border-b border-gray-300 ${className}`}>
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-sm font-bold text-gray-900">Dr. José Carlos Guido Pancardo</h1>
                    <p className="text-[11px] text-gray-800">Medicina del Trabajo y Salud Ocupacional</p>
                    <p className="text-[8px] text-gray-600">
                        Céd. Prof. 9766342 · Céd. Esp. 521002603 · Céd. Maestría 12266124
                    </p>
                </div>
                <div className="flex-shrink-0">
                    <img src="https://i.postimg.cc/VLWbhvx4/LOGO-WEB-G.png" alt="GP Medical Health Logo" className="h-8" />
                </div>
            </div>
        </header>
    );
};

export default ReportHeader;

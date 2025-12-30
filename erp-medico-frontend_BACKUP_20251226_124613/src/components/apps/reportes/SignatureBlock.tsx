import React from 'react';

interface SignatureBlockProps {
    date?: string;
}

const SignatureBlock: React.FC<SignatureBlockProps> = ({ date }) => {
    return (
        <div className="mt-16 text-center">
            <img
                src="https://i.postimg.cc/gkx3xmQH/Recurso-1.png"
                alt="Firma del Dr. José Carlos Guido Pancardo"
                className="mx-auto h-20"
            />
            <div className="mt-4 text-xs text-gray-800">
                <p className="font-bold">Dr. José Carlos Guido Pancardo</p>
                <p>Medicina del Trabajo y Salud Ocupacional</p>
                <p className="text-gray-600">
                    Céd. Prof. 9766342 · Céd. Esp. 521002603 · Céd. Maestría 12266124
                </p>
            </div>
            {date && (
                <p className="text-sm text-gray-700 mt-6">
                    Fecha de Emisión: {date}
                </p>
            )}
        </div>
    );
};

export default SignatureBlock;

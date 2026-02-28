

import React from 'react';

const Section12_Signature: React.FC = () => {
    return (
        <section className="mt-12 pt-8 border-t-2 border-dashed">
            <div className="flex flex-col justify-center items-center text-center space-y-2">
                <div className="bg-slate-900 p-2 inline-block rounded-md">
                    <img 
                        src="https://www.gpmedicalhealth.com/imagenes/LOGO-WEB-.png" 
                        alt="Logo GP Medical Health" 
                        className="h-14"
                    />
                </div>
                <div className="pt-2">
                    <p className="font-bold text-lg text-slate-800 m-0">Dr. José Carlos Guido Pancardo</p>
                    <p className="text-sm text-slate-600 m-0">Medicina del Trabajo y Salud Ocupacional</p>
                    <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                        <p className="m-0">Ced. Prof.: 9766342 / Ced. Esp.: 521002603</p>
                        <p className="m-0">Ced. Mtria.: 12266124</p>
                        <p className="m-0">Universidad Autónoma de Tamaulipas</p>
                    </div>
                </div>
                <div className="border-t-2 border-slate-700 w-80 !mt-4 pt-2">
                    <p className="text-sm font-semibold text-slate-700">FIRMA DEL MÉDICO</p>
                </div>
            </div>
            <footer className="text-center text-xs text-slate-600 mt-12 border-t pt-4">
                <p>www.gpmedicalhealth.com | (442) 688 8436 | @gpmedicalhealth</p>
                <p>Misión de Landa 206, Fracc. Misión de las Californias, Querétaro, Qro.</p>
            </footer>
        </section>
    );
};

export default Section12_Signature;

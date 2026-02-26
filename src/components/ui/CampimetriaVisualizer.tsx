import React from 'react';

interface CampimetriaProps {
    value: string;
    onChange: (val: string) => void;
    label: string;
}

const ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

export function CampimetriaVisualizer({ value, onChange, label }: CampimetriaProps) {
    const selectedAngles = value
        .split(',')
        .map(s => s.trim())
        .filter(s => s !== '')
        .map(Number);

    const toggleAngle = (angle: number) => {
        let newAngles;
        if (selectedAngles.includes(angle)) {
            newAngles = selectedAngles.filter(a => a !== angle);
        } else {
            newAngles = [...selectedAngles, angle].sort((a, b) => a - b);
        }
        onChange(newAngles.join(', '));
    };

    return (
        <div className="flex flex-col items-center bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <label className="text-xs font-bold text-slate-700 mb-4">{label}</label>
            <div className="relative w-32 h-32 rounded-full border-2 border-slate-300 flex items-center justify-center">
                {/* Crosshairs */}
                <div className="absolute w-full h-[1px] bg-slate-200"></div>
                <div className="absolute h-full w-[1px] bg-slate-200"></div>
                <div className="absolute w-full h-[1px] bg-slate-200 rotate-45"></div>
                <div className="absolute h-full w-[1px] bg-slate-200 rotate-45"></div>

                {/* Center dot */}
                <div className="absolute w-2 h-2 bg-slate-400 rounded-full"></div>

                {/* Interactive Points */}
                {ANGLES.map(angle => {
                    // Convert angle to radians for x,y positioning.
                    // 0 deg is right, 90 is bottom in standard canvas, but we want 90 to be top.
                    // Standard math: x = cos(a), y = -sin(a)
                    const rad = (angle * Math.PI) / 180;
                    const r = 50; // Radius for placing dots
                    const x = Math.cos(rad) * r;
                    const y = -Math.sin(rad) * r; // Negative because Y goes down in CSS

                    const isSelected = selectedAngles.includes(angle);

                    return (
                        <button
                            key={angle}
                            type="button"
                            onClick={() => toggleAngle(angle)}
                            className={`absolute w-6 h-6 -ml-3 -mt-3 rounded-full flex items-center justify-center text-[8px] font-bold transition-transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 z-10 
                            ${isSelected ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                            style={{
                                left: `calc(50% + ${x}px)`,
                                top: `calc(50% + ${y}px)`
                            }}
                            title={`Eje ${angle}°`}
                        >
                            {angle}°
                        </button>
                    );
                })}
            </div>

            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Ej. 45, 90"
                className="mt-4 w-full text-center bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-600"
            />
        </div>
    );
}

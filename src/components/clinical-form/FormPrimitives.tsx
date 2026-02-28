/**
 * Form Primitives para el Formulario de Historia Clínica
 * Portados del Consolidador IA con estilo ERP
 */
import React, { useState, useRef, useEffect } from 'react'

// ── FormField ──
interface FormFieldProps {
    label?: string; id: string; value: string; onChange: (value: string) => void;
    placeholder?: string; className?: string; inputClassName?: string; hideLabel?: boolean; type?: 'text' | 'tel' | 'email';
}
export const FormField: React.FC<FormFieldProps> = ({ label, id, value, onChange, placeholder, className, inputClassName, hideLabel = false, type = 'text' }) => (
    <div className={className}>
        {!hideLabel && <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
        <input type={type} id={id} name={id} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
            className={`block w-full px-3 py-2 border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white text-slate-800 transition-all ${inputClassName}`} />
    </div>
)

// ── TextArea ──
interface TextAreaProps {
    label: string; id: string; value: string; onChange: (value: string) => void;
    placeholder?: string; rows?: number; className?: string; hideLabel?: boolean;
}
export const TextArea: React.FC<TextAreaProps> = ({ label, id, value, onChange, placeholder, rows = 4, className, hideLabel = false }) => (
    <div className={className}>
        {!hideLabel && <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
        <textarea id={id} name={id} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
            className="block w-full px-3 py-2 border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white text-slate-800 transition-all" />
    </div>
)

// ── RadioGroup ──
interface RadioGroupProps {
    label?: string; name: string; options: string[]; selectedValue: string; onChange: (value: string) => void; className?: string; hideLabel?: boolean;
}
export const RadioGroup: React.FC<RadioGroupProps> = ({ label, name, options, selectedValue, onChange, className, hideLabel = false }) => (
    <div className={className}>
        {!hideLabel && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {options.map((option) => (
                <label key={option} className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name={name} value={option} checked={selectedValue === option} onChange={(e) => onChange(e.target.value)}
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300" />
                    <span className="text-sm text-slate-700">{option}</span>
                </label>
            ))}
        </div>
    </div>
)

// ── Checkbox ──
interface CheckboxProps { label: string; isChecked: boolean; onChange: (checked: boolean) => void; className?: string; }
export const Checkbox: React.FC<CheckboxProps> = ({ label, isChecked, onChange, className }) => (
    <label className={`flex items-center space-x-2 cursor-pointer ${className}`}>
        <input type="checkbox" checked={isChecked} onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
        <span className="text-sm text-slate-700 capitalize">{label.replace(/([A-Z])/g, ' $1').trim()}</span>
    </label>
)

// ── SelectField ──
interface SelectFieldProps { label: string; id: string; value: string; onChange: (value: string) => void; options: readonly string[]; className?: string; }
export const SelectField: React.FC<SelectFieldProps> = ({ label, id, value, onChange, options, className }) => (
    <div className={className}>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <select id={id} name={id} value={value || ''} onChange={(e) => onChange(e.target.value)}
            className="block w-full px-3 py-2 border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white text-slate-800 transition-all">
            <option value="">Seleccione...</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
)

// ── DateField with Calendar ──
const formatDate = (date: Date): string => `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
const parseDate = (s: string): Date | null => { if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null; const d = new Date(s); return isNaN(d.getTime()) ? null : new Date(d.getTime() + d.getTimezoneOffset() * 60000); };
const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

interface DateFieldProps { label: string; id: string; value: string; onChange: (value: string) => void; className?: string; }
export const DateField: React.FC<DateFieldProps> = ({ label, id, value, onChange, className }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const sel = value ? parseDate(value) : null;
    const [display, setDisplay] = useState(sel || new Date());

    useEffect(() => {
        const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const y = display.getFullYear(), m = display.getMonth();
    const first = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate();

    return (
        <div className={`relative ${className}`} ref={ref}>
            <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
            <input type="text" id={id} value={value || ''} onChange={(e) => onChange(e.target.value)} onFocus={() => setOpen(true)} placeholder="YYYY-MM-DD" autoComplete="off"
                className="block w-full px-3 py-2 border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white text-slate-800 pr-8 transition-all" />
            {open && (
                <div className="absolute top-full mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50">
                    <div className="flex justify-between items-center mb-2">
                        <button type="button" onClick={() => setDisplay(new Date(y, m - 1, 1))} className="p-1 rounded-full hover:bg-slate-100">‹</button>
                        <div className="font-semibold text-slate-800 text-sm">{monthNames[m]} {y}</div>
                        <button type="button" onClick={() => setDisplay(new Date(y, m + 1, 1))} className="p-1 rounded-full hover:bg-slate-100">›</button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-400 font-bold mb-1">
                        {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'].map(d => <div key={d}>{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {Array(first).fill(null).map((_, i) => <div key={`b${i}`} />)}
                        {Array.from({ length: days }, (_, i) => i + 1).map(day => {
                            const isSel = sel && sel.getDate() === day && sel.getMonth() === m && sel.getFullYear() === y;
                            return (
                                <button key={day} type="button" onClick={() => { onChange(formatDate(new Date(y, m, day))); setOpen(false); }}
                                    className={`p-1.5 rounded-full text-xs transition-colors ${isSel ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-slate-100 text-slate-700'}`}>{day}</button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── RepeatableFieldGroup ──
interface RepeatableFieldGroupProps { title: string; items: any[]; onAddItem: () => void; onRemoveItem: (index: number) => void; children: (item: any, index: number) => React.ReactNode; }
export const RepeatableFieldGroup: React.FC<RepeatableFieldGroupProps> = ({ title, items, onAddItem, onRemoveItem, children }) => (
    <div>
        <h4 className="text-sm font-bold text-slate-800 mb-2">{title}</h4>
        <div className="space-y-3">
            {items.map((item, idx) => (
                <div key={idx} className="p-4 border border-slate-200 rounded-xl relative bg-slate-50/50">
                    <button type="button" onClick={() => onRemoveItem(idx)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 font-bold text-xl leading-none p-1">&times;</button>
                    {children(item, idx)}
                </div>
            ))}
            {items.length === 0 && <p className="text-sm text-slate-400 italic">No hay registros.</p>}
        </div>
        <button type="button" onClick={onAddItem} className="mt-3 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-xl hover:bg-emerald-100 border border-emerald-200 transition-colors">
            + Agregar {title}
        </button>
    </div>
)

// ── SectionTitle ──
export const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-base font-bold text-slate-800 bg-gradient-to-r from-slate-100 to-emerald-50 p-3 rounded-xl border-l-4 border-emerald-500">{children}</h3>
)

// ── AI Button ──
interface AIButtonProps { onClick: () => void; isLoading: boolean; label?: string; disabled?: boolean; }
export const AIButton: React.FC<AIButtonProps> = ({ onClick, isLoading, label = 'Analizar', disabled }) => (
    <button type="button" onClick={onClick} disabled={isLoading || disabled}
        className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-semibold py-2 px-3 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all shadow-sm text-xs border border-blue-200 disabled:opacity-50 disabled:cursor-wait">
        {isLoading ? <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /> : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.47 2.118v-.007a2.25 2.25 0 0 1-2.24-1.845 2.25 2.25 0 0 0-1.03-2.101m5.78-1.128a2.25 2.25 0 0 0-1.03 2.101M15.79 16.122a3 3 0 0 1 5.78 1.128 2.25 2.25 0 0 0 2.47 2.118v-.007a2.25 2.25 0 0 0 2.24-1.845 2.25 2.25 0 0 1 1.03-2.101m-5.78-1.128a2.25 2.25 0 0 1 1.03 2.101m0 0a4.5 4.5 0 0 1-7.5 0m7.5 0a4.5 4.5 0 0 0-7.5 0M12 10.875a2.25 2.25 0 0 0-2.25 2.25v.007a2.25 2.25 0 0 0 4.5 0v-.007a2.25 2.25 0 0 0-2.25-2.25z" />
            </svg>
        )}
        <span>{isLoading ? 'Procesando...' : label}</span>
    </button>
)

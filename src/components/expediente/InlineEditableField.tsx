/**
 * InlineEditableField — Campo editable con confirmación
 * 
 * Uso: Cualquier valor que el usuario pueda corregir inline.
 * Estados: display → editing (con Confirmar/Cancelar) → saved
 */
import React, { useState, useRef, useEffect } from 'react'
import { Edit3, Check, X, Loader2 } from 'lucide-react'

interface Props {
    value: string
    onSave: (newValue: string) => Promise<void> | void
    type?: 'text' | 'number' | 'textarea' | 'select'
    options?: { value: string; label: string }[]
    placeholder?: string
    label?: string
    disabled?: boolean
    className?: string
}

export default function InlineEditableField({ value, onSave, type = 'text', options, placeholder, label, disabled, className = '' }: Props) {
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState(value)
    const [saving, setSaving] = useState(false)
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null)

    useEffect(() => {
        if (editing && inputRef.current) inputRef.current.focus()
    }, [editing])

    useEffect(() => { setDraft(value) }, [value])

    const startEdit = () => { if (!disabled) { setDraft(value); setEditing(true) } }

    const cancel = () => { setDraft(value); setEditing(false) }

    const confirm = async () => {
        if (draft === value) { setEditing(false); return }
        setSaving(true)
        try {
            await onSave(draft)
            setEditing(false)
        } catch (e) {
            console.error('Save failed:', e)
        }
        setSaving(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && type !== 'textarea') confirm()
        if (e.key === 'Escape') cancel()
    }

    if (!editing) {
        return (
            <div className={`group flex items-center gap-1.5 ${className}`}>
                {label && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>}
                <span className="text-sm font-semibold text-slate-700">{value || <span className="text-slate-300 italic">—</span>}</span>
                {!disabled && (
                    <button onClick={startEdit} className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-slate-100">
                        <Edit3 className="w-3 h-3 text-slate-400 hover:text-teal-500" />
                    </button>
                )}
            </div>
        )
    }

    return (
        <div className={`flex items-center gap-1.5 ${className}`}>
            {label && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>}
            {type === 'textarea' ? (
                <textarea
                    ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                    value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={handleKeyDown}
                    placeholder={placeholder} rows={2}
                    className="flex-1 px-2 py-1 text-sm rounded-lg border border-teal-300 bg-white focus:ring-2 focus:ring-teal-500/30 resize-none"
                />
            ) : type === 'select' ? (
                <select
                    ref={inputRef as React.RefObject<HTMLSelectElement>}
                    value={draft} onChange={e => setDraft(e.target.value)}
                    className="flex-1 px-2 py-1 text-sm rounded-lg border border-teal-300 bg-white focus:ring-2 focus:ring-teal-500/30"
                >
                    {options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            ) : (
                <input
                    ref={inputRef as React.RefObject<HTMLInputElement>}
                    type={type} value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="flex-1 px-2 py-1 text-sm rounded-lg border border-teal-300 bg-white focus:ring-2 focus:ring-teal-500/30 w-20"
                />
            )}
            <button onClick={confirm} disabled={saving}
                className="p-1 rounded-md bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors">
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
            </button>
            <button onClick={cancel} className="p-1 rounded-md bg-slate-200 text-slate-600 hover:bg-red-100 hover:text-red-500 transition-colors">
                <X className="w-3 h-3" />
            </button>
        </div>
    )
}

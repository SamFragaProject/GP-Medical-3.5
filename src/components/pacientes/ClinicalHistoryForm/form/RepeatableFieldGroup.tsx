import React from 'react';

interface RepeatableFieldGroupProps {
  title: string;
  items: any[];
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  children: (item: any, index: number) => React.ReactNode;
}

const RepeatableFieldGroup: React.FC<RepeatableFieldGroupProps> = ({
  title,
  items,
  onAddItem,
  onRemoveItem,
  children,
}) => {
  return (
    <div>
      <h4 className="text-md font-semibold text-slate-900 mb-2">{title}</h4>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="p-4 border rounded-md relative bg-gray-50/50">
            <button
              type="button"
              onClick={() => onRemoveItem(index)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-2xl leading-none p-1"
              aria-label="Eliminar Fila"
            >
              &times;
            </button>
             {children(item, index)}
          </div>
        ))}
         {items.length === 0 && <p className="text-sm text-slate-600 italic">No hay registros.</p>}
      </div>
      <button
        type="button"
        onClick={onAddItem}
        className="mt-4 px-3 py-1.5 bg-blue-100 text-blue-800 text-sm font-semibold rounded-md hover:bg-blue-200"
      >
        + Agregar {title}
      </button>
    </div>
  );
};

export default RepeatableFieldGroup;
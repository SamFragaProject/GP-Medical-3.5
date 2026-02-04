import React from 'react';

interface ReportTableProps {
    headers: (string | React.ReactNode)[];
    data: (string | React.ReactNode)[][];
    colWidths?: string[];
    rowSpans?: { [key: string]: number }; // e.g., { '0,2': 3 } for row 0, col 2
}

const ReportTable: React.FC<ReportTableProps> = ({ headers, data, colWidths, rowSpans = {} }) => {
    return (
        <table className="w-full border-collapse border border-gray-400 text-sm text-gray-800">
            <thead>
                <tr>
                    {headers.map((header, index) => (
                        <th
                            key={index}
                            className={`border border-gray-400 p-1.5 bg-gray-100 font-bold text-left ${colWidths?.[index] ?? ''}`}
                        >
                            {header}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map((row, rowIndex) => {
                    let colCount = 0;
                    return (
                        <tr key={rowIndex}>
                            {row.map((cell, cellIndex) => {
                                const rowSpanKey = `${rowIndex},${cellIndex}`;
                                if (rowSpans[rowSpanKey]) {
                                    return (
                                        <td
                                            key={cellIndex}
                                            rowSpan={rowSpans[rowSpanKey]}
                                            className="border border-gray-400 p-1.5 align-top"
                                        >
                                            {cell}
                                        </td>
                                    );
                                }

                                // Check if this cell should be skipped due to a rowspan in a previous row
                                let shouldSkip = false;
                                for (let i = 1; i < rowIndex + 1; i++) {
                                    const prevRowIndex = rowIndex - i;
                                    const prevRowSpanKey = `${prevRowIndex},${cellIndex}`;
                                    if (rowSpans[prevRowSpanKey] && rowSpans[prevRowSpanKey] > i) {
                                        shouldSkip = true;
                                        break;
                                    }
                                }
                                if (shouldSkip) return null;


                                const cellClass = headers.length === 2 && cellIndex === 0 ? "font-bold" : "";
                                return (
                                    <td key={cellIndex} className={`border border-gray-400 p-1.5 align-top ${cellClass}`}>
                                        {cell}
                                    </td>
                                );
                            })}
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};


export default ReportTable;

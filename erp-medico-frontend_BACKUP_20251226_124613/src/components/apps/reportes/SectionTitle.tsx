import React from 'react';

interface SectionTitleProps {
    children: React.ReactNode;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ children }) => {
    return (
        <h2 className="bg-gray-200 text-gray-900 font-bold p-2 my-3 uppercase text-sm tracking-wider">
            {children}
        </h2>
    );
};

export default SectionTitle;

import { useEffect } from 'react';

interface MetaProps {
    title: string;
    description?: string;
}

export function useMeta({ title, description }: MetaProps) {
    useEffect(() => {
        // Update Title
        const prevTitle = document.title;
        document.title = `${title} | GPMedical MediFlow`;

        // Update Description
        let metaDescription = document.querySelector('meta[name="description"]');
        let prevDescription = '';

        if (metaDescription) {
            prevDescription = metaDescription.getAttribute('content') || '';
            if (description) {
                metaDescription.setAttribute('content', description);
            }
        } else if (description) {
            metaDescription = document.createElement('meta');
            metaDescription.setAttribute('name', 'description');
            metaDescription.setAttribute('content', description);
            document.head.appendChild(metaDescription);
        }

        return () => {
            document.title = prevTitle;
            if (metaDescription && prevDescription) {
                metaDescription.setAttribute('content', prevDescription);
            }
        };
    }, [title, description]);
}

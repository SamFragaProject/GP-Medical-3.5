

import React from 'react';

type IconProps = {
  className?: string;
  id?: string;
}

export const UploadIcon: React.FC<IconProps> = ({ className, id }) => (
  <svg id={id} className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

export const DownloadIcon: React.FC<IconProps> = ({id}) => (
  <svg id={id} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

export const PrintIcon: React.FC<IconProps> = ({id}) => (
    <svg id={id} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
    </svg>
);

export const MessageIcon: React.FC<IconProps> = ({id}) => (
    <svg id={id} xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

export const SendIcon: React.FC<IconProps> = ({id}) => (
    <svg id={id} xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);

export const UserIcon: React.FC<IconProps> = ({id}) => (
    <svg id={id} xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" display="block">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);
UserIcon.displayName = 'UserIcon';


export const CalendarIcon: React.FC<IconProps> = ({id}) => (
    <svg id={id} xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" display="block">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);
CalendarIcon.displayName = 'CalendarIcon';


export const HeartIcon: React.FC<IconProps> = ({id}) => (
    <svg id={id} xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" display="block">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
);
HeartIcon.displayName = 'HeartIcon';


export const BirthdayIcon: React.FC<IconProps> = ({id}) => (
    <svg id={id} xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" display="block">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.235a2 2 0 01-1.28-1.83V12a2 2 0 00-2-2H6a2 2 0 00-2 2v1.405a2 2 0 01-1.28 1.83L3 17h18l-.94-1.535z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 7v3m0 0v2m0-2h.01M12 12h.01M12 12a1 1 0 100-2 1 1 0 000 2z" />
    </svg>
);
BirthdayIcon.displayName = 'BirthdayIcon';

export const BrainCircuitIcon: React.FC<IconProps> = ({ className, id }) => (
  <svg id={id} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.47 2.118v-.007a2.25 2.25 0 0 1-2.24-1.845 2.25 2.25 0 0 0-1.03-2.101m5.78-1.128a2.25 2.25 0 0 0-1.03 2.101M15.79 16.122a3 3 0 0 1 5.78 1.128 2.25 2.25 0 0 0 2.47 2.118v-.007a2.25 2.25 0 0 0 2.24-1.845 2.25 2.25 0 0 1 1.03-2.101m-5.78-1.128a2.25 2.25 0 0 1 1.03 2.101m0 0a4.5 4.5 0 0 1-7.5 0m7.5 0a4.5 4.5 0 0 0-7.5 0M12 10.875a2.25 2.25 0 0 0-2.25 2.25v.007a2.25 2.25 0 0 0 4.5 0v-.007a2.25 2.25 0 0 0-2.25-2.25z" />
  </svg>
);

export const DocumentChartIcon: React.FC<IconProps> = ({ className, id }) => (
    <svg id={id} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
);

export const StethoscopeIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75h16.5m-16.5 0A2.25 2.25 0 0 1 5.25 7.5h13.5a2.25 2.25 0 0 1 2.25 2.25m-16.5 0v1.5A2.25 2.25 0 0 0 5.25 13.5h13.5a2.25 2.25 0 0 0 2.25-2.25v-1.5m-16.5 0a2.25 2.25 0 0 0-2.25 2.25v3.75a2.25 2.25 0 0 0 2.25 2.25h1.5a2.25 2.25 0 0 0 2.25-2.25v-3.75a2.25 2.25 0 0 0-2.25-2.25h-1.5m16.5 0a2.25 2.25 0 0 1 2.25 2.25v3.75a2.25 2.25 0 0 1-2.25 2.25h-1.5a2.25 2.25 0 0 1-2.25-2.25v-3.75a2.25 2.25 0 0 1 2.25-2.25h1.5Z" />
  </svg>
);

export const LungsIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75c-1.886 0-3.447 1.28-3.956 3.033a2.25 2.25 0 0 0-.544 1.217v5.4a2.25 2.25 0 0 0 2.25 2.25h4.5a2.25 2.25 0 0 0 2.25-2.25v-5.4a2.25 2.25 0 0 0-.544-1.217A4.498 4.498 0 0 0 12 6.75ZM12 6.75a4.498 4.498 0 0 1 3.956 3.033m-7.912 0A4.498 4.498 0 0 1 12 6.75m-3.956 3.033H12m3.956 0H12m-3.956 0v5.4a2.25 2.25 0 0 0 2.25 2.25h4.5a2.25 2.25 0 0 0 2.25-2.25v-5.4" />
  </svg>
);

export const EarIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25c0-2.062 1.332-3.81 3.126-4.5H12.75a5.25 5.25 0 0 0-5.25 5.25v.75a.75.75 0 0 1-.75.75H5.25a.75.75 0 0 1-.75-.75V12a7.5 7.5 0 0 1 15 0v5.25a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1-.75-.75v-2.25Z" />
  </svg>
);

export const BeakerIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 2.25H14.25M9 3.75h6M9 9.75h.008v.007H9V9.75Zm.75 4.5h4.5M3.75 3.75h16.5c.621 0 1.125.504 1.125 1.125v13.5A2.25 2.25 0 0 1 19.5 21H4.5A2.25 2.25 0 0 1 2.25 18.75V4.875c0-.621.504-1.125 1.125-1.125Z" />
  </svg>
);

export const XRayIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
     <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
  </svg>
);

export const RulerIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
     <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6.75a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0ZM18.75 10.5h.375a.375.375 0 0 1 .375.375v.375a.375.375 0 0 1-.375.375h-.375V10.5Zm-1.5 0h.375a.375.375 0 0 1 .375.375v.375a.375.375 0 0 1-.375.375h-.375V10.5Zm-1.5 0h.375a.375.375 0 0 1 .375.375v.375a.375.375 0 0 1-.375.375h-.375V10.5Zm-1.5 0h.375a.375.375 0 0 1 .375.375v.375a.375.375 0 0 1-.375.375h-.375V10.5Zm-1.5 0h.375a.375.375 0 0 1 .375.375v.375a.375.375 0 0 1-.375.375h-.375V10.5Zm-1.5 0h.375a.375.375 0 0 1 .375.375v.375a.375.375 0 0 1-.375.375h-.375V10.5Zm-1.5 0h.375a.375.375 0 0 1 .375.375v.375a.375.375 0 0 1-.375.375h-.375V10.5ZM5.625 10.5h.375a.375.375 0 0 1 .375.375v.375a.375.375 0 0 1-.375.375h-.375V10.5Z" />
  </svg>
);

export const EyeIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

export const CheckCircleIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
    </svg>
);

export const ExclamationCircleIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
);
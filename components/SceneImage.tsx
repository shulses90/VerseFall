import React from 'react';

interface SceneImageProps {
  src: string | null;
  alt: string;
  state: 'loading' | 'loaded' | 'error';
}

const SceneImage: React.FC<SceneImageProps> = ({ src, alt, state }) => {
  return (
    <div className="w-full aspect-video bg-black border-2 border-amber-600/50 mb-4 overflow-hidden">
      {state === 'loaded' && src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover animate-fade-in" />
      ) : state === 'loading' ? (
        <div className="w-full h-full flex flex-col justify-center items-center text-amber-600/75 animate-pulse">
            <svg className="w-10 h-10 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            <p className="uppercase tracking-widest text-sm">Acquiring Vis-Feed...</p>
        </div>
      ) : (
         <div className="w-full h-full flex flex-col justify-center items-center text-red-500/75 p-4 text-center">
            <svg className="w-10 h-10 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="uppercase tracking-widest text-sm">Visual Feed Failed</p>
            <p className="text-xs mt-1 text-gray-500">API quota exceeded. The story continues.</p>
        </div>
      )}
    </div>
  );
};

export default SceneImage;
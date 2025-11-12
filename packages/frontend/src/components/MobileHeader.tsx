// packages/frontend/src/components/MobileHeader.tsx

import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MobileHeaderProps {
  title: string;
  subtitle: string;
  canGoBack?: boolean;
}

// ==========================================================
// CORREÇÃO AQUI: export function (named export)
// ==========================================================
export function MobileHeader({ title, subtitle, canGoBack = false }: MobileHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex-shrink-0 flex items-center space-x-3 p-4 bg-white rounded-b-2xl shadow-md sticky top-0 z-10">
      {canGoBack && (
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 text-brand-blue-dark bg-brand-gray-light rounded-full"
        >
          <ArrowLeft size={24} />
        </button>
      )}
      <div>
        <h1 className="text-2xl font-black text-brand-blue-dark">{title}</h1>
        <p className="text-zinc-600 font-medium">{subtitle}</p>
      </div>
    </div>
  );
}
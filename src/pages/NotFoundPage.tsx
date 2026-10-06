import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-neutral-800 text-amber-500 flex items-center justify-center mb-4">
        <HelpCircle className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">404 - Page Not Found</h1>
      <p className="text-sm text-neutral-400 max-w-sm mb-6">
        The requested screen does not exist or has been relocated within the Nino Luxury Hotel.
      </p>
      <Button variant="primary" size="sm" onClick={() => navigate('/dashboard')} icon={<Home className="w-4 h-4" />}>
        Return to Dashboard
      </Button>
    </div>
  );
};

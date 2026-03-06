import { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface ConfigCheckProps {
  children: ReactNode;
}

export function ConfigCheck({ children }: ConfigCheckProps) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const configured = !!(supabaseUrl && supabaseKey);
  const requireConfig = import.meta.env.VITE_SUPABASE_BYPASS === 'false';
  if (!configured && requireConfig) {
    return (
      <div className="min-h-screen bg-pro-stone flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-8 h-8 text-amber-600" />
            <h1 className="text-2xl font-bold text-pro-charcoal">Configuration Required</h1>
          </div>
          <p className="text-pro-charcoal mb-4">
            The application is missing required Supabase configuration.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded p-4 space-y-2">
            <p className="text-sm text-pro-charcoal">
              <strong>Missing:</strong>
            </p>
            <ul className="list-disc list-inside text-sm text-pro-warm-gray space-y-1">
              {!supabaseUrl && <li>VITE_SUPABASE_URL</li>}
              {!supabaseKey && <li>VITE_SUPABASE_ANON_KEY</li>}
            </ul>
          </div>
          <p className="text-xs text-pro-warm-gray mt-4">
            Please check your .env file and ensure all required environment variables are set.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

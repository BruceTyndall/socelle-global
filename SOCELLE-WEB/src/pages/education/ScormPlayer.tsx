/**
 * ScormPlayer — SCORM content player component
 * Renders SCORM content in iframe with JavaScript SCORM API bridge
 * Calls scorm-runtime edge function for Initialize/GetValue/SetValue/Commit/Finish
 */
import { useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, AlertTriangle, ExternalLink } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface ScormPlayerProps {
  scormPackageId: string;
  enrollmentId: string;
  onComplete?: () => void;
}

interface ScormData {
  launch_url: string;
  suspend_data?: string;
  lesson_location?: string;
  lesson_status?: string;
}

// SCORM 1.2 API bridge
class ScormApiBridge {
  private packageId: string;
  private enrollmentId: string;
  private data: Record<string, string> = {};
  private initialized = false;

  constructor(packageId: string, enrollmentId: string, initialData: Partial<ScormData>) {
    this.packageId = packageId;
    this.enrollmentId = enrollmentId;
    if (initialData.suspend_data) this.data['cmi.suspend_data'] = initialData.suspend_data;
    if (initialData.lesson_location) this.data['cmi.core.lesson_location'] = initialData.lesson_location;
    if (initialData.lesson_status) this.data['cmi.core.lesson_status'] = initialData.lesson_status;
  }

  private async callRuntime(method: string, key?: string, value?: string): Promise<string> {
    if (!isSupabaseConfigured) return 'false';

    try {
      const { data, error } = await supabase.functions.invoke('scorm-runtime', {
        body: {
          method,
          package_id: this.packageId,
          enrollment_id: this.enrollmentId,
          key,
          value,
        },
      });

      if (error) {
        console.error('SCORM runtime error:', error);
        return 'false';
      }

      return data?.value ?? 'true';
    } catch (err) {
      console.error('SCORM runtime call failed:', err);
      return 'false';
    }
  }

  LMSInitialize(_param: string): string {
    this.initialized = true;
    void this.callRuntime('Initialize');
    return 'true';
  }

  LMSGetValue(key: string): string {
    if (this.data[key] !== undefined) return this.data[key];
    // Synchronous return for cached values
    return '';
  }

  LMSSetValue(key: string, value: string): string {
    this.data[key] = value;
    void this.callRuntime('SetValue', key, value);
    return 'true';
  }

  LMSCommit(_param: string): string {
    void this.callRuntime('Commit');
    return 'true';
  }

  LMSFinish(_param: string): string {
    this.initialized = false;
    void this.callRuntime('Finish');
    return 'true';
  }

  LMSGetLastError(): string {
    return '0';
  }

  LMSGetErrorString(_errorCode: string): string {
    return 'No Error';
  }

  LMSGetDiagnostic(_errorCode: string): string {
    return '';
  }
}

export default function ScormPlayer({ scormPackageId, enrollmentId, onComplete }: ScormPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const apiBridgeRef = useRef<ScormApiBridge | null>(null);

  // Load SCORM package data
  const { data: scormData = null, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['scorm-package', scormPackageId, enrollmentId],
    queryFn: async (): Promise<ScormData> => {
      const { data: pkg, error: pkgError } = await supabase
        .from('scorm_packages')
        .select('launch_url')
        .eq('id', scormPackageId)
        .single();

      if (pkgError || !pkg) {
        throw new Error('SCORM package not found');
      }

      // Load tracking data for resume
      const { data: tracking } = await supabase
        .from('scorm_tracking')
        .select('suspend_data, lesson_location, lesson_status')
        .eq('scorm_package_id', scormPackageId)
        .eq('enrollment_id', enrollmentId)
        .maybeSingle();

      return {
        launch_url: (pkg as { launch_url: string }).launch_url,
        suspend_data: (tracking as Record<string, string> | null)?.suspend_data,
        lesson_location: (tracking as Record<string, string> | null)?.lesson_location,
        lesson_status: (tracking as Record<string, string> | null)?.lesson_status,
      };
    },
    enabled: isSupabaseConfigured,
  });

  const error = queryError ? (queryError instanceof Error ? queryError.message : 'Failed to load SCORM package') : (!isSupabaseConfigured ? 'Database not connected' : null);

  // Install SCORM API bridge on window
  const installBridge = useCallback(() => {
    if (!scormData) return;

    const bridge = new ScormApiBridge(scormPackageId, enrollmentId, scormData);
    apiBridgeRef.current = bridge;

    // SCORM 1.2 expects window.API
    const win = iframeRef.current?.contentWindow;
    const globalWindow = window as unknown as Record<string, unknown>;
    if (win) {
      try {
        (win as unknown as Record<string, unknown>).API = bridge;
      } catch {
        // Cross-origin, set on parent instead
        globalWindow.API = bridge;
      }
    } else {
      globalWindow.API = bridge;
    }
  }, [scormData, scormPackageId, enrollmentId]);

  useEffect(() => {
    installBridge();

    // Listen for completion messages from SCORM content
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'scorm-complete' && onComplete) {
        onComplete();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      // Clean up
      delete (window as unknown as Record<string, unknown>).API;
    };
  }, [installBridge, onComplete]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
        <span className="ml-3 text-sm text-graphite/60">Loading SCORM content...</span>
      </div>
    );
  }

  if (error || !scormData) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-8 h-8 text-signal-warn mx-auto mb-3" />
        <p className="text-graphite/60 text-sm">{error || 'SCORM content not available'}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 bg-mn-surface border-b border-graphite/5">
        <span className="text-xs text-graphite/50">SCORM Content</span>
        <a
          href={scormData.launch_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-accent hover:text-accent-hover flex items-center gap-1"
        >
          Open in new window <ExternalLink className="w-3 h-3" />
        </a>
      </div>
      <iframe
        ref={iframeRef}
        src={scormData.launch_url}
        className="flex-1 w-full border-0 min-h-[500px]"
        title="SCORM Content"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        onLoad={installBridge}
      />
    </div>
  );
}

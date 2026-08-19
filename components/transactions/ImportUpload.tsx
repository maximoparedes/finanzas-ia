'use client';

import { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface Props {
  onImported: () => void;
}

export function ImportUpload({ onImported }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = async (file: File) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/transactions/import', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? 'No se pudo importar el archivo');
        return;
      }

      toast.success(
        `${data.inserted} transacciones importadas` +
          (data.duplicates > 0 ? `, ${data.duplicates} ya existían` : '') +
          (data.skipped > 0 ? `, ${data.skipped} filas ignoradas` : ''),
      );
      onImported();
    } catch {
      toast.error('No se pudo importar el archivo');
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()} disabled={loading}>
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
        Importar Excel/CSV de Mercado Pago
      </Button>
    </div>
  );
}

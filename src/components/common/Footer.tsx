import React from 'react';
import { ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border/40 py-6 px-6 bg-card/20 text-xs text-muted-foreground">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>AEGIS HOSTEL Zero-Trust SaaS Platform &copy; 2026</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-[11px] font-mono text-muted-foreground/70">
            RLS-Enforced PostgreSQL &bull; Strict CSP &bull; AES-256
          </span>
        </div>
      </div>
    </footer>
  );
}

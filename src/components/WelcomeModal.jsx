import React, { useEffect, useRef } from 'react';
import { RefreshCw, X } from 'lucide-react';

export default function WelcomeModal({ onClose, onRefresh }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const dialog = dialogRef.current;
    closeRef.current?.focus();
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const controls = [...dialog.querySelectorAll('button:not([disabled])')];
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first) return;
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      previousFocus?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="sch-detail-backdrop" onMouseDown={onClose}>
      <section ref={dialogRef} className="sch-detail-modal sch-welcome-modal" role="dialog" aria-modal="true" aria-labelledby="sch-welcome-title" aria-describedby="sch-welcome-description" onMouseDown={(event) => event.stopPropagation()}>
        <header className="sch-detail-header sch-welcome-header">
          <div className="sch-detail-topline">
            <span className="sch-detail-eyebrow">A QUICK NOTE BEFORE YOU EXPLORE</span>
            <button ref={closeRef} className="sch-detail-close" onClick={onClose} aria-label="Close welcome message" type="button"><X size={20} /></button>
          </div>
          <span className="sch-welcome-badge"><RefreshCw size={15} /> UPDATED WEEKLY</span>
          <h2 id="sch-welcome-title">Fresh leads, every week.</h2>
          <p id="sch-welcome-description">We update the shared directory each week with new opportunities from our tracked sources.</p>
        </header>
        <div className="sch-detail-body sch-welcome-body">
          <div className="sch-welcome-callout">
            <strong>Want to check right now?</strong>
            <p>Choose <b>Refresh feeds</b> to check the sources and update the listings in your browser. This can take a few minutes. The same button is at the top of the site.</p>
          </div>
          <p className="sch-welcome-note">Your instant refresh is saved in this browser. The weekly update is the shared directory everyone sees.</p>
        </div>
        <footer className="sch-detail-actions sch-welcome-actions">
          <button className="sch-button sch-button-light" onClick={onClose} type="button">Explore opportunities</button>
          <button className="sch-button sch-button-primary" onClick={onRefresh} type="button"><RefreshCw size={16} /> Refresh feeds now</button>
        </footer>
      </section>
    </div>
  );
}

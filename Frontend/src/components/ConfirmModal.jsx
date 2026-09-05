import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText }) {
  const { t } = useLanguage();
  const actualConfirmText = confirmText || t('common.confirm');
  const actualCancelText = cancelText || t('common.cancel');
  const modalRef = useRef(null);
  const confirmBtnRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    
    // Focus the primary button when opened
    confirmBtnRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
      
      // Simple focus trap
      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElements && focusableElements.length > 0) {
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backdropFilter: 'blur(2px)'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="card"
        style={{
          width: '100%',
          maxWidth: '400px',
          margin: 0,
          backgroundColor: 'var(--bg-color)',
          border: '1px solid var(--secondary-color)',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          position: 'relative'
        }}
      >
        <button 
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--nav-text)',
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '44px',
            minHeight: '44px'
          }}
        >
          <X size={20} />
        </button>

        <h2 id="modal-title" style={{ fontSize: '1.5rem', marginTop: 0, color: 'var(--text-color)' }}>{title}</h2>
        <p style={{ fontSize: '1.1rem', color: 'var(--nav-text)', marginBottom: '2rem' }}>{message}</p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'flex-end' }}>
          <button 
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              color: 'var(--text-color)',
              border: '2px solid var(--secondary-color)',
              flex: '1 1 0',
              minWidth: '120px',
              padding: '0.8rem 1.5rem',
              borderRadius: '8px'
            }}
          >
            {actualCancelText}
          </button>
          <button 
            ref={confirmBtnRef}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{
              backgroundColor: 'var(--primary-color)',
              color: 'var(--btn-text-color)',
              border: '2px solid transparent',
              flex: '1 1 0',
              minWidth: '120px',
              padding: '0.8rem 1.5rem',
              borderRadius: '8px'
            }}
          >
            {actualConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

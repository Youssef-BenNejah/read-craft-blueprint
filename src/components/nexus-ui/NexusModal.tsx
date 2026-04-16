import React from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}

const NexusModal: React.FC<ModalProps> = ({ open, onClose, title, children, wide }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className={`relative bg-surface-modal border border-brd-medium rounded-xl shadow-lg animate-modal-in max-h-[90vh] overflow-y-auto scrollbar-thin ${wide ? 'w-[700px]' : 'w-[520px]'}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-brd-subtle sticky top-0 bg-surface-modal z-10">
          <h2 className="font-mono text-sm font-semibold text-txt-primary">{title}</h2>
          <button onClick={onClose} className="text-txt-muted hover:text-txt-primary text-lg transition-colors">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default NexusModal;

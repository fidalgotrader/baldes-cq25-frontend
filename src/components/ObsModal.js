import React, { useState } from 'react';

export default function ObsModal({ label, value, onClose, onSave, readOnly }) {
  const [text, setText] = useState(value || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try { await onSave(text || null); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>💬 Observações — {label}</h3>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <textarea
            className="form-control"
            rows={6}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={readOnly ? 'Sem observações' : 'Escreva as observações aqui...'}
            disabled={readOnly}
            style={{ resize: 'vertical' }}
          />
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          {!readOnly && (
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'A guardar...' : 'Guardar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

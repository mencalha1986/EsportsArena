import { useEffect, useRef, useState } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  options?: SelectOption[];
  groups?: SelectGroup[];
  disabled?: boolean;
  style?: React.CSSProperties;
}

export default function CustomSelect({
  value,
  onChange,
  placeholder = 'Selecione...',
  options,
  groups,
  disabled = false,
  style,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const allOptions: SelectOption[] = groups
    ? groups.flatMap(g => g.options)
    : options ?? [];

  const selectedLabel = allOptions.find(o => o.value === value)?.label;

  const triggerStyle: React.CSSProperties = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '9px 12px',
    background: disabled ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
    border: `1px solid ${open ? 'var(--accent)' : 'var(--border)'}`,
    boxShadow: open ? '0 0 0 3px var(--accent-glow)' : 'none',
    borderRadius: 'var(--radius-sm)',
    color: value ? 'var(--text)' : 'var(--text-muted)',
    fontSize: 14,
    cursor: disabled ? 'not-allowed' : 'pointer',
    outline: 'none',
    transition: 'border-color 0.18s, box-shadow 0.18s',
    boxSizing: 'border-box',
    ...style,
  };

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    right: 0,
    zIndex: 200,
    background: '#13132a',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    maxHeight: 260,
    overflowY: 'auto',
    padding: '4px 0',
  };

  const optionStyle = (selected: boolean): React.CSSProperties => ({
    padding: '8px 14px',
    fontSize: 13,
    color: selected ? 'var(--accent)' : 'var(--text)',
    background: selected ? 'var(--accent-glow)' : 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    transition: 'background 0.1s',
  });

  const groupLabelStyle: React.CSSProperties = {
    padding: '8px 14px 4px',
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: 'var(--text-muted)',
    borderTop: '1px solid var(--border)',
    marginTop: 2,
  };

  function renderOption(opt: SelectOption) {
    const selected = opt.value === value;
    return (
      <div
        key={opt.value}
        style={optionStyle(selected)}
        onMouseEnter={e => {
          if (!selected) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.05)';
        }}
        onMouseLeave={e => {
          if (!selected) (e.currentTarget as HTMLDivElement).style.background = 'transparent';
        }}
        onMouseDown={e => {
          e.preventDefault();
          onChange(opt.value);
          setOpen(false);
        }}
      >
        {selected && <span style={{ color: 'var(--accent)', fontSize: 12 }}>✓</span>}
        {opt.label}
      </div>
    );
  }

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <button
        type="button"
        style={triggerStyle}
        disabled={disabled}
        onClick={() => !disabled && setOpen(o => !o)}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedLabel ?? placeholder}
        </span>
        <span style={{
          color: 'var(--text-muted)',
          fontSize: 11,
          flexShrink: 0,
          marginLeft: 8,
          transform: open ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.15s',
        }}>▼</span>
      </button>

      {open && (
        <div style={dropdownStyle}>
          {placeholder && (
            <div
              style={optionStyle(value === '')}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = value === '' ? 'var(--accent-glow)' : 'transparent'; }}
              onMouseDown={e => { e.preventDefault(); onChange(''); setOpen(false); }}
            >
              <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{placeholder}</span>
            </div>
          )}

          {groups
            ? groups.map((g, i) => (
                <div key={g.label}>
                  <div style={{ ...groupLabelStyle, borderTop: i === 0 ? 'none' : '1px solid var(--border)', marginTop: i === 0 ? 0 : 2 }}>
                    {g.label}
                  </div>
                  {g.options.map(renderOption)}
                </div>
              ))
            : (options ?? []).map(renderOption)}
        </div>
      )}
    </div>
  );
}

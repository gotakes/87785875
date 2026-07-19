const fs = require('fs');

const content = `import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, MapPin } from 'lucide-react';

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

interface Place {
  display_name: string;
  lat: string;
  lon: string;
}

export default function AddressAutocomplete({ value, onChange, placeholder, className }: AddressAutocompleteProps) {
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!value || value.length < 3 || !isTyping) {
      setResults([]);
      setErrorMsg(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setErrorMsg(null);
      
      try {
        // Usa nosso proxy inteligente que tenta Nominatim e faz fallback pra IA
        const response = await fetch(\`/api/geocode-search?q=\${encodeURIComponent(value)}\`);
        const data = await response.json();
        
        if (data && data.length > 0) {
           setResults(data);
           setShowDropdown(true);
        } else {
           setErrorMsg('Nenhum endereço encontrado.');
           setResults([]);
           setShowDropdown(true);
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
        setErrorMsg('Erro de conexão ao buscar endereços.');
        setResults([]);
        setShowDropdown(true);
      } finally {
        setLoading(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [value, isTyping]);

  const handleSelect = (place: Place) => {
    setIsTyping(false);
    onChange(place.display_name);
    setShowDropdown(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsTyping(true);
    onChange(e.target.value);
  }

  return (
    <div className={\`relative \${className}\`} ref={wrapperRef}>
      <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700 placeholder-slate-400"
      />
      {loading && (
        <Loader2 className="absolute right-3 top-3 text-slate-400 animate-spin" size={18} />
      )}
      
      {showDropdown && (results.length > 0 || errorMsg) && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto text-left">
          {errorMsg && (
            <li className="px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm text-red-500">{errorMsg}</li>
          )}
          {results.map((place, idx) => (
            <li 
              key={idx}
              onClick={() => handleSelect(place)}
              className="px-3 py-2 md:px-4 md:py-3 hover:bg-indigo-50 cursor-pointer text-xs md:text-sm text-slate-700 border-b border-slate-100 last:border-b-0 leading-tight"
            >
              {place.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
`;
fs.writeFileSync('src/components/AddressAutocomplete.tsx', content);

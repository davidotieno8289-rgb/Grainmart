import React from 'react';
import { Search, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value: controlledValue,
  onChange,
  placeholder = 'Search grains, sellers, locations...',
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [localValue, setLocalValue] = React.useState(searchParams.get('search') || '');
  
  const value = controlledValue ?? localValue;

  const handleChange = (newValue: string) => {
    if (onChange) {
      onChange(newValue);
    } else {
      setLocalValue(newValue);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      searchParams.set('search', value.trim());
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  };

  const handleClear = () => {
    handleChange('');
    searchParams.delete('search');
    setSearchParams(searchParams);
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 bg-white border border-border rounded-lg focus:outline-none focus:border-amber focus:ring-2 focus:ring-amber-pale"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-cream rounded-full"
        >
          <X className="w-4 h-4 text-muted" />
        </button>
      )}
    </form>
  );
};

export default SearchBar;

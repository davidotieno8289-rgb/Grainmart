import React, { useState, useCallback } from 'react';

interface SliderProps {
  min: number;
  max: number;
  step?: number;
  value?: [number, number];
  defaultValue?: [number, number];
  onChange?: (value: [number, number]) => void;
  formatLabel?: (value: number) => string;
  label?: string;
  className?: string;
}

const Slider: React.FC<SliderProps> = ({
  min,
  max,
  step = 1,
  value: controlledValue,
  defaultValue = [min, max],
  onChange,
  formatLabel = (v) => v.toString(),
  label,
  className = '',
}) => {
  const [internalValue, setInternalValue] = useState<[number, number]>(defaultValue);
  const value = controlledValue ?? internalValue;

  const getPercentage = (val: number) => ((val - min) / (max - min)) * 100;

  const handleMinChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.min(Number(e.target.value), value[1] - step);
    const newValue: [number, number] = [newMin, value[1]];
    setInternalValue(newValue);
    onChange?.(newValue);
  }, [value, step, onChange]);

  const handleMaxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(Number(e.target.value), value[0] + step);
    const newValue: [number, number] = [value[0], newMax];
    setInternalValue(newValue);
    onChange?.(newValue);
  }, [value, step, onChange]);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-brown mb-3">
          {label}
        </label>
      )}
      
      <div className="relative h-2 mb-6">
        {/* Track background */}
        <div className="absolute inset-0 bg-border rounded-full" />
        
        {/* Active track */}
        <div 
          className="absolute h-full bg-amber rounded-full"
          style={{
            left: `${getPercentage(value[0])}%`,
            right: `${100 - getPercentage(value[1])}%`,
          }}
        />
        
        {/* Min thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={handleMinChange}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-amber [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
          aria-label="Minimum value"
        />
        
        {/* Max thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[1]}
          onChange={handleMaxChange}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-amber [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
          aria-label="Maximum value"
        />
      </div>
      
      {/* Labels */}
      <div className="flex justify-between text-sm text-muted">
        <span>{formatLabel(value[0])}</span>
        <span>{formatLabel(value[1])}</span>
      </div>
    </div>
  );
};

export default Slider;

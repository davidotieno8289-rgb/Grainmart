import React from 'react';
import { Star, StarHalf } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  reviewCount?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  reviewCount,
  interactive = false,
  onChange,
}) => {
  const sizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const starSize = sizes[size];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

  const handleClick = (index: number) => {
    if (interactive && onChange) {
      onChange(index + 1);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <div className={`flex items-center ${interactive ? 'cursor-pointer' : ''}`}>
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <button
            key={`full-${i}`}
            type={interactive ? 'button' : undefined}
            onClick={() => handleClick(i)}
            className={interactive ? 'focus:outline-none' : ''}
            disabled={!interactive}
            aria-label={`Rate ${i + 1} stars`}
          >
            <Star className={`${starSize} fill-amber text-amber`} />
          </button>
        ))}
        
        {/* Half star */}
        {hasHalfStar && (
          <button
            type={interactive ? 'button' : undefined}
            onClick={() => handleClick(fullStars)}
            className={`relative ${interactive ? 'focus:outline-none' : ''}`}
            disabled={!interactive}
            aria-label={`Rate ${fullStars + 0.5} stars`}
          >
            <Star className={`${starSize} text-border`} />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className={`${starSize} fill-amber text-amber`} />
            </div>
          </button>
        )}
        
        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <button
            key={`empty-${i}`}
            type={interactive ? 'button' : undefined}
            onClick={() => handleClick(fullStars + (hasHalfStar ? 1 : 0) + i)}
            className={interactive ? 'focus:outline-none' : ''}
            disabled={!interactive}
            aria-label={`Rate ${fullStars + (hasHalfStar ? 1 : 0) + i + 1} stars`}
          >
            <Star className={`${starSize} text-border`} />
          </button>
        ))}
      </div>
      
      {/* Rating value */}
      {showValue && (
        <span className="text-sm font-medium text-dark ml-1">
          {rating.toFixed(1)}
        </span>
      )}
      
      {/* Review count */}
      {reviewCount !== undefined && (
        <span className="text-sm text-muted ml-1">
          ({reviewCount})
        </span>
      )}
    </div>
  );
};

export default StarRating;

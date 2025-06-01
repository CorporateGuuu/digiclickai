import React from 'react';
import { useState, useEffect, useRef } from 'react';
import styles from './PriceRangeSlider.module.css';

const PriceRangeSlider = ({ 
  min = 0, 
  max = 1000, 
  step = 10, 
  initialMin = 0, 
  initialMax = 1000, 
  onChange 
}) => {
  const [minValue, setMinValue] = useState(initialMin);
  const [maxValue, setMaxValue] = useState(initialMax);
  const minInputRef = useRef(null);
  const maxInputRef = useRef(null);
  const rangeRef = useRef(null);
  
  // Update the range progress bar
  useEffect(() => {
    if (rangeRef.current) {
      const minPercent = ((minValue - min) / (max - min)) * 100;
      const maxPercent = ((maxValue - min) / (max - min)) * 100;
      
      rangeRef.current.style.left = `${minPercent}%`;
      rangeRef.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minValue, maxValue, min, max]);
  
  // Handle min input change
  const handleMinChange = (e) => {
    const newMinValue = Math.min(+e.target.value, maxValue - step);
    setMinValue(newMinValue);
    
    if (onChange) {
      onChange([newMinValue, maxValue]);
    }
  };
  
  // Handle max input change
  const handleMaxChange = (e) => {
    const newMaxValue = Math.max(+e.target.value, minValue + step);
    setMaxValue(newMaxValue);
    
    if (onChange) {
      onChange([minValue, newMaxValue]);
    }
  };
  
  // Handle min slider change
  const handleMinSliderChange = (e) => {
    const newMinValue = Math.min(+e.target.value, maxValue - step);
    setMinValue(newMinValue);
    minInputRef.current.value = newMinValue;
    
    if (onChange) {
      onChange([newMinValue, maxValue]);
    }
  };
  
  // Handle max slider change
  const handleMaxSliderChange = (e) => {
    const newMaxValue = Math.max(+e.target.value, minValue + step);
    setMaxValue(newMaxValue);
    maxInputRef.current.value = newMaxValue;
    
    if (onChange) {
      onChange([minValue, newMaxValue]);
    }
  };
  
  return (
    <div className={styles.priceRangeSlider}>
      <div className={styles.sliderContainer}>
        <div className={styles.sliderTrack}></div>
        <div ref={rangeRef} className={styles.sliderRange}></div>
        
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minValue}
          onChange={handleMinSliderChange}
          className={`${styles.sliderThumb} ${styles.sliderThumbLeft}`}
        />
        
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxValue}
          onChange={handleMaxSliderChange}
          className={`${styles.sliderThumb} ${styles.sliderThumbRight}`}
        />
      </div>
      
      <div className={styles.priceInputs}>
        <div className={styles.priceInput}>
          <label htmlFor="min-price">Min</label>
          <div className={styles.inputWithPrefix}>
            <span>$</span>
            <input
              ref={minInputRef}
              type="number"
              id="min-price"
              min={min}
              max={max}
              value={minValue}
              onChange={handleMinChange}
            />
          </div>
        </div>
        
        <div className={styles.priceInput}>
          <label htmlFor="max-price">Max</label>
          <div className={styles.inputWithPrefix}>
            <span>$</span>
            <input
              ref={maxInputRef}
              type="number"
              id="max-price"
              min={min}
              max={max}
              value={maxValue}
              onChange={handleMaxChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceRangeSlider;

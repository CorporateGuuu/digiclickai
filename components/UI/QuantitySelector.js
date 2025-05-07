import React from 'react';
import { useState } from 'react';
import styles from './QuantitySelector.module.css';

const QuantitySelector = ({ initialValue = 1, min = 1, max = 99, onChange }) => {
  const [quantity, setQuantity] = useState(initialValue);

  const decreaseQuantity = () => {
    if (quantity > min) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      if (onChange) onChange(newQuantity);
    }
  };

  const increaseQuantity = () => {
    if (quantity < max) {
      const newQuantity = quantity + 1;
      setQuantity(newQuantity);
      if (onChange) onChange(newQuantity);
    }
  };

  const handleInputChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= min && value <= max) {
      setQuantity(value);
      if (onChange) onChange(value);
    }
  };

  return (
    <div className={styles.quantitySelector}>
      <button 
        className={styles.button} 
        onClick={decreaseQuantity}
        disabled={quantity <= min}
      >
        -
      </button>
      <input
        type="text"
        value={quantity}
        onChange={handleInputChange}
        className={styles.input}
      />
      <button 
        className={styles.button} 
        onClick={increaseQuantity}
        disabled={quantity >= max}
      >
        +
      </button>
    </div>
  );
};

export default QuantitySelector;

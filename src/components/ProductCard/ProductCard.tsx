import React from 'react';
import styles from './ProductCard.module.css';

export interface ProductCardProps {
  title: string;
  imageUrl: string;
  price?: string;
  description?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ title, imageUrl, price, description }) => {
  return (
    <div className={styles.card}>
      <img src={imageUrl} alt={title} className={styles.image} />
      <h2 className={styles.title}>{title}</h2>
      {price && <p className={styles.price}>{price}</p>}
      {description && <p className={styles.description}>{description}</p>}
    </div>
  );
};

export default ProductCard;
import Image from 'next/image';
import React from 'react';
import Link from 'next/link';
import styles from './CategoryCards.module.css';

const CategoryCards = () => {
  const categories = [
    {
      id: 1,
      name: "iPhone Parts",
      image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      description: "Quality replacement screens, batteries, and more for all iPhone models",
      slug: "iphone-parts"
    },
    {
      id: 2,
      name: "Samsung Parts",
      image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80",
      description: "Genuine and aftermarket parts for Samsung Galaxy devices",
      slug: "samsung-parts"
    },
    {
      id: 3,
      name: "iPad Parts",
      image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1073&q=80",
      description: "Screens, batteries, and other components for all iPad generations",
      slug: "ipad-parts"
    },
    {
      id: 4,
      name: "MacBook Parts",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1026&q=80",
      description: "Keyboards, screens, and batteries for MacBook Pro and Air",
      slug: "macbook-parts"
    },
    {
      id: 5,
      name: "Repair Tools",
      image: "https://images.unsplash.com/photo-1581092921461-7031e8fbc6e5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      description: "Professional-grade tools for device repair and maintenance",
      slug: "repair-tools"
    },
    {
      id: 6,
      name: "LCD Buyback",
      image: "https://images.unsplash.com/photo-1607435097405-db48f377bff6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      description: "Get cash for your used LCD screens and other components",
      slug: "lcd-buyback"
    }
  ];

  return (
    <section className={styles.categoryCards}>
      <div className="container">
        <h2 className={styles.title}>Shop by Category</h2>
        <p className={styles.subtitle}>Browse our extensive collection of repair parts and tools</p>

        <div className={styles.grid}>
          {categories.map((category) => (
            <Link href={`/categories/${category.slug}`} key={category.id} className={styles.card}>
              <div className={styles.imageContainer}>
                <img src={category.image} alt={category.name} className={styles.image} />
              </div>
              <div className={styles.content}>
                <h3 className={styles.name}>{category.name}</h3>
                <p className={styles.description}>{category.description}</p>
                <span className={styles.link}>Browse Products</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryCards;

import Image from 'next/image';
import React from 'react';
import styles from './Testimonials.module.css';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "John Smith",
      role: "Repair Shop Owner",
      image: "/images/testimonials/testimonial-1.jpg",
      quote: "MDTS has been our go-to supplier for over 2 years. Their parts are consistently high quality and their shipping is lightning fast.",
      stars: 5
    },
    {
      id: 2,
      name: "Sarah Johnson",
      role: "DIY Enthusiast",
      image: "/images/testimonials/testimonial-2.jpg",
      quote: "As someone who repairs my own devices, I can't recommend MDTS enough. Their detailed guides and quality parts have saved me hundreds of dollars.",
      stars: 5
    },
    {
      id: 3,
      name: "Michael Chen",
      role: "Tech Repair Specialist",
      image: "/images/testimonials/testimonial-3.jpg",
      quote: "The LCD buyback program is a game-changer for our business. We get fair prices for our used screens and the process is incredibly smooth.",
      stars: 4
    }
  ];

  return (
    <section className={styles.testimonials}>
      <div className="container">
        <h2 className={styles.title}>What Our Customers Say</h2>
        <p className={styles.subtitle}>Don't just take our word for it - hear from our satisfied customers</p>
        
        <div className={styles.grid}>
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className={styles.testimonial}>
              <div className={styles.stars}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < testimonial.stars ? styles.starFilled : styles.starEmpty}>★</span>
                ))}
              </div>
              <blockquote className={styles.quote}>"{testimonial.quote}"</blockquote>
              <div className={styles.author}>
                <div className={styles.avatar}>
                  <img src={testimonial.image} alt={testimonial.name} />
                </div>
                <div className={styles.info}>
                  <div className={styles.name}>{testimonial.name}</div>
                  <div className={styles.role}>{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

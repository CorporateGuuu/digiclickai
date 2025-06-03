import React from 'react';
import styles from './BlogPage.module.css';

const samplePosts = [
  {
    id: 1,
    title: 'Understanding AI in Modern Business',
    excerpt: 'Explore how AI is transforming industries and driving innovation.',
    date: 'July 10, 2023',
    image: '/images/blog-ai-business.jpg',
    category: 'AI Insights'
  },
  {
    id: 2,
    title: 'Top 5 Automation Tools for 2023',
    excerpt: 'A review of the best automation tools to boost your productivity.',
    date: 'June 25, 2023',
    image: '/images/blog-automation-tools.jpg',
    category: 'Automation'
  },
  {
    id: 3,
    title: 'SEO Strategies for AI-Powered Websites',
    excerpt: 'Learn how to optimize your AI-driven website for search engines.',
    date: 'June 5, 2023',
    image: '/images/blog-seo-strategies.jpg',
    category: 'SEO'
  }
];

const BlogPage = () => {
  return (
    <section className={styles.blog}>
      <h1 className={styles.title}>Blog</h1>
      <input
        type="search"
        placeholder="Search by title, description, tag or author"
        className={styles.searchInput}
      />
      <div className={styles.postsGrid}>
        {samplePosts.map(post => (
          <article key={post.id} className={styles.postCard}>
            <img src={post.image} alt={post.title} className={styles.postImage} />
            <div className={styles.postContent}>
              <div className={styles.postMeta}>
                <span className={styles.postCategory}>{post.category}</span>
                <span className={styles.postDate}>{post.date}</span>
              </div>
              <h2 className={styles.postTitle}>{post.title}</h2>
              <p className={styles.postExcerpt}>{post.excerpt}</p>
              <a href={`/blog/${post.id}`} className={styles.readMore}>Read More →</a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default BlogPage;

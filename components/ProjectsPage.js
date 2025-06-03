import React from 'react';
import styles from './ProjectsPage.module.css';

const projects = [
  {
    id: 1,
    title: 'AI Workflow Automation',
    description: 'Streamlining business processes with intelligent automation.',
    image: '/images/project-workflow.jpg',
    link: '/projects/ai-workflow-automation'
  },
  {
    id: 2,
    title: 'Data Analytics Platform',
    description: 'Advanced analytics for actionable business insights.',
    image: '/images/project-data-analytics.jpg',
    link: '/projects/data-analytics-platform'
  },
  {
    id: 3,
    title: 'Customer Support Chatbot',
    description: '24/7 AI-powered customer service chatbot.',
    image: '/images/project-chatbot.jpg',
    link: '/projects/customer-support-chatbot'
  }
];

const ProjectsPage = () => {
  return (
    <section className={styles.projects}>
      <h1 className={styles.title}>Projects</h1>
      <div className={styles.projectsGrid}>
        {projects.map(project => (
          <article key={project.id} className={styles.projectCard}>
            <img src={project.image} alt={project.title} className={styles.projectImage} />
            <h2 className={styles.projectTitle}>{project.title}</h2>
            <p className={styles.projectDescription}>{project.description}</p>
            <a href={project.link} className={styles.projectLink}>Learn More →</a>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ProjectsPage;

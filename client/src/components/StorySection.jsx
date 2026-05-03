import { motion } from 'framer-motion';

const StorySection = ({ 
  children, 
  id, 
  eyebrow, 
  title, 
  subtitle, 
  className = "",
  background = null
}) => {
  return (
    <section id={id} className={`story-section ${className}`}>
      {background && (
        <div 
          className="section-bg" 
          style={{ 
            backgroundImage: `url(${background})`,
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0.1,
            zIndex: -1,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      )}
      
      <motion.div 
        className="container"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        viewport={{ once: true, margin: "-100px" }}
      >
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        {title && <h1>{title}</h1>}
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
        <div className="section-content">
          {children}
        </div>
      </motion.div>
    </section>
  );
};

export default StorySection;

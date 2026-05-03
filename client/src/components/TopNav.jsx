import { motion } from 'framer-motion';

const TopNav = () => {
  return (
    <motion.header 
      className="floating-nav"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="nav-logo">
        BILL<span className="italic">FLOW</span>
      </div>
      
      <nav className="nav-links">
        <a href="#hero" className="nav-link">Overview</a>
        <a href="#products" className="nav-link">Catalog</a>
        <a href="#purchase" className="nav-link">Inventory</a>
        <a href="#billing" className="nav-link">Billing</a>
      </nav>
      
      <div className="nav-actions">
        <a href="#billing" className="button-link">Create Invoice</a>
      </div>
    </motion.header>
  );
};

export default TopNav;

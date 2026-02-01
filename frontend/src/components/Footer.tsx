const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer style={styles.footer}>
      <p style={styles.text}>
        © {year} <strong>Mara Cabo Estilista</strong> - Todos los derechos reservados.
      </p>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: '#333',
    color: '#fff',
    textAlign: 'center' as const,
    padding: '10px 0', 
    marginTop: 'auto', 
  },
  text: {
    margin: 0,
    fontSize: '12px', 
    fontWeight: '300'
  }
};

export default Footer;
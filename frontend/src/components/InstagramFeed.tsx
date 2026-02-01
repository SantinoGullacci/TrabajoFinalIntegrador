const INSTA_PHOTOS = [
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=500&q=60", // Corte hombre
  "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=500&q=60", // Tinte
  "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=500&q=60", // Salón
  "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=500&q=60", // Productos
  "https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&w=500&q=60", // Corte mujer
  "https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?auto=format&fit=crop&w=500&q=60", // Peinado
  "https://images.unsplash.com/photo-1620331311520-246422fd82f9?auto=format&fit=crop&w=500&q=60", // Herramientas
];

export default function InstagramFeed() {
  const carouselImages = [...INSTA_PHOTOS, ...INSTA_PHOTOS];

  return (
    <div className="instagram-section">
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h3 style={{ color: '#E1306C', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>📸</span> Seguinos en Instagram
        </h3>
        <a 
            href="https://www.instagram.com/mara.cabo.estilista"
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#555', textDecoration: 'none', fontSize: '14px' }}
        >
            @mara.cabo.estilista
        </a>
      </div>

      <div className="carousel-track">
        {carouselImages.map((img, index) => (
          <div key={index} className="carousel-slide">
            <img src={img} alt={`Insta post ${index}`} className="insta-img" />
            
            <div className="insta-overlay">
                <span style={{ color: 'white', fontSize: '24px' }}>
                <a
                    href="https://www.instagram.com/mara.cabo.estilista" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: 'white', textDecoration: 'none' }}
                    >
                    ❤️
                    
                    </a>
                    </span>
                
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
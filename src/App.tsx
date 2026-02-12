
import { useState } from 'react';
import ProductManager from './components/ProductManager/ProductManager';
import ImageManager from './components/BaseImageManager/ImageManager';

const demoProducts = [
  {
    id: '1',
    name: 'Ramo de Rosas',
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    description: 'Hermoso ramo de rosas frescas, ideal para cualquier ocasión.',
    category: 'ramos',
    price: '$350'
  },
  {
    id: '2',
    name: 'Ramo de Girasoles',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    description: 'Ramo vibrante de girasoles para alegrar el día.',
    category: 'ramos',
    price: '$280'
  },
  {
    id: '3',
    name: 'Centro de Mesa',
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
    description: 'Centro de mesa elegante para eventos especiales.',
    category: 'decoracion',
    price: '$450'
  },
  {
    id: '4',
    name: 'Arreglo de Bodas',
    image: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=400&q=80',
    description: 'Arreglo floral especial para bodas.',
    category: 'bodas',
    price: '$680'
  },
];

// Configuración demo para ImageManager - Usando URLs reales de imágenes
const imageDatabaseDemo = {
  'ramos': [
    {
      name: 'Ramos Clásicos',
      image: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Ramos Elegantes',
      image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Ramos Modernos',
      image: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=400&q=80'
    }
  ],
  'decoracion': [
    {
      name: 'Centros de Mesa',
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Detalles Especiales',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=400&q=80'
    }
  ],
  'bodas': [
    {
      name: 'Arreglo de Novias',
      image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Bouquets Nupciales',
      image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Decoración de Templo',
      image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Ramos de Dama',
      image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=400&q=80'
    }
  ]
};

const categoryConfigDemo = {
  name: 'Florería Valeria',
  baseRoute: './assets/',
  categoryDisplayNames: {
    'ramos': 'Ramos',
    'decoracion': 'Decoración',
    'bodas': 'Bodas'
  },
  defaultDescription: 'Producto de calidad premium',
  subcategories: {
    'ramos': 'ramos/',
    'decoracion': 'decoracion/',
    'bodas': 'bodas/'
  }
};

function App() {
  const [activeView, setActiveView] = useState('productManager');

  const globalActions = {
    onQuickView: (product: any) => {
      console.log('Vista rápida:', product.name);
    },
    onAddToCart: (product: any) => {
      console.log('Agregar al carrito:', product.name);
    },
    onContact: (product: any) => {
      console.log('Contactar por:', product.name);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      {/* Selector de vista */}
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <button 
          onClick={() => setActiveView('productManager')}
          style={{
            padding: '0.5rem 1rem',
            background: activeView === 'productManager' ? '#e91e63' : '#ddd',
            color: activeView === 'productManager' ? 'white' : 'black',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Product Manager
        </button>
        <button 
          onClick={() => setActiveView('imageManager')}
          style={{
            padding: '0.5rem 1rem',
            background: activeView === 'imageManager' ? '#e91e63' : '#ddd',
            color: activeView === 'imageManager' ? 'white' : 'black',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Image Manager
        </button>
      </div>

      {/* Vistas */}
      {activeView === 'productManager' && (
        <div>
          <h1>Demo Product Manager</h1>
          <ProductManager 
            products={demoProducts} 
            globalActions={globalActions}
            showFilters={true}
            showSearch={true}
          />
        </div>
      )}

      {activeView === 'imageManager' && (
        <div>
          <h1>Demo Image Manager</h1>
          <ImageManager
            key="image-manager-v2" 
            categoryConfig={categoryConfigDemo}
            imageDatabase={imageDatabaseDemo}
          />
        </div>
      )}
    </div>
  );
}

export default App;

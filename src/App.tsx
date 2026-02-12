
import React from 'react';
import ProductManager from './components/ProductManager/ProductManager';

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

function App() {
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
      <h1>Demo Product Manager</h1>
      <ProductManager 
        products={demoProducts} 
        globalActions={globalActions}
        showFilters={true}
        showSearch={true}
      />
    </div>
  );
}

export default App;

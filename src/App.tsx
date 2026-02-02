
import React from 'react';
import Gallery from './components/BaseGallery/Gallery';

const demoProducts = [
  {
    id: '1',
    name: 'Ramo de Rosas',
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    description: 'Hermoso ramo de rosas frescas, ideal para cualquier ocasión.',
    category: 'flores',
  },
  {
    id: '2',
    name: 'Ramo de Girasoles',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    description: 'Ramo vibrante de girasoles para alegrar el día.',
    category: 'flores',
  },
  {
    id: '3',
    name: 'Centro de Mesa',
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
    description: 'Centro de mesa elegante para eventos especiales.',
    category: 'decoracion',
  },
];

function App() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Demo Gallery</h1>
      <Gallery products={demoProducts} />
    </div>
  );
}

export default App;

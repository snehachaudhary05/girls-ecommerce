import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import ProductItem from './ProductItem';

const LatestCollection = () => {
  const { products } = useContext(ShopContext);
  const navigate = useNavigate();
  const [latestProducts, setLatestProducts] = useState([]);

  useEffect(() => {
    setLatestProducts(products.slice(0, 5));
  }, [products]);

  // Duplicate products for infinite scroll effect
  const duplicatedProducts = [...latestProducts, ...latestProducts];

  return (
    <div className='py-28 px-4 sm:px-8 bg-white'>
      {/* Add custom animation styles */}
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        
        .scroll-container:hover .animate-scroll {
          animation-play-state: paused;
        }
      `}</style>

      <div className='max-w-full mx-auto'>
        {/* Header */}
        <div className='text-center mb-24'>
          <h2 className='text-6xl sm:text-7xl lg:text-8xl font-bold text-gray-900 mb-6'>
            Latest <span className='text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-black'>Collections</span>
          </h2>
          <p className='w-full sm:w-2/3 mx-auto text-gray-600 text-xl md:text-2xl lg:text-3xl mt-8 leading-relaxed'>
            Discover our newest arrivals carefully curated to bring you the latest trends and timeless classics. 
            Each item is selected for quality and style.
          </p>
        </div>

        {/* Scrolling Products Container */}
        <div className='scroll-container relative w-full overflow-hidden mb-20'>
          <div className='flex animate-scroll gap-8 w-max'>
            {duplicatedProducts.map((item, index) => (
              <div key={`${item._id}-${index}`} className='flex-shrink-0 w-64 sm:w-72 md:w-80 lg:w-96'>
                <ProductItem 
                  key={`product-${item._id}-${index}`}
                  id={item._id} 
                  image={item.images} 
                  name={item.name} 
                  price={item.price} 
                />
              </div>
            ))}
          </div>
        </div>

        {/* View All Button */}
        <div className='text-center mt-12'>
          <button 
            onClick={() => navigate('/collection')}
            className='border-2 border-black text-black px-12 py-4 rounded-lg font-bold text-lg hover:bg-black hover:text-white transition-all duration-300 shadow-lg'
          >
            VIEW ALL COLLECTIONS
          </button>
        </div>
      </div>
    </div>
  );
};

export default LatestCollection;

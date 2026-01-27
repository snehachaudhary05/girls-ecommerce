import { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Link } from 'react-router-dom';

// eslint-disable-next-line react/prop-types
const ProductItem = ({ id, image, name, price }) => {
  const { currency, addToWishlist, removeFromWishlist, isInWishlist } = useContext(ShopContext); 

  // Ensure `image` is an array and has at least one element
  const productImage = Array.isArray(image) && image.length > 0 ? image[0] : "placeholder.jpg";

  const inWishlist = isInWishlist(id);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    if (inWishlist) {
      removeFromWishlist(id);
    } else {
      addToWishlist(id);
    }
  };

  return (
    <Link className='text-gray-700 cursor-pointer group' to={id ? `/product/${id}` : '#'}>
      <div className='relative overflow-hidden bg-gradient-to-br from-pink-50 to-rose-50 aspect-square flex items-center justify-center rounded-2xl border-2 border-pink-200 shadow-md group-hover:shadow-lg transition-all duration-300'>
        <img 
          className='w-full h-full object-contain hover:scale-110 transition ease-in-out' 
          src={productImage} 
          alt={name || "Product"} 
          loading="lazy"
          decoding="async"
        />
        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className='absolute top-3 right-3 bg-white rounded-full p-3 shadow-md hover:shadow-lg transition-all opacity-0 group-hover:opacity-100'
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg
            className={`w-7 h-7 transition-colors ${inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
            fill={inWishlist ? 'currentColor' : 'none'}
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
            />
          </svg>
        </button>
      </div>
      <p className='pt-4 pb-2 text-base md:text-lg lg:text-xl font-semibold text-gray-800 group-hover:text-pink-600 transition'>{name || "No Name"}</p>
      <p className='text-base md:text-lg lg:text-2xl font-bold text-pink-600'>{currency ? currency + price : "Price Not Available"}</p>
    </Link>
  );
};

export default ProductItem;

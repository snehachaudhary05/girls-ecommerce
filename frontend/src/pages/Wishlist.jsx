import { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';

const Wishlist = () => {
  const { products, currency, wishlist, removeFromWishlist, addToCart, navigate } = useContext(ShopContext);
  const [wishlistProducts, setWishlistProducts] = useState([]);

  useEffect(() => {
    const products_list = [];
    for (let i = 0; i < wishlist.length; i++) {
      const product = products.find((item) => item._id === wishlist[i]);
      if (product) {
        products_list.push(product);
      }
    }
    setWishlistProducts(products_list);
  }, [wishlist, products]);

  const handleAddToCart = (productId) => {
    addToCart(productId);
  };

  const handleRemoveFromWishlist = (productId) => {
    removeFromWishlist(productId);
  };

  return (
    <div className='border-t border-pink-200 pt-16 px-4 sm:px-8'>
      <div className='text-2xl mb-8'>
        <Title text1={'MY'} text2={'WISHLIST'} />
      </div>

      {wishlistProducts.length === 0 ? (
        <div className='text-center py-20'>
          <p className='text-xl text-gray-500 mb-6'>Your wishlist is empty</p>
          <button
            onClick={() => navigate('/collection')}
            className='bg-gradient-to-r from-pink-600 to-rose-500 text-white px-8 py-3 rounded-lg font-bold hover:shadow-lg transition'
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div>
          {/* Desktop View - Grid */}
          <div className='hidden sm:grid grid-cols-4 gap-4 mb-8 pb-8 border-b border-pink-200'>
            {wishlistProducts.map((item) => (
              <div key={item._id} className='relative group'>
                <ProductItem id={item._id} image={item.images} name={item.name} price={item.price} />
                <button
                  onClick={() => handleAddToCart(item._id)}
                  className='absolute bottom-0 left-0 right-0 bg-gradient-to-r from-pink-600 to-rose-500 text-white w-full py-2 px-4 rounded-b-2xl font-bold text-sm opacity-0 group-hover:opacity-100 transition'
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>

          {/* Mobile View - List */}
          <div className='sm:hidden space-y-4'>
            {wishlistProducts.map((item) => (
              <div key={item._id} className='bg-white border border-gray-200 rounded-lg overflow-hidden p-4 flex gap-4'>
                <div className='flex-shrink-0'>
                  <img
                    src={item.images && item.images[0]}
                    alt={item.name}
                    className='w-24 h-24 object-cover rounded'
                  />
                </div>

                <div className='flex-grow flex flex-col justify-between'>
                  <div>
                    <h3 className='text-lg font-bold text-gray-900 line-clamp-2 mb-2'>
                      {item.name}
                    </h3>
                    <p className='text-lg font-bold text-pink-600'>{currency}{item.price}</p>
                  </div>

                  <div className='flex gap-2'>
                    <button
                      onClick={() => handleAddToCart(item._id)}
                      className='flex-1 bg-gradient-to-r from-pink-600 to-rose-500 text-white py-2 px-3 rounded font-semibold text-sm hover:shadow-lg transition'
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => handleRemoveFromWishlist(item._id)}
                      className='flex-1 bg-gray-200 text-gray-800 py-2 px-3 rounded font-semibold text-sm hover:bg-gray-300 transition'
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Remove Buttons */}
          <div className='hidden sm:block mb-8'>
            <div className='flex flex-wrap gap-2'>
              {wishlistProducts.map((item) => (
                <button
                  key={item._id}
                  onClick={() => handleRemoveFromWishlist(item._id)}
                  className='bg-gray-200 text-gray-800 py-2 px-4 rounded font-semibold text-sm hover:bg-gray-300 transition'
                >
                  Remove {item.name.substring(0, 10)}...
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;

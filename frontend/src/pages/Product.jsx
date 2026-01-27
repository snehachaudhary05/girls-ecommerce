import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useContext(ShopContext);
  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState('');
  const [validImages, setValidImages] = useState([]);

  const fetchProductData = () => {
    const product = products.find((item) => item._id === productId);
    if (product) {
      setProductData(product);
      // Filter out empty strings and get only valid images
      const filtered = product.images.filter(img => img && typeof img === 'string' && img.trim().length > 0);
      setValidImages(filtered);
      setImage(filtered.length > 0 ? filtered[0] : '');
    }
  };

  useEffect(() => {
    fetchProductData();
    // Scroll to top when product changes
    window.scrollTo(0, 0);
  }, [productId, products]);

  return productData ? (
    <div className="border-t-2 border-pink-200 pt-10 transition-opacity ease-in duration-500 opacity-100">
      {/* Product Section */}
      <div className="flex flex-col sm:flex-row gap-12">
        {/* Left Section: Images */}
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          {/* Thumbnails */}
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-auto sm:w-[20%] w-full gap-2">
            {validImages.length > 0 ? (
              validImages.map((item, index) => (
                <img
                  onClick={() => setImage(item)}
                  src={item}
                  key={index}
                  className={`w-24 h-24 object-cover cursor-pointer border-2 rounded-lg ${
                    image === item ? 'border-pink-600' : 'border-pink-200'
                  }`}
                  alt={`Thumbnail ${index + 1}`}
                  onError={(e) => {
                    // If image fails to load, hide it
                    e.target.style.display = 'none';
                  }}
                />
              ))
            ) : (
              <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">No Image</div>
            )}
          </div>
          {/* Main Image */}
          <div className="w-full sm:w-[80%]">
            {image ? (
              <img 
                src={image} 
                className="w-full h-auto border-2 border-pink-200 rounded-xl shadow-lg" 
                alt="Main Product"
                onError={() => {
                  // If main image fails, show first valid image
                  if (validImages.length > 0) {
                    setImage(validImages[0]);
                  }
                }}
              />
            ) : (
              <div className="w-full aspect-square bg-gray-200 rounded-xl flex items-center justify-center text-gray-400 border-2 border-pink-200">
                No Image Available
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Product Details */}
        <div className="flex-1">
          <h1 className="font-bold text-4xl md:text-5xl mt-3 mb-4 text-gray-900">{productData.name}</h1>
          <div className="flex items-center gap-2 mt-4 mb-6">
            <img src={assets.star_icon} className="w-6 md:w-5" alt="Star" />
            <img src={assets.star_icon} className="w-6 md:w-5" alt="Star" />
            <img src={assets.star_icon} className="w-6 md:w-5" alt="Star" />
            <img src={assets.star_icon} className="w-6 md:w-5" alt="Star" />
            <img src={assets.star_dull_icon} className="w-6 md:w-5" alt="Dull Star" />
            <p className="pl-3 text-lg md:text-base text-gray-700 font-bold">122 Reviews</p>
          </div>
          <p className="text-5xl md:text-6xl font-bold text-pink-700 mb-6">
            {currency}
            {productData.price}
          </p>
          <p className="mt-6 text-xl md:text-lg text-gray-700 leading-relaxed font-medium line-height-relaxed">{productData.description}</p>
          <div className="flex items-center gap-4 my-10">
            <button onClick={()=> addToCart(productData._id)} className="bg-gradient-to-r from-pink-700 to-rose-600 text-white px-8 md:px-10 py-4 md:py-4 text-lg md:text-base font-bold rounded-lg active:shadow-inner hover:shadow-xl transition flex-1 sm:flex-none">
              ADD TO CART
            </button>
            <button 
              onClick={() => isInWishlist(productData._id) ? removeFromWishlist(productData._id) : addToWishlist(productData._id)}
              className="border-2 border-pink-600 text-pink-600 p-3 rounded-full hover:bg-pink-50 transition flex items-center justify-center"
              title={isInWishlist(productData._id) ? "Remove from wishlist" : "Add to wishlist"}
            >
              <svg
                className={`w-6 h-6 transition-colors ${isInWishlist(productData._id) ? 'fill-red-500 text-red-500' : 'text-pink-600'}`}
                fill={isInWishlist(productData._id) ? 'currentColor' : 'none'}
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
          <hr className="mt-8 md:mt-8 border-pink-200" />
          <div className="text-xl md:text-base text-gray-700 mt-6 flex flex-col gap-3 font-semibold">
            <p>✓ 100% Original product.</p>
            <p>✓ Cash on delivery is available on this product.</p>
            <p>✓ Easy return & exchange policy within 7 days.</p>
          </div>
        </div>
      </div>

      {/* Description and Reviews */}
      <div className="mt-20">
        <div className="flex">
          <b className="border-2 border-pink-200 px-5 py-3 text-sm font-bold text-pink-600 bg-gradient-to-r from-pink-50 to-white">Description</b>
          <p className="border-2 border-pink-200 px-5 py-3 text-sm text-gray-600 font-semibold cursor-pointer hover:text-pink-600">Reviews (122)</p>
        </div>
        <div className="flex flex-col gap-4 border-2 border-pink-200 px-6 py-6 text-sm text-gray-600 bg-gradient-to-br from-pink-50 to-rose-50 rounded-b-lg">
          <p>
            An e-commerce website is an online platform that facilitates the
            buying and selling of products or services over the internet. It
            serves as a virtual marketplace where businesses and individuals can
            showcase their products, interact with customers, and conduct
            transactions without the need for a physical presence. E-commerce
            websites have gained immense popularity due to their convenience,
            accessibility, and the global reach they offer.
          </p>
          <p>
            E-commerce websites typically display products or services along
            with detailed descriptions, images, prices, and any available
            variations (e.g., sizes, colors). Each product usually has its own
            dedicated page with relevant information.
          </p>
        </div>
      </div>

      {/* Related Products Section */}
      <RelatedProducts
        category={productData.category}
        subCategory={productData.subCategory}
      />
    </div>
  ) : (
    <div className="opacity-0"></div>
  );
};

export default Product;

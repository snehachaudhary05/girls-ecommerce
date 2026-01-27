import { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import { assets } from '../assets/assets';
import CartTotal from '../components/CartTotal';

const Cart = () => {
  const { products, currency, cartItems, updateQuantity, navigate} = useContext(ShopContext);
  const [cartData, setCartData] = useState([]);
  
  useEffect(()=>{
    const tempData = [];
    if(Object.keys(cartItems).length > 0){
      for(const items in cartItems){
        if(cartItems[items] > 0){
          tempData.push({
            _id: items,
            quantity: cartItems[items]
          })
        }
      }
    }
    setCartData(tempData);
  }, [cartItems])
  return (
    <div className='border-t border-pink-200 pt-14'>
      <div className='text-2xl mb-3'>
        <Title text1={'YOUR'} text2 = {'CART'}/>
      </div>
      <div>
        {cartData.length > 0 ? (
          cartData.map((item, index) => {
            const productData = products.find((product)=> product._id === item._id);
            if (!productData) return null;
            return (
              <div key={index} className='py-4 border-t border-b border-pink-200 text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'>
                <div className='flex items-start gap-6'>
                  <img
                    src={productData.images[0]}
                    className='w-16 sm:w-20 rounded-lg shadow-md'
                    alt=""
                    loading='lazy'
                    decoding='async'
                  />
                  <div>
                    <p className='text-xs sm:text-lg font-semibold text-gray-800'>{productData.name}</p>
                    <div className='flex items-center gap-5 mt-2'>
                      <p className='text-pink-600 font-bold'>{currency}{productData.price}</p>
                    </div>
                  </div>
                </div>
                <input onChange={(e)=> e.target.value === '' || e.target.value === '0' ? null : updateQuantity(item._id, Number(e.target.value))} className='border-2 border-pink-200 focus:border-pink-600 rounded max-w-10 sm:max-w-20 px-1 sm:px-2 py-1 focus:outline-none' type="number" min='1' defaultValue={item.quantity} />
                <img onClick={()=> updateQuantity(item._id, 0)} src={assets.bin_icon} className='w-4 mr-4 sm:w-5 cursor-pointer hover:opacity-70 transition' alt="" />
              </div>
            )
          })
        ) : (
          <p className='text-center text-gray-500 py-10'>Your cart is empty</p>
        )}
      </div>
      <div className='flex justify-end my-20'>
        <div className='w-full sm:w-[450px]'>
          <CartTotal/>
          <div className='w-full text-end'>
            <button onClick={()=> navigate('/place-order')} className='bg-gradient-to-r from-pink-600 to-rose-500 text-white text-sm my-8 px-8 py-3 rounded-full font-bold hover:shadow-lg transition'>PROCEED TO CHECKOUT</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart;

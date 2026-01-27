import { useContext } from 'react';
import { ShopContext } from '../context/ShopContext'
import Title from './Title';

const CartTotal = () => {
    const {currency, delivery_fee, getCartAmount} = useContext(ShopContext);
  return (
    <div className='w-full bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-2xl border-2 border-pink-200'>
        <div className='text-2xl mb-4'>
            <Title text1={'CART'} text2={'TOTALS'}/>
        </div>
        <div className='flex flex-col gap-3 mt-2 text-sm'>
            <div className='flex justify-between text-gray-700'>
                <p className='font-semibold'>Subtotal</p>
                <p className='font-bold text-pink-600'>{currency} {getCartAmount()}.00</p>
            </div>
            <hr className='border-pink-200'/>
            <div className='flex justify-between text-gray-700'>
                <p className='font-semibold'>Shipping Fee</p>
                <p className='font-bold text-pink-600'>{currency} {delivery_fee}</p>
            </div>
            <hr className='border-pink-200'/>
            <div className='flex justify-between pt-2'>
                <p className='font-bold text-lg text-gray-800'>Total</p>
                <p className='font-bold text-lg text-pink-600'>{currency} {getCartAmount() + delivery_fee}</p>
            </div>
        </div>
    </div>
  )
}

export default CartTotal

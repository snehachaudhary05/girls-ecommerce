import { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import ProductItem from './ProductItem';

const BestSeller = () => {
    const {products} = useContext(ShopContext); 
    const [bestSeller, setBestSeller] = useState([]); 

    useEffect(() => { 
        const bestProduct = products.filter((item) => (item.bestseller)); 
        setBestSeller(bestProduct.slice(0, 10)) 
    }, [products]) 

    return (
        <div className='bg-gradient-to-b from-gray-50 to-white py-28 px-4 sm:px-8'>
            <div className='max-w-full mx-auto'>
                {/* Header */}
                <div className='text-center mb-24'>
                    <div className='flex items-center justify-center gap-6 mb-8'>
                        <div className='w-20 h-3 bg-yellow-400'></div>
                        <p className='font-bold text-lg md:text-xl lg:text-2xl tracking-widest text-yellow-600'>TOP PICKS</p>
                        <div className='w-20 h-3 bg-yellow-400'></div>
                    </div>
                    <h2 className='text-6xl sm:text-7xl lg:text-8xl font-bold text-gray-900 mb-6'>
                        Best <span className='text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-yellow-500'>Sellers</span>
                    </h2>
                    <p className='w-full sm:w-2/3 mx-auto text-gray-600 text-xl md:text-2xl lg:text-3xl mt-8 leading-relaxed'>
                        Our most loved products by customers worldwide. Handpicked bestsellers that have earned their place in hearts.
                    </p>
                </div>

                {/* Products Grid */}
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-12'>
                    {bestSeller.map((item) => (
                        <ProductItem 
                            key={item._id} 
                            id={item._id} 
                            image={item.images} 
                            name={item.name} 
                            price={item.price} 
                        />
                    ))}
                </div>

                {/* Decorative Stars */}
                <div className='flex justify-center gap-3 mt-16'>
                    <span className='text-4xl text-yellow-400'>★</span>
                    <span className='text-4xl text-yellow-400'>★</span>
                    <span className='text-4xl text-yellow-400'>★</span>
                    <span className='text-4xl text-yellow-400'>★</span>
                    <span className='text-4xl text-yellow-400'>★</span>
                </div>
            </div>
        </div>
    )
}

export default BestSeller

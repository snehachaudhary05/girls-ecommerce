import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Hero = () => { 
    const navigate = useNavigate();
    return ( 
        <div className='w-full bg-gradient-to-br from-pink-100 via-rose-50 to-pink-50'> 
            <div className='flex flex-col sm:flex-row min-h-[560px] sm:min-h-[750px]'> 
                {/* Hero Left Side */} 
                <div className='w-full sm:w-1/2 flex items-center justify-center px-6 sm:px-16 py-16 sm:py-0'> 
                    <div className='text-gray-800'> 
                        <div className='flex items-center gap-4 mb-8'> 
                            <p className='w-16 h-2.5 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full'></p> 
                            <p className='font-bold text-base md:text-lg lg:text-xl tracking-widest text-pink-600'>✨ EXCLUSIVE COLLECTION</p> 
                        </div> 
                        <h1 className='text-6xl sm:text-7xl lg:text-8xl font-bold leading-tight mb-10 text-gray-900'>
                            Latest <span className='text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-500'>Arrivals</span>
                        </h1>
                        <p className='text-gray-600 text-xl md:text-2xl lg:text-3xl mb-12 max-w-md leading-relaxed'>
                            Discover our newest collection of premium scrunchies, clips & accessories. Handpicked for your style.
                        </p>
                        <button onClick={() => navigate('/collection')} className='bg-gradient-to-r from-pink-600 to-rose-500 text-white px-10 py-5 font-bold text-xl md:text-2xl lg:text-3xl rounded-full hover:shadow-xl transition duration-300 shadow-lg hover:from-pink-700 hover:to-rose-600'>
                            ✨ SHOP NOW
                        </button>
                    </div> 
                </div> 
                {/* Hero Right Side */}
                <div className='w-full sm:w-1/2 flex items-center justify-center overflow-hidden'>
                    <img 
                        className='w-full h-full object-cover hover:scale-105 transition-transform duration-500' 
                        src={assets.hero_img} 
                        alt="Latest Arrivals Hero" 
                        decoding="async"
                        loading="eager"
                    />
                </div>
            </div> 
        </div> 
    ) 
} 

export default Hero
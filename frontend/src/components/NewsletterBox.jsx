import { toast } from 'react-toastify'

const NewsletterBox = () => {
    const onSubmitHandler = (event) => {
        event.preventDefault()
        toast.success('Thank you for subscribing! Check your email for a 20% discount code.')
    }

    return (
        <div className='bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 py-32 px-4 sm:px-8'>
            <div className='max-w-3xl mx-auto text-center'>
                {/* Heading */}
                <h2 className='text-6xl sm:text-7xl lg:text-8xl font-bold text-white mb-8'>
                    Exclusive Offers
                </h2>
                <p className='text-gray-300 text-2xl md:text-3xl lg:text-4xl mb-4 font-semibold'>Get 20% off your first order</p>
                <p className='text-gray-400 mb-16 text-lg md:text-xl lg:text-2xl leading-relaxed'>
                    Subscribe to our newsletter and be the first to know about new collections, exclusive offers, and special deals delivered straight to your inbox.
                </p>

                {/* Newsletter Form */}
                <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row gap-4 mb-10'>
                    <input 
                        className='flex-1 px-8 py-6 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white transition text-lg'
                        type="email" 
                        placeholder='Enter your email address' 
                        required
                    />
                    <button 
                        className='bg-white text-gray-900 font-bold px-12 py-6 rounded-lg hover:bg-gray-100 transition-colors duration-300 whitespace-nowrap shadow-lg hover:shadow-xl text-lg md:text-xl lg:text-2xl'
                        type='submit'
                    >
                        SUBSCRIBE NOW
                    </button>
                </form>

                {/* Privacy Note */}
                <p className='text-gray-500 text-base md:text-lg'>
                    We respect your privacy. Unsubscribe at any time.
                </p>
            </div>
        </div>
    )
}

export default NewsletterBox;

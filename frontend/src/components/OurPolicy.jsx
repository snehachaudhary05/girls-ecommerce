
import { assets } from '../assets/assets'

const OurPolicy = () => {
  const policies = [
    {
      icon: assets.exchange_icon,
      title: 'Easy Exchange Policy',
      description: 'Hassle-free exchange within 7 days of purchase'
    },
    {
      icon: assets.quality_icon,
      title: '100% Original Products',
      description: 'We guarantee authentic and premium quality items'
    },
    {
      icon: assets.support_img,
      title: '24/7 Customer Support',
      description: 'Dedicated team to assist you anytime'
    }
  ]

  return (
    <div className='bg-gray-50 py-32 px-4 sm:px-8'>
      <div className='max-w-full mx-auto'>
        <h2 className='text-6xl sm:text-7xl lg:text-8xl font-bold text-center text-gray-900 mb-6'>
          Why Choose <span className='text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-black'>Us</span>
        </h2>
        <p className='text-center text-gray-600 text-xl md:text-2xl lg:text-3xl mb-24'>Trusted by millions for quality and service excellence</p>
        
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12'>
          {policies.map((policy, index) => (
            <div 
              key={index}
              className='bg-white rounded-2xl p-8 sm:p-10 md:p-12 text-center hover:shadow-2xl transition-shadow duration-300 border border-gray-200 flex flex-col items-center'
            >
              <div className='w-full flex justify-center mb-6 sm:mb-8 md:mb-10'>
                <div className='flex items-center justify-center w-28 h-28 sm:w-40 sm:h-40 md:w-52 md:h-52 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300 flex-shrink-0'>
                  <img 
                    src={policy.icon} 
                    className='w-16 h-16 sm:w-28 sm:h-28 md:w-40 md:h-40 object-contain' 
                    alt={policy.title}
                    loading='eager'
                  />
                </div>
              </div>
              <h3 className='text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-5'>{policy.title}</h3>
              <p className='text-gray-600 text-lg md:text-xl lg:text-2xl leading-relaxed'>{policy.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default OurPolicy

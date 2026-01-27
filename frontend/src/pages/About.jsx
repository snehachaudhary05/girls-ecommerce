
import Title from '../components/Title';
import NewsletterBox from '../components/NewsletterBox';
import { assets } from '../assets/assets';

const About = () => {
  return (
    <div>
      <div className='text-2xl text-center pt-8 border-t'>
        <Title text1={'ABOUT'} text2 = {'US'}/>
      </div>
      <div className='my-10 flex flex-col md:flex-row gap-16'>
        <img
          className='w-full md:max-w-[450px]'
          src={assets.about_img}
          alt="About Us"
          loading='lazy'
          decoding='async'
        />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'>
          <p>Our accessory collection was born from a passion for empowering girls with style, confidence, and self-expression. We started with a simple belief: every girl deserves access to premium, trendy accessories that showcase her personality and complement her unique sense of style.</p>
          <p>Since we began, we&apos;ve dedicated ourselves to curating the finest collection of girls&apos; accessories including scrunchies, hair clips, headbands, and jewelry. Each piece is carefully selected from trusted artisans and designers who share our commitment to quality, sustainability, and beautiful design.</p>
          <b className='text-gray-800'>Our Mission</b>
          <p>Our mission is to help every girl express herself through beautiful, high-quality accessories. We believe that the right accessories can transform an outfit, boost confidence, and make every day feel special. We&apos;re committed to providing an effortless shopping experience where you can discover pieces that truly reflect who you are.</p>
        </div>
      </div>
      <div className='text-xl py-4'>
        <Title text1={'WHY'} text2={'CHOOSE US'}/>
      </div>
      <div className='flex flex-col md:flex-row text-sm mb-20'>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Premium Quality:</b>
          <p className='text-gray-600'>We carefully source only the finest materials and craftsmanship. Every accessory is tested to ensure durability, comfort, and style for everyday wear.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Trendy Designs:</b>
          <p className='text-gray-600'>Our collection features the latest styles and timeless classics. From vibrant patterns to elegant minimalist designs, we have something for every girl&apos;s taste.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Fast & Reliable Service:</b>
          <p className='text-gray-600'>We ship quickly and reliably, so you can get your favorite accessories delivered to your door. Our customer support team is always ready to help with any questions.</p>
        </div>
      </div>
      <NewsletterBox/>
    </div>
  )
}

export default About;

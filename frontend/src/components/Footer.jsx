
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div className='bg-gradient-to-b from-white to-pink-50'>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm px-4 sm:px-0'>
        <div>
            <img src={assets.logo} className='mb-5 w-32' alt="" />
            <p className='w-full md:w-2/3 text-gray-600 leading-relaxed'>Glowgals - Your destination for premium scrunchies, hair clips, and feminine accessories. Elevate your style with our curated collection.</p>
        </div>
        <div>
            <p className='text-xl font-bold mb-5 text-pink-600'>COMPANY</p>
            <ul className='flex flex-col gap-2 text-gray-600'>
                <li className='hover:text-pink-600 transition cursor-pointer'>Home</li>
                <li className='hover:text-pink-600 transition cursor-pointer'>About us</li>
                <li className='hover:text-pink-600 transition cursor-pointer'>Delivery</li>
                <li className='hover:text-pink-600 transition cursor-pointer'>Privacy Policy</li>
            </ul>
        </div>
        <div>
            <p className='text-xl font-bold mb-5 text-pink-600'>GET IN TOUCH</p>
            <ul className='flex flex-col gap-2 text-gray-600'>
                <li className='hover:text-pink-600 transition'>+1-212-456-7890</li>
                <li className='hover:text-pink-600 transition'>info@glowgals.com</li>
            </ul>
        </div>
        <div className='col-span-1 sm:col-span-3'>
            <hr className='border-pink-200' />
            <p className='py-5 text-sm text-center text-gray-600'>Copyright 2024@ Glowgals - All rights reserved. 💕</p>
        </div>
      </div>
    </div>
  )
}

export default Footer;

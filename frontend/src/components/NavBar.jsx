import { useContext, useState } from 'react';
import { assets } from '../assets/assets';
import { Link, NavLink } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';

const NavBar = () => {
    const [visible, setVisible] = useState(false);
    const {setShowSearch, getCartCount, navigate, token, setToken, setCartItems, wishlist} = useContext(ShopContext);
    const logout = () => {
      navigate('/login')
      localStorage.removeItem('token')
      setToken('')
      setCartItems({})
    }
    const cartCount = getCartCount();
    const wishlistCount = wishlist.length;
    console.log('NavBar rendered, cartCount:', cartCount);
  return (
    <div className="w-full bg-gradient-to-r from-pink-50 to-rose-50 border-b-4 border-pink-400 shadow-md">
      <div className="flex items-center justify-between py-4 sm:py-5 lg:py-6 px-5 sm:px-8 lg:px-16">
        {/* Hamburger Menu - Left */}
        <img onClick={()=>setVisible(true)} src={assets.menu_icon} className='w-8 sm:w-8 lg:hidden cursor-pointer hover:opacity-70 transition' alt="Menu" />

        {/* Logo */}
        <Link to='/' className="flex-shrink-0"><img src={assets.logo} className="w-32 sm:w-40 md:w-48 lg:w-64 h-auto" alt="Logo" /></Link>

        {/* Navigation Links - Hidden on mobile */}
        <ul className="hidden lg:flex gap-1 xl:gap-3 flex-1 justify-center">
          <li>
            <NavLink to="/" className="flex flex-col items-center gap-1 group py-2 px-7 hover:bg-pink-200 rounded-lg transition duration-200">
              <p className="text-lg xl:text-xl font-bold group-hover:text-pink-700 transition">HOME</p>
              <hr className="w-0 group-hover:w-full border-none h-1.5 bg-pink-600 transition-all duration-300" />
            </NavLink>
          </li>
          <li>
            <NavLink to="/collection" className="flex flex-col items-center gap-1 group py-2 px-7 hover:bg-pink-200 rounded-lg transition duration-200">
              <p className="text-lg xl:text-xl font-bold group-hover:text-pink-700 transition">COLLECTION</p>
              <hr className="w-0 group-hover:w-full border-none h-1.5 bg-pink-600 transition-all duration-300" />
            </NavLink>
          </li>
          <li>
            <NavLink to="/about" className="flex flex-col items-center gap-1 group py-2 px-7 hover:bg-pink-200 rounded-lg transition duration-200">
              <p className="text-lg xl:text-xl font-bold group-hover:text-pink-700 transition">ABOUT</p>
              <hr className="w-0 group-hover:w-full border-none h-1.5 bg-pink-600 transition-all duration-300" />
            </NavLink>
          </li>
          <li>
            <NavLink to="/contact" className="flex flex-col items-center gap-1 group py-2 px-7 hover:bg-pink-200 rounded-lg transition duration-200">
              <p className="text-lg xl:text-xl font-bold group-hover:text-pink-700 transition">CONTACT</p>
              <hr className="w-0 group-hover:w-full border-none h-1.5 bg-pink-600 transition-all duration-300" />
            </NavLink>
          </li>
        </ul>

        {/* Icons - Right side */}
        <div className="flex items-center gap-6 sm:gap-7 lg:gap-10 xl:gap-12 flex-shrink-0">
          <img onClick={() => {
            setShowSearch(true);
            navigate('/collection');
          }} src={assets.search_icon} className="w-7 sm:w-7 lg:w-9 cursor-pointer hover:opacity-70 transition hover:scale-110" alt="Search" />

        <div className="group relative">
          <img onClick={() => token ? null : navigate('/login')} className="w-7 sm:w-7 lg:w-9 cursor-pointer hover:opacity-70 transition hover:scale-110" src={assets.profile_icon} alt="Profile" />
          {token && <div className="hidden group-hover:block absolute right-0 pt-2 bg-white shadow-lg rounded-lg z-50">
            <div className="flex flex-col gap-1 w-40 sm:w-44 py-3 px-5 bg-pink-50 text-gray-700 rounded-lg border-2 border-pink-300">
              <p onClick={() => navigate('/profile')} className="cursor-pointer hover:text-pink-600 font-bold transition text-base lg:text-lg py-2">My Profile</p>
              <p onClick={()=> navigate('/orders')} className="cursor-pointer hover:text-pink-600 font-bold transition text-base lg:text-lg py-2">Orders</p>
              <p onClick={()=> navigate('/wishlist')} className="cursor-pointer hover:text-pink-600 font-bold transition text-base lg:text-lg py-2">Wishlist</p>
              <p onClick={logout} className="cursor-pointer hover:text-pink-600 font-bold transition text-base lg:text-lg py-2">Logout</p>
            </div>
          </div>}
        </div>

        <Link to="/cart" className="relative">
          <img src={assets.cart_icon} className="w-7 sm:w-7 lg:w-9 min-w-7 sm:min-w-7 lg:min-w-9 cursor-pointer hover:opacity-70 transition hover:scale-110" alt="Cart" />
          <p className="absolute right-[-10px] bottom-[-10px] w-6 sm:w-6 lg:w-7 text-center leading-6 lg:leading-7 bg-red-700 text-white aspect-square rounded-full text-xs font-bold">
            {cartCount}
          </p>
        </Link>

        <Link to="/wishlist" className="relative">
          <svg className="w-7 sm:w-7 lg:w-9 cursor-pointer hover:opacity-70 transition hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {wishlistCount > 0 && (
            <p className="absolute right-[-10px] bottom-[-10px] w-6 sm:w-6 lg:w-7 text-center leading-6 lg:leading-7 bg-red-700 text-white aspect-square rounded-full text-xs font-bold">
              {wishlistCount}
            </p>
          )}
        </Link>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-gradient-to-b from-pink-100 to-rose-100 transition-all z-40 shadow-lg ${visible ? 'w-full' : 'w-0'}`}>
        <div className="flex flex-col text-gray-700 h-full">
            <div onClick={() => setVisible(false)} className="flex items-center gap-4 sm:gap-4 p-5 sm:p-6 border-b-2 border-pink-300 bg-pink-200">
              <img src={assets.dropdown_icon} className="h-6 sm:h-6 rotate-180 cursor-pointer" alt="" />
              <p className="font-bold text-xl sm:text-xl">Back</p>
            </div>
            <NavLink onClick={()=>setVisible(false)} className='py-5 sm:py-5 pl-7 sm:pl-10 border-b-2 border-pink-200 font-bold text-2xl sm:text-2xl hover:bg-pink-200 transition duration-150' to="/">HOME</NavLink>
            <NavLink onClick={()=>setVisible(false)} className='py-5 sm:py-5 pl-7 sm:pl-10 border-b-2 border-pink-200 font-bold text-2xl sm:text-2xl hover:bg-pink-200 transition duration-150' to="/collection">COLLECTION</NavLink>
            <NavLink onClick={()=>setVisible(false)} className='py-5 sm:py-5 pl-7 sm:pl-10 border-b-2 border-pink-200 font-bold text-2xl sm:text-2xl hover:bg-pink-200 transition duration-150' to="/about">ABOUT</NavLink>
            <NavLink onClick={()=>setVisible(false)} className='py-5 sm:py-5 pl-7 sm:pl-10 border-b-2 border-pink-200 font-bold text-2xl sm:text-2xl hover:bg-pink-200 transition duration-150' to="/contact">CONTACT</NavLink>
            {token && <NavLink onClick={()=>setVisible(false)} className='py-5 sm:py-5 pl-7 sm:pl-10 border-b-2 border-pink-200 font-bold text-2xl sm:text-2xl hover:bg-pink-200 transition duration-150' to="/wishlist">WISHLIST</NavLink>}
        </div>
      </div>
    </div>
  );
};

export default NavBar;

import React from 'react'
import { NavLink } from 'react-router-dom'
import {assets} from '../assets/assets'

const Sidebar = () => {
  return (
    <div className='w-full sm:w-32 md:w-40 lg:w-[18%] min-h-screen border-r-2'>
      <div className='flex flex-col gap-2 sm:gap-4 pt-4 sm:pt-6 pl-0 sm:pl-[20%] text-xs sm:text-sm md:text-base'>
          <NavLink className='flex items-center gap-2 sm:gap-3 border border-gray-300 border-r-0 px-2 sm:px-3 py-2 sm:py-3 rounded-l hover:bg-gray-50 transition' to='/add'>
              <img className='w-4 sm:w-5 h-4 sm:h-5' src={assets.add_icon} alt="" />
              <p className='md:block text-gray-800 hidden sm:inline'>Add Items</p>
          </NavLink>
          <NavLink className='flex items-center gap-2 sm:gap-3 border border-gray-300 border-r-0 px-2 sm:px-3 py-2 sm:py-3 rounded-l hover:bg-gray-50 transition' to='/list'>
              <img className='w-4 sm:w-5 h-4 sm:h-5' src={assets.order_icon} alt="" />
              <p className='md:block hidden sm:inline'>List Items</p>
          </NavLink>
          <NavLink className='flex items-center gap-2 sm:gap-3 border border-gray-300 border-r-0 px-2 sm:px-3 py-2 sm:py-3 rounded-l hover:bg-gray-50 transition' to='/order'>
              <img className='w-4 sm:w-5 h-4 sm:h-5' src={assets.order_icon} alt="" />
              <p className='md:block hidden sm:inline'>Order Items</p>
          </NavLink>
      </div>
    </div>
  )
}

export default Sidebar

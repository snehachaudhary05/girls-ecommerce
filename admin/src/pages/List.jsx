import axios from 'axios'
import React from 'react'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const List = () => {
  const [list, setList] = useState([])
  const navigate = useNavigate();
  const fetchList = async()=>{
    try{
      const response = await axios.get(backendUrl + '/api/product/list?nocache=1')
      if(response.data.success){
        setList(response.data.products)
      }
      else{
        toast.error(response.data.message)
      }
    }
    catch (error){
      console.error(error)
      toast.error(error.message)
    }
  }

  useEffect(()=>{
    fetchList()
  }, [])

  console.log("Fetched Products:", list) 

  const removeProduct = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this product? This action cannot be undone.');
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }
  
      const response = await axios.post(
        backendUrl + '/api/product/remove',
        { id },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };
  
  return (
    <div className='w-full'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-800 mb-2'>Products List</h1>
        <p className='text-gray-600'>Total Products: <span className='font-semibold text-lg'>{list.length}</span></p>
      </div>

      {list.length === 0 ? (
        <div className='text-center py-12 bg-white rounded-lg border-2 border-gray-200'>
          <p className='text-lg text-gray-500'>No products found</p>
        </div>
      ) : (
        <div className='space-y-4'>
          {list.map((item, index) => (
            <div key={item._id} className='bg-white border-2 border-gray-200 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow'>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-center'>
                
                {/* Product Image */}
                <div className='flex justify-center sm:justify-start'>
                  <img 
                    className='w-20 h-20 object-cover rounded-lg border border-gray-300' 
                    src={item.images?.[0] || 'default-image-url'} 
                    alt={item.name} 
                  />
                </div>

                {/* Product Info */}
                <div className='sm:col-span-1 lg:col-span-2'>
                  <p className='text-lg font-bold text-gray-800 mb-2'>{item.name}</p>
                  <div className='flex gap-4 text-sm text-gray-600 flex-wrap'>
                    <span className='bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold'>{item.category}</span>
                    {item.subCategory && (
                      <span className='bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-semibold'>{item.subCategory}</span>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className='text-center lg:text-left'>
                  <p className='text-sm text-gray-600'>Price</p>
                  <p className='text-2xl font-bold text-gray-900'>{currency}{item.price}</p>
                </div>

                {/* Actions */}
                <div className='flex gap-3 justify-center lg:justify-end'>
                  <button
                    onClick={() => navigate(`/edit/${item._id}`)}
                    className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow-md'
                  >
                    <span>✎</span> Edit
                  </button>
                  <button
                    onClick={() => removeProduct(item._id)}
                    className='flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow-md'
                  >
                    <span>🗑</span> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default List;

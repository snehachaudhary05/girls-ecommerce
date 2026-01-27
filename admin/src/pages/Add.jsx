import React, { useState } from 'react'
import { assets } from '../assets/assets';
import axios from 'axios';
import { backendUrl } from '../App'
import { toast } from 'react-toastify';

const Add = ({token}) => {
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);
  const [image4, setImage4] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Hair Accessories")
  const [subCategory, setSubCategory] = useState("Scrunchies")
  const [bestseller, setBestseller] = useState(false)
  const [colors, setColors] = useState([])

  // Category and SubCategory mapping
  const categoryMapping = {
    "Hair Accessories": ["Scrunchies", "Hair Clutchers", "Headbands"],
    "Jewellery": ["Earrings", "Necklaces", "Rings", "Bracelets", "Bangles", "Anklet", "Chokers"],
    "Bags & Pouches": ["Tote Bags", "Sling Bags", "Clutch Bags", "Wallets"],
    "Fashion Accessories": ["Sunglasses", "Belts", "Scarves", "Stoles", "Hats / Caps"],
    "Beauty Accessories": ["Makeup Brushes", "Beauty Sponges", "Vanity Mirrors", "Cosmetic Organizers", "Hair Towels"]
  }

  const priceRanges = [
    "Under ₹299",
    "₹300 – ₹599",
    "₹600 – ₹999",
    "₹1000 & Above"
  ]

  const availableColors = ["Black", "White", "Pink", "Beige", "Brown", "Pastel", "Multicolor"]

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();

      formData.append("name", name)
      formData.append("description", description)
      formData.append("price", price)
      formData.append("category", category)
      formData.append("subCategory", subCategory)
      formData.append("bestseller", bestseller)
      formData.append("colors", JSON.stringify(colors))

      if (image1) formData.append("image1", image1)
      if (image2) formData.append("image2", image2)
      if (image3) formData.append("image3", image3)
      if (image4) formData.append("image4", image4)

      const response = await axios.post(backendUrl + "/api/product/add", formData, {headers: {token}})
      if(response.data.success){
        toast.success(response.data.message)
        setName('')
        setDescription('')
        setImage1(null)
        setImage2(null)
        setImage3(null)
        setImage4(null)
        setPrice('')
      }
      else{
        toast.error(response.data.message)
      }
    }
    catch (error){
      console.log(error);
      toast.error(error.message)
    }
  }
  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3' action="">
      <div className='grid grid-flow-row-dense grid-cols-2 grid-rows-2 gap-8'>
          <label htmlFor="image1" className='col-span-1'>
            <img className='w-20' src={!image1 ? assets.upload_area : URL.createObjectURL(image1)} alt="" />
            <input onChange={(e)=> setImage1(e.target.files[0])} type="file" id='image1' />
          </label>
          <label htmlFor="image2" className='col-span-1'>
            <img className='w-20' src={!image2 ? assets.upload_area : URL.createObjectURL(image2)} alt="" />
            <input onChange={(e)=> setImage2(e.target.files[0])} type="file" id='image2' />
          </label>
          <label htmlFor="image3">
            <img className='w-20' src={!image3 ? assets.upload_area : URL.createObjectURL(image3)} alt="" />
            <input onChange={(e)=> setImage3(e.target.files[0])} type="file" id='image3' />
          </label>
          <label htmlFor="image4">
            <img className='w-20' src={!image4 ? assets.upload_area : URL.createObjectURL(image4)} alt="" />
            <input onChange={(e)=> setImage4(e.target.files[0])} type="file" id='image4' />
          </label>
        </div>

    <div className='w-full'>
      <p className='mb-2'>Product name</p>
      <input onChange={(e)=> setName(e.target.value)} value={name} className='w-full max-w-[500px] px-3 py-2 ' type="text" placeholder='Type here' required/>
    </div>
    <div className='w-full'>
      <p className='mb-2'>Product description</p>
      <textarea onChange={(e)=> setDescription(e.target.value)} value={description} className='w-full max-w-[500px] px-3 py-2 ' placeholder='Write description here' required/>
    </div>
    <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>

      <div>
        <p className='mb-2'>Product category</p>
        <select onChange={(e)=> setCategory(e.target.value)} value={category} className='w-full px-3 py-2'>
          <option value="Hair Accessories">Hair Accessories</option>
          <option value="Jewellery">Jewellery</option>
          <option value="Bags & Pouches">Bags & Pouches</option>
          <option value="Fashion Accessories">Fashion Accessories</option>
          <option value="Beauty Accessories">Beauty Accessories</option>
        </select>
      </div>

      <div>
        <p className='mb-2'>Sub category</p>
        <select onChange={(e)=> setSubCategory(e.target.value)} value={subCategory} className='w-full px-3 py-2'>
          {categoryMapping[category].map((subCat, index) => (
            <option key={index} value={subCat}>{subCat}</option>
          ))}
        </select>
      </div>

      <div>
        <p className='mb-2'>Product price</p>
        <input onChange={(e)=> setPrice(e.target.value)} value={price} className='w-full px-3 py-2 sm:w-[120px]' type="number" placeholder="25" required />
      </div>
    </div>

    <div>
      <div>
        <p className='mb-2'>Product Colors</p>
        <div className='flex gap-3 flex-wrap'>
          {availableColors.map((color, index) => (
            <div key={index} onClick={()=>setColors(prev => prev.includes(color) ? prev.filter(item => item !== color) : [...prev, color])}>
              <p className={`${colors.includes(color) ? "bg-pink-100 border-2 border-pink-500" : "bg-slate-200"} px-3 py-1 cursor-pointer rounded`}>{color}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className='flex gap-2 mt-2'>
        <input onChange={() => setBestseller(prev => !prev)} checked={bestseller} type="checkbox" id='bestseller'/>
        <label className='cursor-pointer' htmlFor="bestseller">Add to bestseller</label>
      </div>
    <button className='w-28 py-3 mt-4 bg-black text-white'>ADD</button>
    </form>
  )
}

export default Add;

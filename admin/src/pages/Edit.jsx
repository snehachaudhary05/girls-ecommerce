import React, { useState, useEffect } from 'react'
import { assets } from '../assets/assets';
import axios from 'axios';
import { backendUrl } from '../App'
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';

const Edit = ({token}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);

  // Store existing images from database
  const [existingImages, setExistingImages] = useState([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Hair Accessories")
  const [subCategory, setSubCategoy] = useState("Scrunchies")
  const [bestseller, setBestseller] = useState(false)
  const [colors, setColors] = useState([])
  const [loading, setLoading] = useState(true);

  // Category and SubCategory mapping
  const categoryMapping = {
    "Hair Accessories": ["Scrunchies", "Hair Clutchers", "Headbands"],
    "Jewellery": ["Earrings", "Necklaces", "Rings", "Bracelets", "Bangles", "Anklet", "Chokers"],
    "Bags & Pouches": ["Tote Bags", "Sling Bags", "Clutch Bags", "Wallets", "Makeup Pouches", "Coin Pouches"],
    "Fashion Accessories": ["Sunglasses", "Belts", "Scarves", "Stoles", "Hats / Caps"],
    "Beauty Accessories": ["Makeup Brushes", "Beauty Sponges", "Vanity Mirrors", "Cosmetic Organizers", "Hair Towels"]
  }

  const availableColors = ["Black", "White", "Pink", "Beige", "Brown", "Pastel", "Multicolor"]

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log('Fetching product with ID:', id);
        const response = await axios.post(backendUrl + '/api/product/single', {productId: id})
        console.log('Product response:', response.data);
        if(response.data.success) {
          const product = response.data.product;
          setName(product.name);
          setDescription(product.description);
          setPrice(product.price);
          setCategory(product.category);
          setSubCategoy(product.subCategory);
          setBestseller(product.bestseller);
          setColors(product.colors || []);
          setExistingImages(product.images || []);
          setLoading(false);
        } else {
          toast.error(response.data.message);
          navigate('/list');
        }
      } catch (error) {
        console.log(error);
        toast.error(error.message);
        navigate('/list');
      }
    }
    fetchProduct();
  }, [id])

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();

      formData.append("productId", id)
      formData.append("name", name)
      formData.append("description", description)
      formData.append("price", price)
      formData.append("category", category)
      formData.append("subCategory", subCategory)
      formData.append("bestseller", bestseller)
      formData.append("colors", JSON.stringify(colors))

      image1 && formData.append("image1", image1)
      image2 && formData.append("image2", image2)
      image3 && formData.append("image3", image3)
      image4 && formData.append("image4", image4)

      const response = await axios.post(backendUrl + "/api/product/update", formData, {headers: {token}})
      if(response.data.success){
        toast.success(response.data.message)
        navigate('/list')
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

  if(loading) {
    return <p className='text-center py-10'>Loading product details...</p>
  }

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3' action="">
      <div className='grid grid-flow-row-dense grid-cols-2 grid-rows-2 gap-8'>
          <label htmlFor="image1" className='col-span-1'>
            <img className='w-20' src={!image1 ? (existingImages[0] || assets.upload_area) : URL.createObjectURL(image1)} alt="" />
            <input onChange={(e)=> setImage1(e.target.files[0])} type="file" id='image1' />
          </label>
          <label htmlFor="image2" className='col-span-1'>
            <img className='w-20' src={!image2 ? (existingImages[1] || assets.upload_area) : URL.createObjectURL(image2)} alt="" />
            <input onChange={(e)=> setImage2(e.target.files[0])} type="file" id='image2' />
          </label>
          <label htmlFor="image3">
            <img className='w-20' src={!image3 ? (existingImages[2] || assets.upload_area) : URL.createObjectURL(image3)} alt="" />
            <input onChange={(e)=> setImage3(e.target.files[0])} type="file" id='image3' />
          </label>
          <label htmlFor="image4">
            <img className='w-20' src={!image4 ? (existingImages[3] || assets.upload_area) : URL.createObjectURL(image4)} alt="" />
            <input onChange={(e)=> setImage4(e.target.files[0])} type="file" id='image4' />
          </label>
        </div>

    <div className='w-full'>
      <p className='mb-2'>Product name</p>
      <input onChange={(e)=> setName(e.target.value)} value={name} className='w-full max-w-[500px] px-3 py-2 ' type="text" placeholder='Type here' required/>
    </div>
    <div className='w-full'>
      <p className='mb-2'>Product description</p>
      <textarea onChange={(e)=> setDescription(e.target.value)} value={description} className='w-full max-w-[500px] px-3 py-2 ' type="text" placeholder='Write description here' required/>
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
        <select onChange={(e)=> setSubCategoy(e.target.value)} value={subCategory} className='w-full px-3 py-2'>
          {categoryMapping[category].map((subCat, index) => (
            <option key={index} value={subCat}>{subCat}</option>
          ))}
        </select>
      </div>

      <div>
        <p className='mb-2'>Product price</p>
        <input onChange={(e)=> setPrice(e.target.value)} value={price} className='w-full px-3 py-2 sm:w-[120px]' type="number" placeholder="25" />
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
    <button className='w-28 py-3 mt-4 bg-black text-white'>UPDATE</button>
    </form>
  )
}

export default Edit;

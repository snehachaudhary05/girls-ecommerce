import { useState, useContext, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';


const Collection = () => {
  const {products, search, showSearch} = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState('relevant');

  // Category and SubCategory mapping
  const categoryMapping = {
    "Hair Accessories": ["Scrunchies", "Hair Clutchers", "Headbands"],
    "Jewellery": ["Earrings", "Necklaces", "Rings", "Bracelets", "Bangles", "Anklet", "Chokers"],
    "Bags & Pouches": ["Tote Bags", "Sling Bags", "Clutch Bags", "Wallets", "Makeup Pouches", "Coin Pouches"],
    "Fashion Accessories": ["Sunglasses", "Belts", "Scarves", "Stoles", "Hats / Caps"],
    "Beauty Accessories": ["Makeup Brushes", "Beauty Sponges", "Vanity Mirrors", "Cosmetic Organizers", "Hair Towels"]
  }

  // Get all subcategories for selected categories
  const getAvailableSubCategories = () => {
    if (category.length === 0) {
      return [];
    }
    let subCats = [];
    category.forEach(cat => {
      if (categoryMapping[cat]) {
        subCats = [...subCats, ...categoryMapping[cat]];
      }
    });
    return [...new Set(subCats)];
  }

  const toggleCategory = (e) => {
    let newCategory;
    if(category.includes(e.target.value)){
      newCategory = category.filter(item => item !== e.target.value);
    }
    else{
      newCategory = [...category, e.target.value];
    }
    setCategory(newCategory);
    // Clear subcategory selections when category changes
    setSubCategory([]);
  }

  const toggleSubCategory = (e) => {
    if(subCategory.includes(e.target.value)){
      setSubCategory(prev => prev.filter(item => item !== e.target.value));
    }
    else{
      setSubCategory(prev => [...prev, e.target.value])
    }
  }

  const applyFilter = () => {
    let productsCopy = products.slice();
    if(showSearch && search){
      productsCopy = productsCopy.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
    }
    if(category.length > 0){
      productsCopy = productsCopy.filter(item => category.includes(item.category))
    }
    if(subCategory.length > 0){
      productsCopy = productsCopy.filter(item => subCategory.includes(item.subCategory))
    }
    setFilterProducts(productsCopy)
  }

  const sortProduct = () => {
    let fpCopy = filterProducts.slice();
    switch (sortType){
      case 'low-high':
        setFilterProducts(fpCopy.sort((a,b)=>(a.price-b.price)));
        break;
      case 'high-low':
        setFilterProducts(fpCopy.sort((a,b)=>(b.price-a.price)));
        break;
      default:
        applyFilter();
        break;
    }
  }
  useEffect(()=>{
    applyFilter();
  }, [category, subCategory, search, showSearch, products])
  useEffect(()=>{
    sortProduct();
  }, [sortType])
  return (
    <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t border-pink-200'>
      {/*Filter options */}
      <div className='w-full sm:min-w-60 sm:w-auto'> 
      <div className='flex items-center justify-between sm:block'>
        <p onClick={()=>setShowFilter(!showFilter)} className='my-2 text-xl flex items-center cursor-pointer gap-2 font-bold text-pink-600'>✨ FILTERS</p> 
        <img className={`h-3 sm:hidden ${showFilter ? 'rotate-90' : ''}`} src={assets.dropdown_icon} alt="" />
      </div>
      {/* Category Filter */} 
      <div className={`border-2 border-pink-200 bg-gradient-to-b from-pink-50 to-rose-50 p-5 py-3 mt-6 rounded-lg ${showFilter ? '' : 'hidden'} sm:block`}> 
        <p className='mb-3 text-sm font-bold text-pink-600'>CATEGORIES</p>
        <div className='flex flex-col gap-2 tex-sm font-light text-gray-700'>
          <p className='flex gap-2'>
            <input className='w-3 accent-pink-600' type="checkbox" onChange={toggleCategory} value={'Hair Accessories'}/>Hair Accessories
          </p>
          <p className='flex gap-2'>
            <input className='w-3 accent-pink-600' type="checkbox" onChange={toggleCategory} value={'Jewellery'}/>Jewellery
          </p>
          <p className='flex gap-2'>
            <input className='w-3 accent-pink-600' type="checkbox" onChange={toggleCategory} value={'Bags & Pouches'}/>Bags & Pouches
          </p>
          <p className='flex gap-2'>
            <input className='w-3 accent-pink-600' type="checkbox" onChange={toggleCategory} value={'Fashion Accessories'}/>Fashion Accessories
          </p>
          <p className='flex gap-2'>
            <input className='w-3 accent-pink-600' type="checkbox" onChange={toggleCategory} value={'Beauty Accessories'}/>Beauty Accessories
          </p>
        </div>
      </div>
      {/* Subcategory filters */}
      <div className={`border-2 border-pink-200 bg-gradient-to-b from-pink-50 to-rose-50 p1-5 py-3 mt-6 rounded-lg ${showFilter ? '' : 'hidden'} sm:block`}> 
        <p className='mb-3 text-sm font-bold text-pink-600'>TYPE</p>
        {category.length === 0 ? (
          <p className='text-xs text-gray-500'>Select a category first</p>
        ) : (
          <div className='flex flex-col gap-2 tex-sm font-light text-gray-700'>
            {getAvailableSubCategories().map((subCat, index) => (
              <p key={index} className='flex gap-2'>
                <input className='w-3 accent-pink-600' type="checkbox" onChange={toggleSubCategory} value={subCat} checked={subCategory.includes(subCat)}/>
                {subCat}
              </p>
            ))}
          </div>
        )}
      </div>
      </div>
      {/*Right side */}
      <div className='flex-1'>
        <div className='flex justify-between text-base sm:text-2xl mb-4'>
          <Title text1={'ALL'} text2={'COLLECTIONS'}></Title>
          {/*Product sort */}
          <select onChange={(e)=>setSortType(e.target.value)} className="border-2 border-pink-300 text-sm px-2 rounded-lg focus:border-pink-600 focus:ring-2 focus:ring-pink-200" >
            <option value="relevant">Sort by: Relevant</option>
            <option value="low-high">Sort by: Low to High</option>
            <option value="high-low">Sort by: High to Low</option>
          </select>
        </div>
        {/*Map Products */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
          {filterProducts.map((item)=>(
            <ProductItem key={item._id} name={item.name} id={item._id} price={item.price} image={item.images} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Collection;

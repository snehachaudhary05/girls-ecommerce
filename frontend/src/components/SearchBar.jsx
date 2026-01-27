import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import { useLocation } from "react-router-dom";

const SearchBar = () => {
  const { search, setSearch, showSearch, setShowSearch } = useContext(ShopContext);
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if(location.pathname.includes('collection') && showSearch){
      setVisible(true);
    }
    else{
      setVisible(false);
    }
  }, [location])

  return showSearch && visible ? (
    <div className="w-full border-t-2 border-b-2 border-pink-300 bg-gradient-to-r from-pink-50 to-rose-50 text-center shadow-md">
      <div className="inline-flex items-center justify-center border-2 border-pink-400 bg-white px-6 py-3 my-5 mx-3 rounded-full shadow-md hover:border-pink-600 focus-within:border-pink-600 transition">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 outline-none bg-inherit text-base lg:text-lg text-gray-700 placeholder-gray-500"
          type="text"
          placeholder="Search products..."
        />
        <img className="w-6 lg:w-7 text-pink-600" src={assets.search_icon} alt="" />
      </div>
      <img
        onClick={() => setShowSearch(false)}
        className="inline w-3 cursor-pointer hover:opacity-70 transition"
        src={assets.cross_icon}
        alt=""
      />
    </div>
  ) : null;
};

export default SearchBar;

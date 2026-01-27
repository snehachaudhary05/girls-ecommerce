// eslint-disable-next-line react/prop-types
const Title = ({ text1, text2 }) => {
  return (
    <div className="inline-flex gap-3 items-center mb-5">
      <p className="text-base md:text-lg lg:text-xl text-gray-600">
        {text1} <span className="text-gray-800 font-bold text-pink-600">{text2}</span>
      </p>
      <p className="w-12 sm:w-16 h-[2px] sm:h-[3px] bg-gradient-to-r from-pink-500 to-rose-500"></p>
    </div>
  );
};

export default Title;

import { useState } from 'react'
import { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

const Login = () => {
  const [currentState, setCurrentState]= useState('Login');
  const [loginMethod, setLoginMethod] = useState('otp'); // 'otp' or 'password'
  const {token, setToken, navigate, backendUrl} = useContext(ShopContext);
  
  // Sign Up / Password Login
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // OTP Login
  const [otpEmail, setOtpEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try{
      if(currentState === 'Sign Up'){
        const response = await axios.post(backendUrl + '/api/user/register', {name, email, password})
        if(response.data.success){
          setToken(response.data.token)
          localStorage.setItem('token', response.data.token)
        }
        else{
          toast.error(response.data.message)
        }
      }
      else{
        if(loginMethod === 'password'){
          const response = await axios.post(backendUrl + '/api/user/login', {email, password})
          if(response.data.success){
            setToken(response.data.token)
            localStorage.setItem('token', response.data.token)
          }
          else{
            toast.error(response.data.message)
          }
        }
      }
    }
    catch (error){
      console.log(error);
      toast.error(error.message)
    }
  }

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if(!otpEmail){
      toast.error('Please enter your email');
      return;
    }
    setLoading(true);
    try{
      const response = await axios.post(backendUrl + '/api/auth/request-otp', {email: otpEmail})
      if(response.data.success){
        setOtpSent(true);
        toast.success('OTP sent to your email');
      }
      else{
        toast.error(response.data.message)
      }
    }
    catch(error){
      console.log(error);
      toast.error(error.message)
    }
    finally{
      setLoading(false);
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if(!otp){
      toast.error('Please enter the OTP');
      return;
    }
    setLoading(true);
    try{
      const response = await axios.post(backendUrl + '/api/auth/verify-otp', {email: otpEmail, otp})
      if(response.data.success){
        setToken(response.data.token)
        localStorage.setItem('token', response.data.token)
        toast.success('Login successful');
      }
      else{
        toast.error(response.data.message)
      }
    }
    catch(error){
      console.log(error);
      toast.error(error.message)
    }
    finally{
      setLoading(false);
    }
  }

  useEffect(()=>{
    if(token){
      navigate('/')
    }
  })

  return (
    <div>
      {/* OTP Login */}
      {currentState === 'Login' && loginMethod === 'otp' ? (
        <form onSubmit={otpSent ? handleVerifyOtp : handleRequestOtp} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
          <div className='inline-flex items-center gap-2 mb-2 mt-10'>
            <p className='prata-regular text-3xl'>Login with OTP</p>
            <hr className='border-none h-[1.5px] w-8 bg-gray-800'/>
          </div>
          
          {!otpSent ? (
            <>
              <input 
                onChange={(e)=>setOtpEmail(e.target.value)} 
                value={otpEmail} 
                type="email" 
                className='w-full px-3 py-2 border border-gray-800' 
                placeholder='Enter your email' 
                required
              />
              <button 
                disabled={loading}
                className='bg-black text-white font-light px-8 py-2 mt-4 disabled:opacity-50'>
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </>
          ) : (
            <>
              <p className='text-sm text-gray-600 text-center'>OTP sent to {otpEmail}</p>
              <input 
                onChange={(e)=>setOtp(e.target.value)} 
                value={otp} 
                type="text" 
                className='w-full px-3 py-2 border border-gray-800' 
                placeholder='Enter OTP (6 digits)' 
                required
                maxLength='6'
              />
              <button 
                disabled={loading}
                className='bg-black text-white font-light px-8 py-2 mt-4 disabled:opacity-50'>
                {loading ? 'Verifying...' : 'Verify OTP & Login'}
              </button>
              <p 
                onClick={() => {setOtpSent(false); setOtp('');}} 
                className='text-sm cursor-pointer text-gray-600 hover:text-black'>
                Send OTP again?
              </p>
            </>
          )}

          <div className='w-full flex justify-between text-sm mt-2'>
            <p 
              onClick={() => setLoginMethod('password')} 
              className='cursor-pointer text-blue-600'>
              Login with password
            </p>
            <p 
              onClick={() => setCurrentState('Sign Up')} 
              className='cursor-pointer'>
              Create account
            </p>
          </div>
        </form>
      ) : (
        /* Traditional Login/Sign Up */
        <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
          <div className='inline-flex items-center gap-2 mb-2 mt-10'>
            <p className='prata-regular text-3xl'>{currentState}</p>
            <hr className='border-none h-[1.5px] w-8 bg-gray-800'/>
          </div>
          {currentState === 'Login' ? '' : <input onChange={(e)=>setName(e.target.value)} value={name} type="text" className='w-full px-3 py-2 border border-gray-800' placeholder='Name' required/>}
          <input onChange={(e)=>setEmail(e.target.value)} value={email} type="email" className='w-full px-3 py-2 border border-gray-800' placeholder='Email' required/>
          <input onChange={(e)=>setPassword(e.target.value)} value={password} type="password" className='w-full px-3 py-2 border border-gray-800' placeholder='Password'required/>
          <div className='w-full flex justify-between text-sm mt-[-8px]'>
            <p 
              onClick={() => {setCurrentState('Login'); setLoginMethod('otp');}} 
              className='cursor-pointer text-blue-600'>
              Login with OTP
            </p>
            {
              currentState === 'Login'
              ? <p onClick={()=> setCurrentState('Sign Up')} className='cursor-pointer'>Create account</p>
              : <p onClick={()=> setCurrentState('Login')} className='cursor-pointer'>Login Here</p>
            }
          </div>
          <button className='bg-black text-white font-light px-8 py-2 mt-4'>{currentState === 'Login' ? 'Sign In' : 'Sign Up'}</button>
        </form>
      )}
    </div>
  )
}

export default Login;

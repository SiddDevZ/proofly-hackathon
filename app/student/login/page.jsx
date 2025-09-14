"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Toaster, toast } from "sonner";
import { BACKEND_URL } from "../../../lib/config";
import "remixicon/fonts/remixicon.css";
import dynamic from "next/dynamic";
import Link from "next/link";

const BackgroundBeams = dynamic(
  () =>
    import("../../../components/ui/background-beams").then(
      (mod) => mod.BackgroundBeams
    ),
  {
    ssr: false,
    loading: () => <div></div>,
  }
);

const page = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [isError, setIsError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const verifyToken = async () => {
      const token = localStorage.getItem('proofly_student_token');
      if (token) {
        try {
          const response = await fetch(`${BACKEND_URL}/api/student/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
          });

          const data = await response.json();
          if (data.valid) {
            router.push('/student/dashboard');
          } else {
            localStorage.removeItem('proofly_student_token');
          }
        } catch (error) {
          console.error('Token verification error:', error);
          localStorage.removeItem('proofly_student_token');
        }
      }
    };

    verifyToken();
  }, [router]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleEye = () => {
    setShowPassword(!showPassword);
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    let hasError = false;
  
    if (!email.includes("@") || !email.includes(".") || email.includes(" ") || email === "") {
      toast.error("Invalid Email, Please enter a valid email");
      setEmailError(true);
      hasError = true;
    } else {
      setEmailError(false);
    }
  
    if (password === "") {
      toast.error("Password cannot be empty");
      setPasswordError(true);
      hasError = true;
    } else {
      setPasswordError(false);
    }
  
    setIsError(hasError);
  
    if(hasError) {
      return;
    }
  
    try {
      const response = await fetch(`${BACKEND_URL}/api/student/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token in localStorage
        localStorage.setItem('proofly_student_token', data.token);
        // Redirect to dashboard
        router.push('/student/dashboard');
      } else {
        toast.error(data.error || 'Login failed');
        setEmailError(true);
        setPasswordError(true);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Connection error. Please try again.');
    }
  };

  const handleGoogleLogin = () => {
    // Placeholder for Google login
    toast.info("Google login for students - Coming soon!");
  };

  return (
    <div className="dark flex w-full h-screen flex-col items-center justify-center sm:justify-center overflow-hidden bg-black">
      <div className="w-full xss:max-w-full sm:max-w-[29rem] sm:h-max xss:h-screen z-10 flex flex-col items-center sm:justify-center xss:justify-start sm:px-10 xss:px-5 py-10 rounded-xl sm:border border-white/10 backdrop-filter backdrop-blur-sm bg-black/20 xss:mt-5 sm:mt-0">
        <div className="w-full flex justify-center mb-6">
          <Link
            href="/"
            className="flex group items-center cursor-pointer gap-1"
            prefetch
          >
            <i className="ri-arrow-left-line text-sm text-[#CCCCCC] group-hover:-translate-x-1 transition-transform duration-300"></i>
            <p className="text-xs group-hover:underline text-[#CCCCCC]">Back</p>
          </Link>
        </div>
        <h1 className="font-inter font-semibold text-center text-4xl">
          Student Login
        </h1>
        <h4 className="font-inter text-sm font-medium mt-4 mb-6 tracking-wide leading-5 text-[#cccccc] text-center max-w-[21rem]">
          Access your student account to manage your credentials and share them with potential employers.
        </h4>

        <div className="flex flex-col gap-4 justify-center w-full">
          <button
            onClick={handleGoogleLogin}
            className="border border-[#acacac] hover:border-white hover:scale-[1.02] transition-all ease-in-out gap-2 flex items-center justify-center text-white font-inter w-full font-medium py-2.5 px-4 rounded-full duration-300"
          >
            <svg className="w-[1.7rem] h-[1.7rem]" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
        </div>
        <div className="flex items-center w-[80%] mx-auto my-4">
          <div className="w-[45%] h-[1px] bg-[#8c8c8c]"></div>
          <div className="px-4 text-[#cccccc]">or</div>
          <div className="w-[45%] h-[1px] bg-[#8c8c8c]"></div>
        </div>

        <div className="w-full relative">
          <input
            type="email"
            placeholder="Enter your email"
            id="email"
            onClick={() => setEmailError(false)}
            className={`w-full ${
              emailError ? "bg-[#440b0b]" : "bg-[#1f1f1f]"
            } text-white font-inter text-base py-3 px-7 rounded-full focus:outline-none focus:ring-2 focus:ring-[#cccccc] hover:ring-2 hover:ring-[#a2a2a2] focus:border-transparent transition duration-300`}
          />
        </div>

        <div className="w-full relative mt-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            id="password"
            onClick={() => setPasswordError(false)}
            className={`w-full ${
              passwordError ? "bg-[#440b0b]" : "bg-[#1f1f1f]"
            } text-white font-inter text-base py-3 px-7 rounded-full focus:outline-none focus:ring-2 focus:ring-[#cccccc] hover:ring-2 hover:ring-[#a2a2a2] focus:border-transparent transition duration-300`}
          />
          <button
            type="button"
            onClick={handleEye}
            className={`${
              showPassword ? "ri-eye-line" : "ri-eye-off-line"
            } absolute right-6 text-xl top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer`}
          ></button>
        </div>

        <button
          onClick={handleEmailLogin}
          className="mt-6 hover:scale-[1.02] bg-[#f2f2f2] text-black font-inter w-full font-medium py-3 px-4 rounded-full hover:bg-[#e1e1e1] transition duration-300"
        >
          Login as Student
        </button>

        <h5 className="font-inter text-[#cccccc] mt-5">
          Don't have an account?{" "}
          <Link
            href="/student/register"
            className="ml-0.5 hover:underline decoration-[#c1c1c1] text-white"
          >
            Register
          </Link>
        </h5>
      </div>
      {!isMobile && <BackgroundBeams />}
              <Toaster theme="dark" position="bottom-right" richColors />
    </div>
  );
};

export default page; 
import type { Route } from "./+types/home";
import notable_logo from '../images/notable_logo.png'
import { Link, Outlet, useLocation } from "react-router";
import { useState, useEffect, useRef } from "react";
import {motion, AnimatePresence} from 'framer-motion'


export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function MainApp(){

    const [showNav, setShowNav] = useState(false)

    return(
        <div>
            {showNav &&
            <>
                <div 
                    className="
                        w-[250px] h-dvh
                        absolute
                        bg-[#f4f4f4] z-3">
                    <i className="bi bi-x text-4xl pr-[0.5rem] cursor-pointer" onClick={() => setShowNav(false)}></i>
                    <ul className="font-medium p-[1rem] pl-[0.5rem] flex flex-col gap-[1rem]">
                        <li>My Stack</li>
                        <li>Create Stack</li>
                    </ul>
                </div>
                <div className="bg-[#27262641] w-dvw h-dvh absolute z-2"></div>
            </>}
            <nav className="h-[55px]  bg-[#522258] flex items-center justify-between pr-[2rem]">
                <div className="flex items-center h-[90%]">
                    <i 
                        className="md:hidden lg:hidden bi bi-list text-2xl text-[#f4f4f4] cursor-pointer text-[#fff281] pl-[0.5rem]"
                        onClick={() => setShowNav(prev => !prev)}></i>
                    <img src={notable_logo} alt="" className="h-[75%] lg:h-[90%] w-auto hover:cursor-pointer" />
                </div>
                <input 
                    type="text" 
                    className="
                        text-[#f4f4f4]
                        h-[35px] w-[60%] lg:w-[50%] 
                        ml-[2rem] mr-[2rem] 
                        bg-[#6A2C72] 
                        border-[#fff2817b] border rounded-[5px]
                        p-[0.5rem]
                        focus:outline-none focus:border-[#fff2817b] focus:border-2"></input>
                <Link 
                    to='mystack'
                    className="
                        text-white
                        hidden  lg:block">
                    My Flashcards   
                </Link>
                <Link 
                    to='createstack' 
                    className="
                        text-[#fff281]
                        hidden lg:block">
                    <i className="bi bi-plus mr-[0.5rem]"></i>Create Stack
                </Link>
            </nav>
            <div className="h-[calc(100dvh-55px)]">
                <Outlet></Outlet>
            </div>
        </div>
    )
}
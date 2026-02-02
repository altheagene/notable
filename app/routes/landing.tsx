import type { Route } from "./+types/home";
import notable_logo from '../images/notable_logo.png'
import { Link, redirect } from "react-router";
import { useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader({request} : Route.LoaderArgs){
  const {getUserId} = await import('../sessions.server')
  const userId = await getUserId(request)

  if(userId){
    return redirect('/main')
  }
}

export default function Landing(){
  
  const [showNav, setShowNav] = useState<boolean>(false);

  return(
      <div className="bg-[#522258] h-dvh">
        <div className="sm:block lg:hidden md:hidden bg-white w-[250px] h-dvh">

        </div>
        <nav className="h-[60px] bg-[#522258] pl-5 pr-[2rem] flex justify-between items-center">
            <div className="h-full flex items-center text-sm">
              <i className="bi bi-list text-[1.5rem] cursor-pointer sm:visible lg:hidden md:hidden"></i>
              <img src={notable_logo} className="h-9/10"></img>
            </div>
            
            <div className="h-full flex items-center text-sm hidden lg:flex md:flex text-[#f4f4f4]">
              <Link 
                className="w-[110px] h-6/10 text-center flex justify-center items-center" 
                to='/loginregister?type=login'
                state={'login'}>Login</Link>

              <Link  
                className="w-[110px] h-6/10 bg-[#E69F1E] font-semibold rounded-[5px] text-center flex justify-center items-center" 
                to='/loginregister?type=signup'
                state={'signup'}>Sign Up</Link>
            </div>
        </nav>

        <div className="h-[calc(100dvh-60px)]">
          <div className="text-center flex flex-col items-center h-full pt-[150px]">
            <h1 className="font-regular text-4xl md:text-[3rem] lg:text-6xl text-[#f4f4f4]">
              <span className="text-[#FFF281] font-bold">Notable</span> makes studying easier.
            </h1>

            <p className="w-[60%] text-[1rem] lg:text-xl pt-[1.5rem] text-[#f4f4f4]">
              A better way to study with flashcards is here. Notable makes it simple to create your own flashcards, 
              study those of a classmate, or search our archive of millions of flashcard decks from other students.
            </p>

            <div className="h-[3rem] flex items-center text-sm m-[2rem] sm:flex md:hidden lg:hidden">
              <Link 
                className="w-[110px] h-full text-center flex justify-center items-center" 
                to='/loginregister'>Login</Link>

              <Link  
                className="w-[110px] h-full bg-[#E69F1E] font-semibold rounded-[5px] text-center flex justify-center items-center" 
                to='/loginregister'>Sign Up</Link>
            </div>
          </div>
        </div>
      </div>
  )
}
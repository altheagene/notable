import type { Route } from "./+types/home";
import notable_logo from '../images/notable_logo.png'
import { Link, Outlet, useLocation, Form, redirect, type ActionFunctionArgs } from "react-router";
import { useState, useEffect, useRef } from "react";
import {API_URL} from '../config.js'
import {motion, AnimatePresence} from 'framer-motion'


export function meta({}: Route.MetaArgs) {
  return [
    { title: "Notable" },
    { name: "description", content: "A better way to study with flashcards." },
  ];
}

export async function loader({request} : Route.LoaderArgs){

    const {getUserId} = await import('../sessions.server')
    const userId = await getUserId(request)
    if(!userId){
        console.log('aaaa')
        return redirect('/')
    }

//    const user_id = await fetch(`${API_URL}/isloggedin`)
//                     .then(res => res.json())
    
//     if(!user_id){
//         redirect('/main')
//     }
}

export async function action({request} : Route.ActionFunctionArgs){
    const {logout} = await import ('../sessions.server')
    console.log('Hi')
    return logout(request)
}

export default function MainApp(){

    const [showNav, setShowNav] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    return(
        <div className="library-shell">
            {showNav &&
            <>
                <div className="library-drawer">
                    <button type="button" className="library-drawer-close" onClick={() => setShowNav(false)} aria-label="Close menu">
                        <i className="bi bi-x-lg"></i>
                    </button>
                    <Link to="mystack" onClick={() => setShowNav(false)}>My Flashcards</Link>
                    <Link to="mystack" onClick={() => setShowNav(false)}>Create Stack</Link>
                </div>
                <div className="library-drawer-mask" onClick={() => setShowNav(false)}></div>
            </>}
            <nav className="library-nav">
                <div className="library-nav-brand">
                    <button
                        type="button"
                        className="library-nav-menu"
                        onClick={() => setShowNav(prev => !prev)}
                        aria-label="Open menu"
                    >
                        <i className="bi bi-list"></i>
                    </button>
                    <Link to="mystack" className="library-nav-logo">
                        <img src={notable_logo} alt="Notable" />
                    </Link>
                </div>
                <label className="library-search">
                    <i className="bi bi-search" aria-hidden="true"></i>
                    <span className="sr-only">Search stacks</span>
                    <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search stacks"
                    />
                </label>
                <div className="library-nav-links">
                    <Link to="mystack" className="library-nav-link">My Flashcards</Link>
                    <Link to="mystack" className="library-nav-link">Create Stack</Link>
                    <Form name="logout" method="POST">
                        <button type="submit" className="library-nav-link library-nav-link-ghost">Logout</button>
                    </Form>
                </div>
            </nav>
            <div className="library-outlet">
                <Outlet context={{searchQuery}} />
            </div>
        </div>
    )
}
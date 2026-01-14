import type { Route } from "./+types/home";
import notable_logo from '../images/notable_logo.png'
import { Link, redirect, useLocation, Form } from "react-router";
import { useState, useEffect, useRef } from "react";
import {API_URL} from '../config.js'
//import {getSession, commitSession, destroySession, getUserId} from '../sessions.server'


export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

const [loginUsername, setLoginUsername] = useState('');
const [loginPass, setLoginPass] = useState('');

export async function loader({request} : Route.LoaderArgs){

    const {getUserId} = await import ('../sessions.server');
    const userId = await getUserId(request)
    if(userId){
        return redirect('/')
    }
}

export async function action({request} : Route.LoaderArgs){
    const {getSession, destroySession, createUserSession} = await import ('../sessions.server')
    const formData = await request.formData();
    const action = formData.get('_action');
    if(action == 'login'){

        const response = await fetch(`${API_URL}/verifylogin`, {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json'
            },
            body: JSON.stringify({username: loginUsername, user_password: loginPass})
        })

        const result = await response.json()

        if (result.success){
            try{
                const session = createUserSession({
                    request,
                    userId: loginUsername,
                    remember : true,
                    redirectUrl: '/'
                })
            }catch{
                
            }
        }
    }
}



export default function LoginRegister(){
    const location = useLocation()

    //State
    const [chosen, setChosen] = useState(location.state);

    // const loginUser = document.getElementById('login-username');
    // const loginPass = document.getElementById('logn-pass')
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const monthOptions = months.map(month => {
        return(
            <option value={month} className="opacity-[100%]">{month}</option>
        )
    })

    const registerPanel = useRef(null)

    //---------------------------------- API CALLS -------------------------------------//

    


    //---------------------------------- FUNCTIONS -------------------------------------//

    function registerNextClick(){
        registerPanel.current.scrollTo({
            left: registerPanel.current.scrollLeft + registerPanel.current.offsetWidth,
            behavior: 'smooth'
        })
    }

    function goBackBtn(){
        registerPanel.current.scrollTo({
            left: registerPanel.current.scrollLeft - registerPanel.current.offsetWidth,
            behavior: 'smooth'
        })
    }

    function requiredFieldsLogin(username:String, pass:String){
        if(username.trim() == '' || pass == ''){
            return false
        }

        return true
    }

    async function loginClick(){
        const valid = requiredFieldsLogin(loginUsername, loginPass)
        if (!valid){
            return
        }
            
        const response = await fetch(`${API_URL}/verifylogin`,{
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json'
            },
            body: JSON.stringify({username:  loginUsername, user_password: loginPass})
        });

        const result = response.json();
        
    }

    
    
    return(
        <div className="h-dvh w-dwh">
            <div className="flex bg-[#F4F4F4] h-dvh">

                <div className="lg:w-[55%] md:w-[45%] sm:w-[30%] credentials-div bg-[#522258] hidden justify-center items-center relative sm:flex lg:flex md:flex">
                    <div 
                        className="
                            lg:pl-[5rem] lg:pr-[5rem]
                            md:pl-[3rem] md:pr-[3rem]
                           ">
                        <p className="lg:text-7xl md:text-5xl  font-semibold text-[#FFF281]">The easiest way to study. </p>
                        <p className="pt-[2rem] text-lg text-[#f4f4f4]">A better way to study with flashcards is here. Notable makes it simple to create your own flashcards, 
                            study those of a classmate, or search our archive of millions of flashcard decks from other students.</p>
                    </div>
                    <img className="absolute h-[80px] bottom-0 left-[1rem]" src={notable_logo} alt="" />
                </div>
                {/* LOGIN */}

                {chosen == 'login'&&
                <div className="lg:w-[45%] md:w-[50%] sm:w-[60%] w-[100%] credentials-div ">
                     <div className="text-xl flex gap-5 font-medium">
                        <div  
                            className="border-b-[#F4AE30] border-b-3 text-[#272626] cursor-pointer"
                            onClick={() => setChosen('login')}>Login</div>
                        <div 
                            className="text-[#272626] opacity-60 cursor-pointer"
                            onClick={() => setChosen('signup')}>Sign up</div>
                    </div>
                    <Form className="max-w-full text-[#272626] flex flex-col gap-[2rem] mt-[1rem]">
                        <p className="font-semibold text-2xl mt-[1rem]">Welcome Back!</p>
                        <div className="flex flex-col gap-[2rem]">
                            <label htmlFor="">Username
                                <input type="text" id="login-username" onChange={(e) => setLoginUsername(e.target.value)}/>
                            </label>

                            <label htmlFor="">Password
                                <input type="password" id="login-pass"onChange={(e) => setLoginPass(e.target.value)}/>
                            </label>

                        </div>

                        <button
                            value='login'
                            name='_action'
                            type="submit"
                            className="bg-[#6A2C72] text-[#FFF281] font-semibold h-[40px] w-[100%] rounded-[50px]"
                            onClick={loginClick}>Log In</button>
                        <button 
                            type='button'
                            className="border border-[#6A2C72] text-[#6A2C72] font-semibold h-[40px] w-[100%] rounded-[50px]"
                            onClick={() => setChosen('signup')}>Create account</button>
                    </Form>
                </div>
                }

                {/* REGISTER */}
                {chosen == 'signup' && 
                <div className="lg:w-[45%] md:w-[50%] sm:w-[60%] w-[100%] text-[#272626] flex overflow-hidden snap-x snap-mandatory no-scrollbar" ref={registerPanel}>
                    <div className="credentials-div min-w-full flex flex-col text-[#272626] snap-center">
                        <div className="text-xl flex flex gap-5 font-medium">
                            <div 
                                className="text-[#272626] opacity-60 cursor-pointer"
                                onClick={() => setChosen('login')}>Login</div>
                            <div 
                                className="border-b-[#F4AE30] border-b-3 text-[#272626] cursor-pointer"
                                onClick={() => setChosen('signup')}>Sign up</div>
                        </div>
                        <div className="flex flex-col gap-[2rem] mt-[1rem]">
                            <p className="text-2xl font-semibold mt-[1rem]">Personal Information</p>
                            <div className="flex gap-[1rem]">
                                <label className="w-[50%]" htmlFor="">Month
                                    <select name="" id="" className="w-full border rounded-[5px]">
                                        {monthOptions}
                                    </select>
                                </label>

                                <label className="w-[20%]" htmlFor="">Day
                                    <select name="" id="" className="w-full border rounded-[5px]"></select>
                                </label>

                                <label className="w-[25%]" htmlFor="">Year
                                    <select name="" id="" className="w-full border rounded-[5px]"></select>
                                </label>
                            </div>

                            <label htmlFor="">First Name
                                <input type="text" />
                            </label>

                            <label htmlFor="">Last Name
                                <input type="text" />
                            </label>

                            <label htmlFor="">Email
                                <input type="text" />
                            </label>

                            <button 
                                className="w-[100%] h-[50px] font-semibold bg-[#6A2C72] text-[#FFF281] rounded-[50px] mt-[2rem]"
                                onClick={registerNextClick}>Register</button>
                            
                            <button 
                                className="border border-[#6A2C72] text-[#6A2C72] font-semibold h-[40px] w-[100%] rounded-[50px]"
                                onClick={() => setChosen('login')}>Log In</button>
                        </div>
                    </div>
                    <div className="flex flex-col gap-[3rem] min-w-full snap-center text-center justify-center items-center relative">
                        <i 
                            onClick={goBackBtn}
                            className="
                                cursor-pointer
                                bi bi-arrow-left-square-fill
                                absolute top-3 left-3
                                text-[#6A2C72]
                                text-5xl"></i>
                        <div className="h-[100px]">
                            <p className="text-3xl font-semibold ">Verify your email</p>
                            <p className="text-center pt-[1rem]">Please enter the 5-digit code we sent to youremail@email.com</p>
                        </div>
                        <div className="flex gap-[2rem] mx-auto w-fit">
                            {Array.from({length:5}).map((_, i) => 
                                <input 
                                    inputMode="numeric"
                                    maxLength={1}
                                    type='text' 
                                    className="
                                        text-center
                                        caret-transparent
                                        p-[0.5rem]
                                        text-4xl
                                        text-[#272626]
                                        w-[50px] h-[60px]
                                        border-[#272626] border rounded-[5px] 
                                        focus:border-[#822B8D] focus:outline-none focus:border-2"></input>)}
                        </div>
                        <p className="font-semibold text-[#822B8D]">Resend code</p>
                        <button 
                            className="h-[50px] w-[200px] rounded-[50px] bg-[#6A2C72] text-[#FFF281] font-semibold"
                            onClick={registerNextClick}>Verify my email</button>
                    </div>
                    <div className="min-w-full credentials-div snap-center relative flex flex-col gap-[2rem]">
                         <i 
                            onClick={goBackBtn}
                            className="
                                cursor-pointer
                                bi bi-arrow-left-square-fill
                                absolute top-3 left-3
                                text-[#6A2C72]
                                text-5xl"></i>
                        <p className="text-2xl font-semibold pb-[3rem] mt-[2rem]">Enter your credentials</p>

                        <div className="flex flex-col gap-[2rem]">
                            <label htmlFor="username">Username
                                <input type="text" id="username" />
                            </label>

                            <label htmlFor="password">Password
                                <input type="text" name="" id="password" />
                            </label>

                            <label htmlFor="password">Confirm Password
                                <input type="text" name="" id="confirm-password" />
                            </label>
                        </div>

                        <button 
                            className="w-[100%] h-[50px] font-semibold bg-[#6A2C72] text-[#FFF281] rounded-[50px] mt-[3rem]"
                            onClick={registerNextClick}>Complete account creation</button>
                    </div>
                </div>
                }
            </div>
        </div>
    )
}
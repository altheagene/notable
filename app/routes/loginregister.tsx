import type { Route } from "./+types/home";
import notable_logo from '../images/notable_logo.png'
import { Link, redirect, useLocation, Form, type ActionFunctionArgs, useSearchParams } from "react-router";
import React, { useState, useEffect, useRef } from "react";
import {API_URL} from '../config.js'
//import {getSession, commitSession, destroySession, getUserId} from '../sessions.server'


export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader({request} : Route.LoaderArgs){

    const {getUserId} = await import ('../sessions.server');
    const userId = await getUserId(request)
    if(userId){
        return redirect('/main')
    }

    // const user_id = await fetch(`${API_URL}/isloggedin`, 
    //     {
    //         method: 'POST',
    //         credentials: 'include'
    //     }
    // )
    // const data = await user_id.json()
    // console.log("loader: ", data)

    // if(data){
    //     return redirect('/main')
    // }
}

export async function action({request} : ActionFunctionArgs){
    const {getSession, destroySession, createUserSession} = await import ('../sessions.server')
    const formData = await request.formData();
    const action = formData.get('_action');
    const username = formData.get('username')
    const password = formData.get('password')
    console.log('HI')
    if(action == 'login'){

        const response = await fetch(`${API_URL}/verifylogin`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type' : 'application/json'
            },
            body: JSON.stringify({username: username, user_password: password})
        })

        const result = await response.json()
        console.log(result['user_id'])

        if (result['correct_password']){
            try{
                return await createUserSession({
                    request,
                    userId: result['user_id'],
                    remember : true,
                    redirectUrl: '/main'
                })

            }catch (err){
                console.log(err)
            }
        }
    }
}



export default function LoginRegister(){
    let timeout:any;
    // const location = useLocation()
    const [params] = useSearchParams();
    const location = params.get('type')
    const requiredIcon = <span className="text-red-500">*</span>
    

    //State
    const [validUsername, setValidUsername] = useState(false) 
    const [chosen, setChosen] = useState(location);
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPass, setLoginPass] = useState('');
    const [code, setCode] = useState<string[]>(Array(5).fill(''))
    const [myUsername, setMyUsername] = useState<string>('')
    const [initialPass, setInitialPass]= useState<string>('');
    const [finalPass, setFinalPass] = useState<string>('');
    const [gender, setGender] = useState<string>('');
    const [categoryId, setCategoryId] = useState<number>()
    console.log(chosen)
    // const loginUser = document.getElementById('login-username');
    // const loginPass = document.getElementById('logn-pass')
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const monthOptions = months.map(month => {
        return(
            <option value={month} className="opacity-[100%]">{month}</option>
        )
    })

    //USE REF
    const firstName = useRef<HTMLInputElement>(null)
    const lastName = useRef<HTMLInputElement>(null)
    const email = useRef<HTMLInputElement>(null)
    const birthday = useRef<HTMLInputElement>(null)
    const username = useRef<HTMLInputElement>(null)
    const origPassword = useRef<HTMLInputElement>(null)
    const reEnteredPassword = useRef<HTMLInputElement>(null)
    const codeInputRefs = useRef<HTMLInputElement[]>([]);
    const codeInputs = code.map((num, index) =>  {
                    return(
                        <input
                            key={index}
                            onKeyDown={(e) => {
                                if(e.key == 'Backspace'){
                                    editCode('', index)
                                }
                            }}
                            ref= {(el) => {(codeInputRefs.current[index] = el!)}}
                            value={num}
                            onChange={(e => editCode(e.target.value, index))}
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
                                focus:border-[#822B8D] focus:outline-none focus:border-2"></input>)})

    const registerPanel = useRef(null);


    useEffect(() => {
       for (let i = 0; i < codeInputRefs.current.length; i++){
        if(code[i] == ''){
            codeInputRefs.current[i].focus(); 
            break;
        }
       }

    }, [code])

    //---------------------------------- API CALLS -------------------------------------//

    


    //---------------------------------- FUNCTIONS -------------------------------------//

    function scrollRegisterPanel(){
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

        const result = await response.json();

        if(!result['username_exists']){
            console.log('This username does not exist!');
        }else if(result['username_exists'] && result['correct_password']){
            console.log('Valid!');
        }else{
            console.log('Incorrect password!');
        }
        
    }

    function editCode(value:string, index:number){
        const values = [...code];
        values[index] = value.trim();
        setCode(values)
    }

    async function registerBtnClick(){
        //check if all fields are filled
        if(!birthday.current?.value){
            birthday.current.style.borderColor = 'red'
            return
        }else if (!firstName.current?.value.trim()){
            firstName.current.style.borderColor = 'red'
            return
        }else if (!lastName.current?.value.trim()){
            lastName.current.style.borderColor = 'red'
            return
        }else if (!email.current?.value.trim()){
            email.current.style.borderColor = 'red'
            return
        }

        const filled =  birthday.current?.value && 
                        firstName.current?.value.trim() &&
                        lastName.current?.value.trim() &&
                        email.current?.value.trim()
        if (!filled){
            console.log('Please fill all fields!')
            return;
        }
        //check the validity of the email
        const regEx = /[^\s@]+@[^\s@].[^s@]+/
        const validEmailSyntax = regEx.test(email.current?.value.trim())
        
        if(!validEmailSyntax){
            console.log('Invalid email syntax!')
            return;
        }
        
        //check if email already exists
        const fetchusername = await fetch(`${API_URL}/checkemail`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({'email' : email.current?.value.trim()})
            }
        )

        const result = await fetchusername.json()

        if(!result.exists){
            scrollRegisterPanel();
            const responses = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({'email' : email.current?.value})
            })

            const result = await responses.json()

            if (result.success){
                console.log('Email sent!')
            }
        }else{
            console.log('Email already exists!')
        }
        
    }

    async function verifyemail(){

        const stringifiedCode = code.join('')
        const response = await fetch(`${API_URL}/verifyemail`,{
            method: 'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify({'code' : stringifiedCode, 'email' : email.current?.value})
        })

        const result = await response.json()
        
        if(result.success){
            scrollRegisterPanel()
        }else{
            console.log('Incorrect code!')
        }
    }

    useEffect(() => {
        clearTimeout(timeout)

        if(myUsername.trim() == ''){ //check if username is filled with non-white space values
            return
        }

        const regEx = /[^a-z0-9_.]/
        console.log(regEx.test(myUsername))

        timeout = setTimeout(() => {
            checkUsername()
        }, 3000)
    }, [myUsername])

    async function checkUsername(){
        const response =  await fetch(`${API_URL}/checkusername`, {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json'
            },
            body: JSON.stringify({username: myUsername})
           })
           const result = await response.json()
           console.log(result)
           if(result.exists){
            setValidUsername(false)
           }else{
            setValidUsername(true)
           }
    }

    async function completeAccountBtn(){
        const validPassword = initialPass == finalPass;
        console.log(validUsername)
        
        if(!validPassword || !validUsername){
            console.log('invalid')
            return;
        }

        const userInfo = {
            categoryId: categoryId,
            birthday: birthday.current?.value,
            firstName: firstName.current?.value.trim(),
            lastName: lastName.current?.value.trim(),
            gender:gender,
            email : email.current?.value,
            username: myUsername,
            user_password: finalPass
        }

        console.log(userInfo)

        const response = await fetch(`${API_URL}/createaccount`, 
            {
                method: 'POST',
                headers: 
                {
                    'Content-Type' : 'application/json'
                },
                body: JSON.stringify(userInfo)
            }
        )

        const result = await response.json()
        console.log(result)
    }
    
    async function verifyLogin(){

        const response = await fetch(`${API_URL}/verifylogin`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type' : 'application/json'
            },
            body: JSON.stringify({username: loginUsername, user_password: loginPass})
        })

        const result = await response.json()

        console.log(result)
    }
    //USE EFFECTS

    // useEffect(() => {
    //     const user_id = fetch(`${API_URL}/isloggedin`)
    //                     .then(res => res.json())
    
    //     if(!user_id){
    //         redirect('/main')
    //     }
    // }, [])

    useEffect(() => {
        fetch(`${API_URL}/get_enduser_categ_id`)
        .then(res => res.json())
        .then(data => setCategoryId(data[0]['id']))

    }, [])

    useEffect(() => {
        if(initialPass != finalPass){
            console.log('Passwords do not match')
        }else{
            console.log('Passwords match!')
        }
    }, [finalPass])

    useEffect(() => {
        const regEx = /^(?=.*[A-SZ])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*+]).{8,}$/

        console.log(regEx.test(initialPass))
    }, [initialPass])

    useEffect(() => {
        registerPanel.current?.scrollTo({
            left: 0
        })
    }, [chosen])
    
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

                {chosen == 'login' &&
                <div className="lg:w-[45%] md:w-[50%] sm:w-[60%] w-[100%] credentials-div ">
                     <div className="text-xl flex gap-5 font-medium">
                        <div  
                            className="border-b-[#F4AE30] border-b-3 text-[#272626] cursor-pointer"
                            onClick={() => setChosen('login')}>Login</div>
                        <div 
                            className="text-[#272626] opacity-60 cursor-pointer"
                            onClick={() => setChosen('signup')}>Sign up</div>
                    </div>
                    <Form 
                        method="POST"
                        className="max-w-full text-[#272626] flex flex-col gap-[2rem] mt-[1rem]">
                        <p className="font-semibold text-2xl mt-[1rem]">Welcome Back!</p>
                        <div className="flex flex-col gap-[2rem]">
                            <label htmlFor="">Username
                                <input 
                                    type="text" 
                                    id="login-username"
                                    name='username'
                                    onChange={(e) => setLoginUsername(e.target.value)}/>
                            </label>

                            <label htmlFor="">Password
                                <input 
                                    type="password" 
                                    id="login-pass"
                                    name="password"
                                    onChange={(e) => setLoginPass(e.target.value)}/>
                            </label>

                        </div>

                        <button
                            value='login'
                            name='_action'
                            type="submit"
                            
                            className="bg-[#6A2C72] text-[#FFF281] font-semibold h-[40px] w-[100%] rounded-[50px]"
                            >Log In</button>
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
                    <div className="register-panel credentials-div min-w-full flex flex-col text-[#272626] snap-center">
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
                            <label htmlFor="">Email {requiredIcon}
                                <input type="text" name="email" id="email" ref={email}/>
                            </label>
                            <div className="flex gap-[1rem]">
                                <label htmlFor="">Birthdate {requiredIcon}
                                    <input type="date" name="" id="" ref={birthday} className=""/>
                                </label>
                                {/* <label className="w-[50%]" htmlFor="">Month
                                    <select name="" id="" className="w-full border rounded-[5px]">
                                        {monthOptions}
                                    </select>
                                </label>

                                <label className="w-[20%]" htmlFor="">Day
                                    <select name="" id="" className="w-full border rounded-[5px]"></select>
                                </label>

                                <label className="w-[25%]" htmlFor="">Year
                                    <select name="" id="" className="w-full border rounded-[5px]"></select>
                                </label> */}
                            </div>
                            
                            <label htmlFor="">First Name {requiredIcon}
                                <input type="text" name="first_name" ref={firstName} />
                            </label>

                            <label htmlFor="">Last Name {requiredIcon}
                                <input type="text" name="last_name" ref={lastName}/>
                            </label>

                            <label>
                                <input type="radio" name="gender" id="" className="w-[50px]" onChange={() => setGender('female')}/> Female
                            </label>

                            <label htmlFor="">
                                <input type="radio" name="gender" className="w-[50px]" onChange={() => setGender('male')}/> Male
                            </label>


                            <button 
                                type="submit"
                                className="w-[100%] h-[50px] font-semibold bg-[#6A2C72] text-[#FFF281] rounded-[50px] mt-[2rem]"
                                onClick={registerBtnClick}>Register</button>
                            
                            <button
                                type="button" 
                                className="border border-[#6A2C72] text-[#6A2C72] font-semibold h-[40px] w-[100%] rounded-[50px]"
                                onClick={() => setChosen('login')}>Log In</button>
                        </div>
                    </div>
                    <div className=" register-panel flex flex-col gap-[3rem] min-w-full snap-center text-center justify-center items-center relative">
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
                            {codeInputs}
                        </div>
                        <p className="font-semibold text-[#822B8D]">Resend code</p>
                        <button 
                            className="h-[50px] w-[200px] rounded-[50px] bg-[#6A2C72] text-[#FFF281] font-semibold"
                            onClick={verifyemail}>Verify my email</button>
                    </div>
                    <div className="register-panel min-w-full credentials-div snap-center relative flex flex-col gap-[2rem]">
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
                            <label htmlFor="username">Username {requiredIcon}
                                <input type="text" id="username" ref={username} onChange={(e) => setMyUsername(e.target.value)}/>
                            </label>

                            <label htmlFor="password">Password {requiredIcon}
                                <input type="text" name="" id="password" ref={origPassword} onChange={(e) => setInitialPass(e.target.value)}/>
                            </label>

                            <label htmlFor="password">Confirm Password {requiredIcon}
                                <input type="text" name="" id="confirm-password" ref={reEnteredPassword} onChange={(e) => setFinalPass(e.target.value)}/>
                            </label>
                        </div>

                        <button 
                            onClick={completeAccountBtn}
                            className="w-[100%] h-[50px] font-semibold bg-[#6A2C72] text-[#FFF281] rounded-[50px] mt-[3rem]"
                            >Complete account creation</button>
                    </div>
                </div>
                }
            </div>
        </div>
    )
}
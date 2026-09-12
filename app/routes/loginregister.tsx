import type { Route } from "./+types/home";
import notable_logo from '../images/notable_logo.png'
import { Link, redirect, Form, type ActionFunctionArgs, useSearchParams } from "react-router";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {API_URL} from '../config.js'
//import {getSession, commitSession, destroySession, getUserId} from '../sessions.server'


export function meta({}: Route.MetaArgs) {
  return [
    { title: "Notable" },
    { name: "description", content: "A better way to study with flashcards." },
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
    const requiredIcon = <span className="text-red-500" aria-hidden="true">*</span>
    

    //State
    const [validUsername, setValidUsername] = useState(false) 
    const [chosen, setChosen] = useState(location || 'login');

    useEffect(() => {
        if (location === 'login' || location === 'signup') {
            setChosen(location)
        }
    }, [location])
    const [showLoginPass, setShowLoginPass] = useState(false);
    const [showSignupPass, setShowSignupPass] = useState(false);
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
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            className="auth-otp"
                        ></input>)})

    const registerPanel = useRef<HTMLDivElement>(null);


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
        <div className="auth-shell">
            <div className="auth-form-col">
                <AuthLockup className="auth-brand-mobile" />
                <AuthTabs chosen={chosen} onChoose={setChosen} />
                {chosen == 'login' &&
                <div className="auth-form-inner auth-login">
                    <h1 className="auth-title">Welcome back</h1>
                    <p className="auth-lede">Pick up your stacks and keep studying.</p>
                    <Form method="POST" className="auth-login-form">
                        <label className="auth-field" htmlFor="login-username">
                            <span className="auth-label">Username</span>
                            <input
                                type="text"
                                id="login-username"
                                name="username"
                                autoComplete="username"
                                required
                                onChange={(e) => setLoginUsername(e.target.value)}
                            />
                        </label>
                        <label className="auth-field" htmlFor="login-pass">
                            <span className="auth-label">Password</span>
                            <div className="auth-pass-wrap">
                                <input
                                    type={showLoginPass ? "text" : "password"}
                                    id="login-pass"
                                    name="password"
                                    autoComplete="current-password"
                                    required
                                    onChange={(e) => setLoginPass(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowLoginPass((prev) => !prev)}
                                    aria-label={showLoginPass ? "Hide password" : "Show password"}
                                >
                                    <i className={showLoginPass ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                                </button>
                            </div>
                        </label>
                        <button
                            value="login"
                            name="_action"
                            type="submit"
                            className="auth-cta"
                        >Log in</button>
                    </Form>
                    <p className="auth-switch">
                        New here?{" "}
                        <button type="button" onClick={() => setChosen("signup")}>Create an account</button>
                    </p>
                </div>
                }

                {chosen == 'signup' &&
                <div className="auth-signup flex snap-x snap-mandatory no-scrollbar" ref={registerPanel}>
                    <div className="register-panel min-w-full snap-center">
                        <div className="auth-form-inner">
                            <h1 className="auth-title">Create your space</h1>
                            <p className="auth-lede">A few details, then your first stack.</p>
                            <label className="auth-field" htmlFor="email">
                                <span className="auth-label">Email {requiredIcon}</span>
                                <input type="text" name="email" id="email" ref={email} autoComplete="email" />
                            </label>
                            <div className="auth-name-row">
                                <label className="auth-field" htmlFor="first-name">
                                    <span className="auth-label">First name {requiredIcon}</span>
                                    <input type="text" name="first_name" id="first-name" ref={firstName} autoComplete="given-name" />
                                </label>
                                <label className="auth-field" htmlFor="last-name">
                                    <span className="auth-label">Last name {requiredIcon}</span>
                                    <input type="text" name="last_name" id="last-name" ref={lastName} autoComplete="family-name" />
                                </label>
                            </div>
                            <label className="auth-field" htmlFor="birthday">
                                <span className="auth-label">Birthdate {requiredIcon}</span>
                                <input type="date" id="birthday" ref={birthday} />
                            </label>
                            <div className="auth-field">
                                <span>Gender</span>
                                <div className="auth-choice">
                                    <button type="button" aria-pressed={gender === "female"} onClick={() => setGender("female")}>Female</button>
                                    <button type="button" aria-pressed={gender === "male"} onClick={() => setGender("male")}>Male</button>
                                </div>
                            </div>
                            <button type="button" className="auth-cta" onClick={registerBtnClick}>Continue</button>
                            <p className="auth-switch">
                                Already studying?{" "}
                                <button type="button" onClick={() => setChosen("login")}>Log in</button>
                            </p>
                        </div>
                    </div>
                    <div className="register-panel min-w-full snap-center">
                        <div className="auth-form-inner">
                            <button type="button" className="auth-back" onClick={goBackBtn}>
                                <i className="bi bi-arrow-left"></i>
                                Back
                            </button>
                            <h1 className="auth-title">Check your inbox</h1>
                            <p className="auth-lede">Enter the 5-digit code we sent to {email.current?.value || "your email"}.</p>
                            <div className="auth-otp-row">
                                {codeInputs}
                            </div>
                            <p className="auth-switch" style={{textAlign: "center"}}>
                                <button type="button" className="auth-resend">Resend code</button>
                            </p>
                            <button type="button" className="auth-cta" onClick={verifyemail}>Verify email</button>
                        </div>
                    </div>
                    <div className="register-panel min-w-full snap-center">
                        <div className="auth-form-inner">
                            <button type="button" className="auth-back" onClick={goBackBtn}>
                                <i className="bi bi-arrow-left"></i>
                                Back
                            </button>
                            <h1 className="auth-title">Name your desk</h1>
                            <p className="auth-lede">This is how you will sign back in.</p>
                            <label className="auth-field" htmlFor="username">
                                <span className="auth-label">Username {requiredIcon}</span>
                                <input type="text" id="username" ref={username} autoComplete="username" onChange={(e) => setMyUsername(e.target.value)} />
                            </label>
                            <label className="auth-field" htmlFor="password">
                                <span className="auth-label">Password {requiredIcon}</span>
                                <div className="auth-pass-wrap">
                                    <input
                                        type={showSignupPass ? "text" : "password"}
                                        id="password"
                                        ref={origPassword}
                                        autoComplete="new-password"
                                        onChange={(e) => setInitialPass(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowSignupPass((prev) => !prev)}
                                        aria-label={showSignupPass ? "Hide password" : "Show password"}
                                    >
                                        <i className={showSignupPass ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                                    </button>
                                </div>
                            </label>
                            <label className="auth-field" htmlFor="confirm-password">
                                <span className="auth-label">Confirm password {requiredIcon}</span>
                                <input
                                    type={showSignupPass ? "text" : "password"}
                                    id="confirm-password"
                                    ref={reEnteredPassword}
                                    autoComplete="new-password"
                                    onChange={(e) => setFinalPass(e.target.value)}
                                />
                            </label>
                            <button type="button" className="auth-cta" onClick={completeAccountBtn}>Create account</button>
                        </div>
                    </div>
                </div>
                }
            </div>
            <AuthStage />
        </div>
    )
}

function AuthLockup({className = ""}: {className?: string}){
    return(
        <Link to="/" className={`auth-brand ${className}`.trim()}>
            <img src={notable_logo} alt="Notable" className="auth-logo" />
        </Link>
    )
}

function AuthTabs({chosen, onChoose}: {chosen: string | null, onChoose: (next: string) => void}){
    return(
        <div className="auth-tabs" role="tablist" aria-label="Account">
            <button type="button" role="tab" aria-current={chosen === "login" ? "page" : undefined} onClick={() => onChoose("login")}>Log in</button>
            <button type="button" role="tab" aria-current={chosen === "signup" ? "page" : undefined} onClick={() => onChoose("signup")}>Sign up</button>
        </div>
    )
}

function AuthStage(){
    return(
        <aside className="auth-stage">
            <div className="auth-stage-wave" aria-hidden="true"></div>
            <AuthLockup className="auth-brand-stage" />
            <div className="auth-stage-copy">
                <h2>Get ready for a brighter study session.</h2>
                <p>Make a stack, flip a card, and check yourself — one question at a time.</p>
            </div>
            <div className="auth-cluster" aria-hidden="true">
                <motion.article
                    className="auth-float"
                    initial={{opacity: 0, y: 22}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.55, ease: [0.16, 1, 0.3, 1]}}
                >
                    <div className="auth-float-top auth-float-mint"></div>
                    <div className="auth-float-pad">
                        <p style={{margin: 0, fontWeight: 700}}>Biology</p>
                        <p style={{margin: "0.3rem 0 0", fontSize: "0.82rem", color: "#5c5674"}}>12 cards</p>
                    </div>
                </motion.article>
                <motion.article
                    className="auth-float"
                    initial={{opacity: 0, y: 18}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1]}}
                >
                    <div className="auth-float-top auth-float-sky"></div>
                    <div className="auth-float-pad">
                        <p style={{margin: 0, fontWeight: 700}}>History</p>
                        <p style={{margin: "0.3rem 0 0", fontSize: "0.82rem", color: "#5c5674"}}>8 cards</p>
                    </div>
                </motion.article>
                <motion.article
                    className="auth-float"
                    initial={{opacity: 0, y: 18}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.55, delay: 0.14, ease: [0.16, 1, 0.3, 1]}}
                >
                    <div className="auth-float-top auth-float-peach"></div>
                    <div className="auth-float-pad">
                        <p style={{margin: 0, fontWeight: 700}}>Vocabulary</p>
                        <p style={{margin: "0.3rem 0 0", fontSize: "0.82rem", color: "#5c5674"}}>20 cards</p>
                    </div>
                </motion.article>
                <motion.article
                    className="auth-float"
                    initial={{opacity: 0, y: 18}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.55, delay: 0.2, ease: [0.16, 1, 0.3, 1]}}
                >
                    <div className="auth-float-top auth-float-lemon"></div>
                    <div className="auth-float-pad">
                        <p style={{margin: 0, fontWeight: 700}}>Formulas</p>
                        <p style={{margin: "0.3rem 0 0", fontSize: "0.82rem", color: "#5c5674"}}>15 cards</p>
                    </div>
                </motion.article>
            </div>
        </aside>
    )
}
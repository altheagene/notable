import type { Route } from "./+types/home";
import { useState, useEffect, useRef } from "react";
import {motion, AnimatePresence, } from 'framer-motion'
import { Link, useLoaderData } from "react-router";
import {API_URL} from '../config.js'


export async function loader({params, request} : Route.LoaderArgs){
    const {getUserId} = await import('../sessions.server')
    const user_id = await getUserId(request)
    const stack_id = params.stackid

    const response = await fetch(`${API_URL}/getstack`,
        {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json'
            },
            body: JSON.stringify({stack_id: stack_id, user_id: user_id})
        }
    )

    const jsonified = await response.json()
    const myStackInfo = {
        stack_title : jsonified[0].stack_title,
        stack_description: jsonified[0].stack_description,
        stack_id: stack_id,
        user_id: user_id
    }

    return myStackInfo
}

export default function CreateStack(){
    const card_stack = useLoaderData<typeof loader>()
    type Stack = {
        stack_title : string,
        stack_description : string
        stack_id : number,
        user_id : any
    }

    const colors = [
        {
            bg: '#FFACAC',
            border: '#D65555'
        },
        {
            bg: '#CBF3BB',
            border: '#6BAB52'
        },
        {
            bg: '#E1ABE8',
            border: '#AC4DB8'
        }
    ]

    const colorElements = colors.map((color) => {
        return(
            <div 
                onClick={() => editColor(color.bg, color.border)}
                style={{backgroundColor: color.bg, borderColor: color.border}}
                className="
                    border-2 h-[30px] w-[30px] rounded-[15px] cursor-pointer">

            </div>
        )
    })
    const [myStack, setMyStack] = useState<Stack>(
        {
            stack_title : card_stack.stack_title,
            stack_description: card_stack.stack_description,
            stack_id: card_stack.stack_id,
            user_id: card_stack.user_id
        }
    )
    const card = {
        card_id : 0,
        question: '',
        image: '',
        answer: ''
    }

    const [title, setTitle] = useState('Untitled Stack');
    const [description, setDescription] = useState('')
    const [tags, setTags] = useState<string[]>([]);
    const [questions, setQuestions] = useState<Object[]>([])
    const questionCards = questions.map((question, index) => {
        return(
            <motion.div layout
                key={index}
                initial={{opacity:0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
                id={index.toString()}
                className="
                    relative
                    min-w-full
                    md:min-w-[300px] lg:min-w-[300px] 
                    min-h-fit md:min-h-[400px] lg: min-h-[400px]
                    bg-[#ffffff] 
                    border-2 border-[#822b8d36] 
                    rounded-[6px] pt-[1rem]  pr-[1rem]  pl-[1rem]  pb-[2.5rem]
                    flex flex-col gap-[1.5rem]">
                <div className=" flex justify-center items-center h-[25px] w-[25px] rounded-[5px] font-semibold  bg-[#E1ABE8]">
                    <p>{index + 1}</p>
                </div>
                <label htmlFor="">Question 
                     {/* {index + 1} */}
                    <textarea 
                        value={question.question}
                        onChange={(e) => editQuestion(e.target.value, index, question.card_id)}
                        className="
                            p-[0.5rem]
                            rounded-[5px]
                            border border-[#27262641]
                            bg-[#f4f4f4]
                            block
                            w-[100%] h-[70px] md:h-[150px] lg:h-[150px]
                            mt-[0.5rem]"></textarea>
                </label>

                <label htmlFor="">Answer
                    <textarea 
                        value={question.answer}
                        onChange={(e) => editAnswer(e.target.value, index, question.card_id)}
                        className="
                            h-[70px]
                            p-[1rem]
                            rounded-[5px]
                            border border-[#27262641]
                            bg-[#f4f4f4]
                            block
                            w-[100%] h-[40px]
                            mt-[0.5rem]" />
                </label>
                <i 
                    className="
                        bi bi-trash
                        absolute bottom-[0.5rem] md:bottom-[1rem] lg:bottom-[1rem] right-[1.5rem] 
                        text-xl text-red-500 
                        hover:cursor-pointer"
                    onClick={() => deleteCard(index, question.card_id)}></i>
            </motion.div>
        )
    })

    const tagsElements = tags.map((tag, index) => {
        return(
            <div 
                onClick={(e) => {editTag(tag, index)}}
                className="
                    relative
                    pl-[1rem]
                    flex gap-[0.5rem] justify-between items-center
                    h-[35px] 
                    bg-[#F4F4F4] 
                    border border-dashed border-[#27262641] 
                    rounded-[20px]
                    text-sm
                    hover:border-[#822b8d7d] hover:border-2 hover:cursor-pointer hover:border-solid">
                {tag}
                <i 
                    onClick={(e) => {e.stopPropagation(); deleteTag(index)}}
                    className="
                        bi bi-x 
                        pr-[0.4rem]
                        text-lg 
                        hover:cursor-pointer hover:text-red-500 hover:font-semibold"
                    />
            </div>
        )
    })


    async function editColor(bgColor:string, borderColor:string){
        const response = await fetch(`${API_URL}/edit_color`,
            {
                method: 'POST',
                headers : {
                    'Content-Type' : 'application/json'
                },
                body: JSON.stringify({stack_id: card_stack.stack_id, bg_color: bgColor, border_color : borderColor})
            }
        )

        const result = await response.json()
    }
    
    async function addCard(){
        const response = await fetch(`${API_URL}/addcard`,
            {
                method: 'POST',
                headers : {
                    'Content-Type' : 'application/json'
                },
                body: JSON.stringify({stack_id : myStack.stack_id, user_id: myStack.user_id})
            }
        );

        const result = await response.json();
        const newCard = {...card, card_id: result.card_id}
        console.log(result)

        setQuestions(prev => [...prev , newCard])
    }

    let editTimeout = useRef<NodeJS.Timeout>(null)

    async function editAnswer(value:string, id:number, card_id:number){
        setQuestions(prev => prev.map((card, index) => index == id ? {...card, answer: value} : card))
        if(editTimeout.current)
            clearTimeout(editTimeout.current)

        editTimeout.current = setTimeout(async () => {
            const response = await fetch(`${API_URL}/editcard`,
            {
                    method: 'POST',
                    headers: {
                        'Content-Type' : 'application/json'
                    },
                    body: JSON.stringify({card_id: card_id, type: 'answer', value: value})
                }
            )

            const result = await response.json()
            console.log(result)
        }, 1000)

        return () => {
            if (editTimeout.current)
                clearTimeout(editTimeout.current)
        }
        // if(type === 'question')
        //     setQuestions(prev => prev.map((card, index) => index == id ? {...card, question: value} : card))
        // else if(type === 'answer')
        //     setQuestions(prev => prev.map((card, index) => index === id ? {...card, answer: value} : card))

    }

    async function editQuestion(value:string, id:number, card_id:number){
        setQuestions(prev => prev.map((card, index) => index == id ? {...card, question: value} : card))
        if(editTimeout.current)
            clearTimeout(editTimeout.current)

        editTimeout.current = setTimeout(async () => {
            const response = await fetch(`${API_URL}/editcard`,
            {
                    method: 'POST',
                    headers: {
                        'Content-Type' : 'application/json'
                    },
                    body: JSON.stringify({card_id: card_id, type: 'question', value: value})
                }
            )

            const result = await response.json()
            console.log(result)
        }, 1000)

        return () => {
            if (editTimeout.current)
                clearTimeout(editTimeout.current)
        }
        // if(type === 'question')
        //     setQuestions(prev => prev.map((card, index) => index == id ? {...card, question: value} : card))
        // else if(type === 'answer')
        //     setQuestions(prev => prev.map((card, index) => index === id ? {...card, answer: value} : card))

    }   

    async function deleteCard(id:number, card_id){
        const filtered = questions.filter((question,index) => index != id )
        setQuestions(filtered)

        const response = await fetch(`${API_URL}/deletecard` ,
            {
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json'
                },
                body: JSON.stringify({card_id: card_id})
            }
        )

        const result = await response.json()
    }

    function enterTag(value:string){
        if (value.trim() === '')
            return
        setTags(prev => [...prev, value])
        document.getElementById('tag-input').value = ''
    }

    function deleteTag(id:number){
        const filtered = tags.filter((tags, index) => index != id)
        setTags(filtered)
    }

    function editTag(tag:string, id:number){
        document.getElementById('tag-input').value = tag
        deleteTag(id)
    }

    function scrollToCard(id:number){
        document.getElementById(id.toString())?.scrollIntoView({
            behavior: 'smooth'
        })

        const colors = ['#F4AE30', '#f4af3084', '#F4AE30', '#F4AE3084']
        const element = document.getElementById(id.toString())
        colors.map((color,index) => {
            setTimeout(() => {
                element.style.borderWidth = '3px'
                element.style.borderColor =  color;
            }, index*500)
        })

        setTimeout(() => {
            element.style.borderWidth = '2px'
            document.getElementById(id.toString()).style.borderColor =  'rgba(130, 43, 141, 0.32)';
        }, 2000)
    }

    // --------------------USE EFFECTS--------------------------------
    // ===============================================================

    // let timeout;
    // useEffect(() => {
    //     clearTimeout(timeout)

    //     setTimeout(() => {
    //         //commit state changes to database
    //     }, 5000)
    // }, [questions])

    //update database when changes are made to title an description
    const stackTimeout = useRef<NodeJS.Timeout>(null);

    useEffect(() => {
        if(stackTimeout.current)
            clearTimeout(stackTimeout.current)
        
         stackTimeout.current = setTimeout(async () => {
            const response = await fetch(`${API_URL}/editstack`,
                {
                    method: 'POST',
                    headers: {
                        'Content-type' : 'application/json'
                    },
                    body: JSON.stringify({stack_id: myStack.stack_id, title : myStack.stack_title, description : myStack.stack_description})
                }
            )

            const jsonified = await response.json()
            console.log(jsonified)
        }, 3000)


        return () => {
            if(stackTimeout.current)
                clearTimeout(stackTimeout.current)
        }
    }, [myStack])

    //Get cards 
    useEffect(() => {
        async function getCards(){
            const response = await fetch(`${API_URL}/getcards`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type' : 'application/json'
                    },
                    body: JSON.stringify({stack_id : myStack.stack_id})
                }
            )

            const cards = await response.json()

            setQuestions(cards)
        }

        getCards()
    }, [])

    const editCardTimeout = useRef<NodeJS.Timeout>(null);

    // UPDATE CARDS
    // useEffect(() => {
    //     if(editCardTimeout.current){
    //         clearTimeout(editCardTimeout.current)
    //     }

    //     editCardTimeout.current = setTimeout(async () => {
    //          const response = await fetch(`${API_URL}/editcard`, 
    //             {
    //                 method: 'POST',
    //                 headers: {
    //                     'Content-Type' : 'application/json'
    //                 },
    //                 body: JSON.stringify(questions)
    //             }
    //         )

    //         const result = await response.json()
    //         console.log(result)
    //     })

    //     return () => {
    //         if(editCardTimeout.current){
    //             clearTimeout(editCardTimeout.current)
    //         }
    //     }

    // }, [questions])

    return(
        <div className="bg-[#f4f4f4] h-full text-[#272626] flex">
            <div className="
                hidden md:block lg:block
                w-[0px] md:w-[60px] lg:w-[60px] 
                h-[calc(100dvh-55px)]
                bg-[#ffffff] 
                border-r border-[#2726267b] 
                hover:cursor-pointer">
                {questions.map((question,index) => {
                    return(
                        <div
                            onClick={() => scrollToCard(index)}
                            className="
                                w-full h-[40px] border-b border-[#2726267b]
                                text-center font-semibold
                                flex justify-center items-center">
                            {index + 1}
                        </div>
                    )
                })}
            </div>
            <div className=" p-[1.5rem] lg:p-[2.5rem] w-full md:w-[calc(100vw-60px)] lg:w-[calc(100vw-60px)] relative overflow-y-auto">
                <p className="text-2xl font-semibold mb-[1rem]">{myStack.stack_title === '' ? 'Untitled Stack' : myStack.stack_title}</p>
                <div className="bg-[#FFFFFF] p-[1.5rem] min-h-[200px] border-2 border-[#822b8d36] rounded-[10px]">
                    <p className="font-medium text-lg">Stack Information</p>
                    <div className="mt-[1rem] flex flex-col gap-[1rem] md:flex-row lg:flex-row">
                        <input 
                            value={myStack.stack_title}
                            type="text" 
                            placeholder="Title" 
                            onChange={(e) => setMyStack( prev => ({...prev, stack_title : e.target.value }))}
                            className="
                                w-[100%]
                                h-[40px] md:w-[35%] lg:[35%] p-[0.5rem] 
                                bg-[#f4f4f4] 
                                rounded-[5px] 
                                border border-[#27262641]"/>
                        <input 
                            value={myStack.stack_description}
                            onChange={(e) => setMyStack( prev => ({...prev, stack_description : e.target.value }))}
                            id="description"
                            type="text" 
                            placeholder="Description" 
                            className="
                                w-[100%] md:w-[50%] lg:w-[50%]
                                h-[40px] p-[0.5rem] 
                                bg-[#f4f4f4] rounded-[5px] border border-[#27262641]"/>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center mt-[1rem]">
                        <div className=" flex-1">
                            <p className="font-semibold">Tags</p>
                            <div className="flex gap-[0.6rem] mt-[0.5rem] flex-col md:flex-row lg:flex-row">
                                <input

                                    id="tag-input"
                                    onKeyDown={(e) => e.key === 'Enter' && enterTag(e.target.value)}
                                    placeholder="Add Tag"
                                    className="
                                        p-[0.5rem]
                                        w-[100%] sm:w-[130px] md:w-[130px] lg:w-[130px] h-[35px] 
                                        bg-[#F4F4F4] 
                                        border border-[#27262641] 
                                        rounded-[10px]
                                        text-sm
                                        focus:outline-none">
                                </input>
                                <div className="flex gap-[0.5rem] flex-wrap">
                                    {tags.length > 0 ? tagsElements : ''}
                                </div>
                                {/* <button 
                                    className="
                                        w-[120px] h-[35px] 
                                        bg-[#F4F4F4] 
                                        border border-dashed border-[#27262641] 
                                        rounded-[20px]
                                        text-sm">
                                    Add Tag
                                </button> */}
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col ">
                            <p className="font-semibold">Colors</p>
                            <div className="flex gap-[1rem] items-center mt-[0.5rem]">
                                {colorElements}
                            </div>
                        </div>
                    </div>
                    
                </div>
                <div className="pt-[2rem] flex flex-wrap gap-[1.5rem]">
                    <AnimatePresence>
                        {questionCards}
                    </AnimatePresence>
                    <div
                        onClick={addCard}
                        className="
                            hover:cursor-pointer
                            font-semibold text-lg
                            relative
                            bg-[#822b8d36]
                            min-w-full
                            md:min-w-[300px] lg:min-w-[300px] 
                            min-h-fit md:min-h-[400px] lg: min-h-[400px]
                            border border-[#822B8D] 
                            rounded-[6px] p-[1rem]
                            flex gap-[0.5rem] justify-center items-center">
                        <i
                            className="bi bi-plus"/>
                            Add a Card
                    </div>
                </div>
                <div className="fixed bottom-[2rem]">
                    <button 
                        onClick={addCard}
                        className="
                            bg-[#f4af30c7]
                            w-[150px] h-[40px]
                            font-semibold
                            rounded-[20px]">Add a card</button> 
                   <Link 
                    to={`/main/quiz/${myStack.stack_id}`}
                    className="
                        w-[150px] h-[40px] 
                        bg-[#f4af30c7]">Study</Link>
                </div>
            </div>
        </div>
    )
}
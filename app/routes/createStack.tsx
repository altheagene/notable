import type { Route } from "./+types/home";
import { useState, useEffect, useRef } from "react";
import {motion, AnimatePresence } from 'framer-motion'
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
        },
        {
            bg: '#fffbff',
            border: '#eaeaea'
        },
        {
            bg: '#C2E2FA',
            border: '#31A1F5'
        }
    ]

    const tagInputRef = useRef<HTMLInputElement>(null)

    const colorElements = colors.map((color) => {
        return(
            <button
                type="button"
                key={color.bg}
                onClick={() => editColor(color.bg, color.border)}
                style={{backgroundColor: color.bg}}
                className="editor-swatch"
                aria-label={`Use stack color ${color.bg}`}
            />
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
    const [questions, setQuestions] = useState<any[]>([])
    const [selectedCard, setSelectedCard] = useState<number | null>(null)
    const [gleamCard, setGleamCard] = useState<number | null>(null)
    const questionCards = questions.map((question, index) => {
        return(
            <motion.article
                layout
                key={question.card_id ?? index}
                initial={{opacity:0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
                id={index.toString()}
                className={`editor-card${selectedCard === index ? " editor-card-chosen" : ""}${gleamCard === index ? " editor-card-gleam" : ""}`}
            >
                <div className="editor-card-head">
                    <p>{index + 1}</p>
                    <button
                        type="button"
                        className="editor-card-remove"
                        aria-label={`Delete card ${index + 1}`}
                        onClick={() => deleteCard(index, question.card_id)}
                    >
                        <i className="bi bi-trash" aria-hidden="true"></i>
                    </button>
                </div>
                <label className="editor-field">
                    Question
                    <textarea
                        value={question.question}
                        onChange={(e) => editQuestion(e.target.value, index, question.card_id)}
                    />
                </label>
                <label className="editor-field">
                    Answer
                    <textarea
                        value={question.answer}
                        onChange={(e) => editAnswer(e.target.value, index, question.card_id)}
                    />
                </label>
            </motion.article>
        )
    })

    const tagsElements = tags.map((tag, index) => {
        return(
            <button
                type="button"
                key={`${tag}-${index}`}
                onClick={() => editTag(tag, index)}
                className="editor-tag"
            >
                {tag}
                <i
                    className="bi bi-x-lg"
                    aria-label={`Remove ${tag}`}
                    onClick={(e) => {e.stopPropagation(); deleteTag(index)}}
                />
            </button>
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
        setTags(prev => [...prev, value.trim()])
        if (tagInputRef.current) tagInputRef.current.value = ''
    }

    function deleteTag(id:number){
        const filtered = tags.filter((tags, index) => index != id)
        setTags(filtered)
    }

    function editTag(tag:string, id:number){
        if (tagInputRef.current) tagInputRef.current.value = tag
        deleteTag(id)
    }

    function scrollToCard(id:number){
        const element = document.getElementById(id.toString())
        if(!element) return;
        element.style.scrollMarginTop = "80px";
        element.scrollIntoView({
            behavior: 'smooth'
        })
        setSelectedCard(id)
        setGleamCard(null)
        requestAnimationFrame(() => setGleamCard(id))
        window.setTimeout(() => {
            setGleamCard((current) => current === id ? null : current)
        }, 1900)
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
        <div className="editor">
            <aside className="editor-rail" aria-label="Jump to a card">
                {questions.map((question, index) => (
                    <button
                        type="button"
                        key={question.card_id ?? index}
                        aria-current={selectedCard === index}
                        onClick={() => scrollToCard(index)}
                    >
                        {index + 1}
                    </button>
                ))}
            </aside>
            <div className="editor-main">
                <header className="editor-head">
                    <div>
                        <h1>{myStack.stack_title === '' ? 'Create a stack' : 'Edit stack'}</h1>
                        <p>Saved · {questions.length} {questions.length === 1 ? 'card' : 'cards'}</p>
                    </div>
                    <Link className="editor-study" to={`/main/quiz/${myStack.stack_id}`}>Study</Link>
                </header>

                <label className="sr-only" htmlFor="editor-title">Stack title</label>
                <input
                    id="editor-title"
                    className="editor-title"
                    value={myStack.stack_title}
                    type="text"
                    placeholder="Title"
                    onChange={(e) => setMyStack( prev => ({...prev, stack_title : e.target.value }))}
                />
                <label className="sr-only" htmlFor="editor-description">Stack description</label>
                <input
                    id="editor-description"
                    className="editor-desc"
                    value={myStack.stack_description}
                    onChange={(e) => setMyStack( prev => ({...prev, stack_description : e.target.value }))}
                    type="text"
                    placeholder="Add a description"
                />

                <div className="editor-toolbar">
                    <div className="editor-tags">
                        <input
                            ref={tagInputRef}
                            onKeyDown={(e) => e.key === 'Enter' && enterTag((e.target as HTMLInputElement).value)}
                            placeholder="Add a tag"
                        />
                        {tagsElements}
                    </div>
                    <div className="editor-swatches" aria-label="Cover color">
                        {colorElements}
                    </div>
                </div>

                <section className="editor-deck" aria-label="Cards">
                    <AnimatePresence>
                        {questionCards}
                    </AnimatePresence>
                    <button type="button" className="editor-card-create" onClick={addCard}>
                        <span className="library-cover-plus" aria-hidden="true">
                            <i className="bi bi-plus-lg"></i>
                        </span>
                        Add a card
                    </button>
                </section>
            </div>
        </div>
    )
}
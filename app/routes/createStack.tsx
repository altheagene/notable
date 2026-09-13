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
        user_id: user_id,
        bg_color: jsonified[0].bg_color || '#C2E2FA',
        border_color: jsonified[0].border_color || '#31A1F5',
        cover_image: jsonified[0].cover_image || ''
    }

    return myStackInfo
}

export default function CreateStack(){
    const card_stack = useLoaderData<typeof loader>()
    type Stack = {
        stack_title : string,
        stack_description : string
        stack_id : number,
        user_id : any,
        bg_color: string,
        border_color: string,
        cover_image: string
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

    const [myStack, setMyStack] = useState<Stack>(
        {
            stack_title : card_stack.stack_title,
            stack_description: card_stack.stack_description,
            stack_id: card_stack.stack_id,
            user_id: card_stack.user_id,
            bg_color: card_stack.bg_color,
            border_color: card_stack.border_color,
            cover_image: card_stack.cover_image
        }
    )

    const colorElements = colors.map((color) => {
        const selected = !myStack.cover_image && myStack.bg_color === color.bg
        return(
            <button
                type="button"
                key={color.bg}
                onClick={() => editColor(color.bg, color.border)}
                style={{backgroundColor: color.bg}}
                className={`editor-swatch${selected ? " editor-swatch-on" : ""}`}
                aria-label={`Use stack color ${color.bg}`}
                aria-pressed={selected}
            />
        )
    })
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
    const [dragIndex, setDragIndex] = useState<number | null>(null)
    const [dropIndex, setDropIndex] = useState<number | null>(null)
    const questionCards = questions.map((question, index) => {
        return(
            <motion.article
                layout
                key={question.card_id ?? index}
                initial={{opacity:0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
                id={index.toString()}
                className={`editor-card${selectedCard === index ? " editor-card-chosen" : ""}${gleamCard === index ? " editor-card-gleam" : ""}${dragIndex === index ? " editor-card-dragging" : ""}${dropIndex === index && dragIndex !== index ? " editor-card-drop" : ""}`}
                onDragOver={(event) => {
                    if (dragIndex == null) return
                    event.preventDefault()
                    setDropIndex(index)
                }}
                onDrop={(event) => {
                    event.preventDefault()
                    moveCard(dragIndex, index)
                }}
                onDragLeave={() => {
                    setDropIndex((current) => current === index ? null : current)
                }}
            >
                <div className="editor-card-head">
                    <p>{index + 1}</p>
                    <div className="editor-card-tools">
                        <button
                            type="button"
                            className="editor-card-grip"
                            aria-label={`Reorder card ${index + 1}`}
                            draggable
                            onDragStart={(event) => {
                                setDragIndex(index)
                                event.dataTransfer.effectAllowed = "move"
                                event.dataTransfer.setData("text/plain", String(index))
                            }}
                            onDragEnd={() => {
                                setDragIndex(null)
                                setDropIndex(null)
                            }}
                        >
                            <span className="editor-card-grip-bars" aria-hidden="true"></span>
                        </button>
                        <button
                            type="button"
                            className="editor-card-remove"
                            aria-label={`Delete card ${index + 1}`}
                            onClick={() => deleteCard(index, question.card_id)}
                        >
                            <i className="bi bi-trash" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>
                <label className="editor-field">
                    Question
                    <textarea
                        value={question.question}
                        onChange={(e) => editQuestion(e.target.value, index, question.card_id)}
                    />
                </label>
                <div className="editor-photo">
                    {question.image ?
                        <>
                            <img src={question.image} alt="" />
                            <button
                                type="button"
                                className="editor-photo-remove"
                                onClick={() => removePhoto(index, question.card_id)}
                            >
                                Remove photo
                            </button>
                        </> :
                        <label className="editor-photo-add">
                            <i className="bi bi-image" aria-hidden="true"></i>
                            Add photo
                            <input
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) addPhoto(index, question.card_id, file)
                                    e.target.value = ""
                                }}
                            />
                        </label>}
                </div>
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
        setMyStack((prev) => ({...prev, bg_color: bgColor, border_color: borderColor, cover_image: ''}))
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

    async function persistCover(cover_image:string){
        setMyStack((prev) => ({...prev, cover_image}))
        await fetch(`${API_URL}/edit_cover`,
            {
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json'
                },
                body: JSON.stringify({stack_id: card_stack.stack_id, cover_image})
            }
        )
    }

    async function addCoverPhoto(file: File){
        try {
            const cover_image = await compressImage(file)
            await persistCover(cover_image)
        } catch {
            return
        }
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

    function persistOrder(next: any[]){
        fetch(`${API_URL}/reordercards`,
            {
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json'
                },
                body: JSON.stringify({
                    stack_id: myStack.stack_id,
                    card_ids: next.map((card) => card.card_id)
                })
            }
        )
    }

    function moveCard(from:number | null, to:number){
        if (from == null || from === to) {
            setDragIndex(null)
            setDropIndex(null)
            return
        }
        setQuestions((prev) => {
            const next = [...prev]
            const [moved] = next.splice(from, 1)
            next.splice(to, 0, moved)
            persistOrder(next)
            return next
        })
        setDragIndex(null)
        setDropIndex(null)
        setSelectedCard(to)
    }

    async function persistCardField(card_id:number, type:string, value:string){
        await fetch(`${API_URL}/editcard`,
            {
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json'
                },
                body: JSON.stringify({card_id: card_id, type: type, value: value})
            }
        )
    }

    function compressImage(file: File){
        return new Promise<string>((resolve, reject) => {
            const image = new Image()
            const url = URL.createObjectURL(file)
            image.onload = () => {
                const max = 900
                const scale = Math.min(1, max / Math.max(image.width, image.height))
                const canvas = document.createElement("canvas")
                canvas.width = Math.max(1, Math.round(image.width * scale))
                canvas.height = Math.max(1, Math.round(image.height * scale))
                const context = canvas.getContext("2d")
                if (!context) {
                    URL.revokeObjectURL(url)
                    reject(new Error("Could not read photo"))
                    return
                }
                context.drawImage(image, 0, 0, canvas.width, canvas.height)
                URL.revokeObjectURL(url)
                resolve(canvas.toDataURL("image/jpeg", 0.72))
            }
            image.onerror = () => {
                URL.revokeObjectURL(url)
                reject(new Error("Could not read photo"))
            }
            image.src = url
        })
    }

    async function addPhoto(index:number, card_id:number, file: File){
        try {
            const image = await compressImage(file)
            setQuestions(prev => prev.map((card, cardIndex) => cardIndex === index ? {...card, image} : card))
            await persistCardField(card_id, "image", image)
        } catch {
            return
        }
    }

    async function removePhoto(index:number, card_id:number){
        setQuestions(prev => prev.map((card, cardIndex) => cardIndex === index ? {...card, image: ""} : card))
        await persistCardField(card_id, "image", "")
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
                    <div
                        className="editor-cover"
                        style={myStack.cover_image
                            ? {backgroundImage: `url(${myStack.cover_image})`}
                            : {backgroundColor: myStack.bg_color}}
                        aria-hidden="true"
                    ></div>
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
                    <div className="editor-swatches" aria-label="Cover">
                        {colorElements}
                        <label className={`editor-cover-upload${myStack.cover_image ? " editor-swatch-on" : ""}`}>
                            {myStack.cover_image
                                ? <img src={myStack.cover_image} alt="" />
                                : <i className="bi bi-image" aria-hidden="true"></i>}
                            <span className="sr-only">Upload cover photo</span>
                            <input
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) addCoverPhoto(file)
                                    e.target.value = ""
                                }}
                            />
                        </label>
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
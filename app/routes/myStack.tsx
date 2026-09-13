import type { Route } from "./+types/home";
import { useState, useRef, useEffect } from "react"
import { Link , type ActionFunctionArgs, Form, useLoaderData, useNavigate, useOutletContext} from "react-router"
import {API_URL} from '../config.js'
import Generate from '../components/generating'


export async function loader({request} : Route.LoaderArgs){
    const {getUserId} = await import('../sessions.server.js')
    const user_id = await getUserId(request)
    // const fetchReq = await fetch(`${API_URL}/getfolders`,
    //     {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type' : 'application/json'
    //         },
    //         body: JSON.stringify({'user_id' : user_id})
    //     }
    // )

    // const response = await fetchReq.json()
    // console.log(response)
    return user_id
}

export async function action({request} : ActionFunctionArgs){
    const {getUserId} = await import('../sessions.server.js')
    const formData = await request.formData()
    const title = formData.get('title');
    const description = formData.get('description')
    const user_id = await getUserId(request);
    console.log(user_id)

    const tea = await fetch(`${API_URL}/createfolder`,
        {
            method: 'POST',
            headers: 
            {
                'Content-Type' : 'application/json'
            },
            body: JSON.stringify({user_id : user_id, folder_name : title, folder_description : description})
        }
    )

    const response = await tea.json()

    console.log("Create folder: ",  response)
}
export default function MyFlashcards(){
    const navigate = useNavigate()
    const user_id = useLoaderData<typeof loader>()
    const {searchQuery = ""} = useOutletContext<{searchQuery?: string}>() ?? {}
    const defaultColors = {
        bg_color: '#C2E2FA',
        border_color: '#31A1F5'
    }
    const [showModal, setShowModal] = useState<boolean>(false);
    const folderTitle = useRef(null);
    const folderDesc = useRef(null);
    const [folders, setFolders] = useState<any[]>()
    const [stacks, setStacks] = useState<any[]>()
    const aiPromptRef = useRef<HTMLInputElement>(null)
    const [isGenerating, setIsGenerating] = useState<boolean>(false)
    const [openMenuId, setOpenMenuId] = useState<number | null>(null)
    console.log(stacks)
    useEffect(() => {
        if (openMenuId == null) return
        function closeMenu(event: MouseEvent) {
            const target = event.target as Element | null
            if (target && !target.closest(".library-cover-menu")) {
                setOpenMenuId(null)
            }
        }
        function closeOnEscape(event: KeyboardEvent) {
            if (event.key === "Escape") setOpenMenuId(null)
        }
        document.addEventListener("mousedown", closeMenu)
        document.addEventListener("keydown", closeOnEscape)
        return () => {
            document.removeEventListener("mousedown", closeMenu)
            document.removeEventListener("keydown", closeOnEscape)
        }
    }, [openMenuId])
    useEffect(() => {
        async function getStacks (){
            const response = await fetch(`${API_URL}/getstacks`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type' : 'application/json'
                    },
                    body: JSON.stringify({user_id: user_id})
                }
            )

            const result = await response.json()
            setStacks(result)
        }

        getStacks()

        async function fetchFolders(){
            const fetchReq = await fetch(`${API_URL}/getfolders`,
            {
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json'
                },
                body: JSON.stringify({'user_id' : user_id})
            }
        ).then(res => res.json()).then(data => setFolders(data.response))
            
        }
        
        fetchFolders()
    }, [])

    // ==============================FUNCTIONS==================================

    async function deleteStack(stack_id:number, index:number){
        const response = await fetch(`${API_URL}/deletestack`, 
            {
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json'
                },
                body: JSON.stringify({user_id: user_id, stack_id:stack_id})
            }
        )

        const filtered = stacks?.filter((stack,stack_index) => stack_index!= index )
        setStacks(filtered)
    }

    const query = searchQuery.trim().toLowerCase()
    const visibleFolders = folders?.filter((folder) =>
        !query || String(folder.folder_name ?? "").toLowerCase().includes(query)
    )
    const visibleStacks = stacks?.filter((stack) =>
        !query || String(stack.stack_title ?? "").toLowerCase().includes(query)
    )

    const folderElements = visibleFolders?.map((folder, index) => {
        return(
            <article
                key={folder.folder_id ?? folder.folder_name}
                className={`library-folder library-folder-${["sky", "mint", "peach", "lemon"][index % 4]}`}
            >
                <div className="library-folder-tab" aria-hidden="true"></div>
                <div className="library-folder-body">
                    <h3>{folder.folder_name}</h3>
                </div>
            </article>
        )
    })

    const stackElements = visibleStacks?.map((stack, index) => {
        const originalIndex = stacks?.findIndex((item) => item.stack_id === stack.stack_id) ?? index
        return(
            <article key={stack.stack_id} className="library-cover library-cover-stack">
                <Link
                    className="library-cover-hit"
                    to={`/main/quiz/${stack.stack_id}`}
                    aria-label={`Study ${stack.stack_title || "Untitled stack"}`}
                >
                    <div
                        className="library-cover-plate"
                        style={stack.cover_image
                            ? {backgroundImage: `url(${stack.cover_image})`}
                            : {backgroundColor: stack.bg_color || "#c5e4f8"}}
                    ></div>
                    <div className="library-cover-body">
                        <h3>{stack.stack_title || "Untitled stack"}</h3>
                        <p>{stack.length} cards</p>
                    </div>
                </Link>
                <div className="library-cover-menu">
                    <button
                        type="button"
                        className="library-cover-kebab"
                        aria-label={`More actions for ${stack.stack_title || "Untitled stack"}`}
                        aria-expanded={openMenuId === stack.stack_id}
                        aria-haspopup="menu"
                        onClick={() => setOpenMenuId((current) => current === stack.stack_id ? null : stack.stack_id)}
                    >
                        <i className="bi bi-three-dots-vertical" aria-hidden="true"></i>
                    </button>
                    {openMenuId === stack.stack_id &&
                        <div className="library-cover-menu-list" role="menu">
                            <Link
                                role="menuitem"
                                to={`/main/mystack/${stack.stack_id}`}
                                onClick={() => setOpenMenuId(null)}
                            >
                                Edit
                            </Link>
                            <button
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                    setOpenMenuId(null)
                                    deleteStack(stack.stack_id, originalIndex)
                                }}
                            >
                                Delete
                            </button>
                        </div>}
                </div>
            </article>
        )
    })

    async function createFolder(){
        
        if(folderTitle.current){
            const postFunc = await fetch(`${API_URL}/createfolder`,
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type' : 'application/json'
                    },
                    body: JSON.stringify({'folder_name' : folderTitle.current.value.trim(), 'folder_description' : folderDesc.current.value.trim()})
                }
            )

            const response = await postFunc.json()
            console.log(response)
            }
    
    }

    async function createNewStack(){

        //query to create new stack
        const response = await fetch(`${API_URL}/createstack`,
            {
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json'
                },
                body: JSON.stringify({
                    user_id : user_id, 
                    stack_title: '', 
                    stack_description: '', 
                    bg_color: defaultColors.bg_color, 
                    border_color: defaultColors.border_color})
            }
        )

        const jsonified = await response.json()

        console.log(jsonified)

        navigate(`/main/mystack/${jsonified.id}`)
    }

    async function generateAIStack(){
        if(aiPromptRef.current) {
            const prompt = aiPromptRef.current.value

            //check if there is input in prompt
            if(prompt.trim().length <= 0){
                return;
            }
            setIsGenerating(true)
            try {
            const response = await fetch(`${API_URL}/api/ai`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type' : 'application/json'
                    },
                    body: JSON.stringify({prompt:prompt})
                }
            )

            const result = await response.json()
            const cards = result.response.cards;
            const stack_title = result.response.stackTitle;
            const stack_description = result.response.stackDescription;
            console.log(cards)

            const createStack = await fetch(`${API_URL}/createstack`,
                {
                    method : 'POST',
                    headers: {
                        'Content-Type' : 'application/json'
                    },
                    body: JSON.stringify({
                        user_id: user_id, 
                        stack_title: stack_title, 
                        stack_description: stack_description,
                        bg_color: defaultColors.bg_color, 
                        border_color: defaultColors.border_color})
                }
            )

            const createStackResponse = await createStack.json();
            const stack_id = createStackResponse.id;

            const createCards = await fetch(`${API_URL}/add_multiple_cards`,
                {
                    method : 'POST',
                    headers: {
                        'Content-Type' : 'application/json'
                    },
                    body: JSON.stringify({stack_id: stack_id, cards : cards})
                }
            )

            const createCardsResponse = await createCards.json()

            navigate(`/main/mystack/${stack_id}`)
            } catch {
                setIsGenerating(false)
            }
        }
    }

    const modalElement =
        <div className="library-modal" role="dialog" aria-labelledby="folder-dialog-title">
            <button type="button" className="library-modal-mask" onClick={() => setShowModal(false)} aria-label="Close"></button>
            <Form method="POST" className="library-modal-card">
                <h2 id="folder-dialog-title">New folder</h2>
                <label className="library-field">
                    Name
                    <input
                        name="title"
                        ref={folderTitle}
                        type="text"
                        placeholder="Biology notes"
                    />
                </label>
                <label className="library-field">
                    Description
                    <input
                        name="description"
                        ref={folderDesc}
                        type="text"
                        placeholder="Optional"
                    />
                </label>
                <div className="library-modal-actions">
                    <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit">Save</button>
                </div>
            </Form>
        </div>

    return(
        <div className="library">
            {isGenerating && <Generate />}
            {showModal && modalElement}
            <header className="library-hero">
                <div className="library-generator">
                    <h1 className="library-generator-title">
                        <i className="bi bi-stars" aria-hidden="true"></i>
                        Stack generator
                    </h1>
                    <p className="library-generator-lead">Get ready for a brighter study session.</p>
                    <p className="library-generator-hint">Open a stack below, or generate a new one.</p>
                    <div className="library-generator-row">
                        <label className="sr-only" htmlFor="library-topic">Topic to generate</label>
                        <input
                            id="library-topic"
                            ref={aiPromptRef}
                            placeholder="Try mitosis, Spanish verbs, or algebra"
                        />
                        <button type="button" onClick={generateAIStack}>
                            <i className="bi bi-stars" aria-hidden="true"></i>
                            Generate
                        </button>
                    </div>
                </div>
                <div className="library-wave" aria-hidden="true"></div>
            </header>

            <section className="library-shelf" aria-labelledby="library-folders-heading">
                <h2 id="library-folders-heading">My folders</h2>
                <div className="library-shelf-row">
                    <button type="button" className="library-folder library-folder-create" onClick={() => setShowModal(true)}>
                        <div className="library-folder-tab" aria-hidden="true"></div>
                        <div className="library-folder-body">
                            <span className="library-cover-plus" aria-hidden="true">
                                <i className="bi bi-plus-lg"></i>
                            </span>
                            <h3>New folder</h3>
                        </div>
                    </button>
                    {folderElements}
                    {visibleFolders?.length === 0 && query &&
                        <p className="library-empty">No folders match that search.</p>}
                </div>
            </section>

            <section className="library-shelf" aria-labelledby="library-stacks-heading">
                <h2 id="library-stacks-heading">My flashcards</h2>
                <div className="library-shelf-row">
                    <button type="button" className="library-cover library-cover-create" onClick={createNewStack}>
                        <span className="library-cover-plus" aria-hidden="true">
                            <i className="bi bi-plus-lg"></i>
                        </span>
                        <h3>New stack</h3>
                        <p>Start a blank deck</p>
                    </button>
                    {stackElements}
                    {visibleStacks?.length === 0 && query &&
                        <p className="library-empty">No stacks match that search.</p>}
                    {stacks?.length === 0 && !query &&
                        <p className="library-empty">Your first cover goes here — generate a topic or start empty.</p>}
                </div>
            </section>
        </div>
    )
}
import type { Route } from "./+types/home";
import { useState, useRef, useEffect } from "react"
import { Link , type ActionFunctionArgs, Form, useLoaderData, redirect, useNavigate} from "react-router"
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
    const [showModal, setShowModal] = useState<boolean>(false);
    const folderTitle = useRef(null);
    const folderDesc = useRef(null);
    const [folders, setFolders] = useState<any[]>()
    const [stacks, setStacks] = useState<any[]>()
    const aiPromptRef = useRef<HTMLInputElement>(null)
    const [isGenerating, setIsGenerating] = useState<boolean>(false)   

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

    const folderElements = folders?.map((folder) => {
        return(
            <div 
                className="
                    h-[150px] w-[300px] bg-[#BBE0EF] flex justify-center items-center rounded-[10px]
                ">
                {folder.folder_name}
            </div>
        )
    })

    const stackElements = stacks?.map((stack, index) => {
        return(
            
            <div 
                className="
                    h-[150px] w-[300px] bg-[#BBE0EF] flex justify-center items-center rounded-[10px] relative
                ">
                <h1>{stack.stack_title}</h1>
                <div className="flex gap-[2rem] absolute bottom-[1rem] right-[2rem]">
                     <Link to={`/main/quiz/${stack.stack_id}`}>
                        Study
                    </Link>
                    <button onClick={() => deleteStack(stack.stack_id, index)}>Delete</button>
                    <Link to={`/main/mystack/${stack.stack_id}`}>
                        Edit
                    </Link>
                </div>
            </div>
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
                body: JSON.stringify({user_id : user_id})
            }
        )

        const jsonified = await response.json()

        console.log(jsonified)

        navigate(`/main/mystack/${jsonified.id}`)
    }

    async function generateAIStack(){
        if(aiPromptRef.current) {
            setIsGenerating(true)
            const prompt = aiPromptRef.current.value
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
            const cards = result.response;
            console.log(cards)

            // const createStack = await fetch(`${API_URL}/createstack`,
            //     {
            //         method : 'POST',
            //         headers: {
            //             'Content-Type' : 'application/json'
            //         },
            //         body: JSON.stringify({user_id: user_id})
            //     }
            // )

            // const createStackResponse = await createStack.json();
            // const stack_id = createStackResponse.id;

            // const createCards = await fetch(`${API_URL}/add_multiple_cards`,
            //     {
            //         method : 'POST',
            //         headers: {
            //             'Content-Type' : 'application/json'
            //         },
            //         body: JSON.stringify({stack_id: stack_id, cards : cards})
            //     }
            // )

            // const createCardsResponse = await createCards.json()

            // navigate(`/main/mystack/${stack_id}`)

            
        }
    }

    const modalElement = 
                    <div className="
                        absolute top-0 left-0 
                        h-dvh w-dvw  
                        flex justify-center items-center">
                        <div className="
                            bg-[#0000003e] 
                            h-dvh w-dvw 
                            fixed z-3
                            flex flex-column"></div>
                        <Form 
                            method="POST"
                            className="
                                lg:w-[500px] lg:h-[250px] 
                                bg-white z-5 
                                rounded-[10px] overflow-hidden
                               ">
                            <div className="h-[50px] border-b  border-black-500">
                                Header
                            </div>
                            <div className="overflow-y-auto h-[calc(100%-100px)] p-[1rem]">
                                <label htmlFor="">Name 
                                    <input 
                                        name="title"
                                        ref={folderTitle}
                                        type="text" 
                                        placeholder="Enter name for your new folder"
                                        className="w-full mt-[0.5rem] h-[40px] p-[0.5rem]" />
                                </label>
                                <label htmlFor="">Description 
                                    <input 
                                        name="description"
                                        ref={folderDesc}
                                        type="text" 
                                        placeholder="Enter name for your new folder"
                                        className="w-full mt-[0.5rem] h-[40px] p-[0.5rem]" />
                                </label>
                            </div>
                            <div 
                                className="h-[50px] border-t  border-black-500">
                                <button 
                                    type="button"
                                    className="bg-gray-500 p-[0.5rem]"
                                    onClick={() => setShowModal(false)}>Cancel</button>
                                <button
                                    type="submit"
                                    
                                     className="bg-green-500 p-[0.5rem]"
                                    >Save</button>
                            </div>
                        </Form>
                    </div>

    return(
        <div>
            {isGenerating ? 
                <Generate /> :
                <div className="bg-[#f4f4f4] h-full p-[2rem] flex flex-col">
                    {showModal && modalElement}
                    <center>
                        <div className="
                            
                            flex flex-col items-center
                            max-w-[700px] w-full 
                            bg-[#C594CC] p-[2rem] 
                            text-center rounded-[20px] mb-[2rem]
                            my-shadow">
                            <p
                                className="text-2xl font-semibold mb-[0.5rem]">
                                    Let us create a stack for you!</p>
                            <p className="w-[80%]">Enter a topic in the text box below or drag and drop a document and 
                                we’ll generate a stack og cards for you to study.</p>
                            <div className="flex mt-[2rem] h-[45px] max-w-[400px] w-full bg-[#f4f4f4] rounded-[10px] relative items-center ">
                                <input 
                                    className="w-full h-full rounded-[10px] p-[0.5rem]"
                                    ref={aiPromptRef}></input>
                                <button
                                    onClick={generateAIStack}
                                    className="text-sm h-[80%] bg-[#C594CC] pr-[0.5rem] pl-[0.5rem] rounded-[5px] my-shadow absolute right-[1rem]"> Generate </button>
                            </div>
                        </div>
                    </center>
                    
                    <p className="text-[#272626] text-2xl font-semibold">My Folders</p>
                    <div className="mt-[2rem] flex gap-[0.5rem]">
                        <div 
                            onClick={() => setShowModal(true)}
                            className="
                            stack
                            h-[150px] w-[300px] 
                            rounded-[10px] 
                            bg-[#C2E2FA] 
                            border-2 border-[#31A1F5] 
                            flex justify-center items-center
                            hover:border-3">
                            <div
                                onClick={() => setShowModal(true)}
                                className="text-[#272626] text-lg font-medium">
                                <i className="bi bi-plus mr-[1rem]"></i>
                                Create Folder
                            </div>
                        </div>
                        {folderElements}
                    </div>
                    
                    <p className="text-[#272626] text-2xl font-semibold mt-[3.5rem]">My Flashcards</p>
                    <div className="mt-[2rem] flex flex-wrap gap-2" >
                        <div 
                            onClick={createNewStack}
                            className="
                            stack
                            h-[150px] w-[300px] 
                            rounded-[10px] 
                            bg-[#C2E2FA] 
                            border-2 border-[#31A1F5] 
                            flex justify-center items-center
                            hover:border-3">
                            <div
                                
                                className="text-[#272626] text-lg font-medium">
                                <i className="bi bi-plus mr-[1rem]"></i>
                                Create Stack
                            </div>
                        </div>
                        {stackElements}
                    </div>

                    
                </div>}
        </div>
        
    )
}
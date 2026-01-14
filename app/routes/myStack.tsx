import { Link } from "react-router"

export default function MyFlashcards(){
    return(
        <div className="bg-[#f4f4f4] h-full p-[2rem]">
            <p className="text-[#272626] text-2xl font-semibold">My Folders</p>
            <div className="mt-[2rem]">
                <Link 
                    to='/main/createstack'
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
                        Create Folder
                    </div>
                </Link>
            </div>
            
            <p className="text-[#272626] text-2xl font-semibold mt-[3.5rem]">My Flashcards</p>
            <div className="mt-[2rem]">
                <Link 
                    to='/main/createstack'
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
                </Link>
            </div>
        </div>
    )
}
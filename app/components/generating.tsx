import waiting from '../images/waiting.jpg'
import { AnimatePresence } from 'framer-motion'

export default function Generating(){
    return(
        <div className='
            w-dvw h-dvh p-[2rem]
            absolute top-0 right-0 bg-white 
            flex flex-col justify-center items-center' >
            <img src={waiting} className='h-[200px] w-auto'></img>
            <p className='text-3xl font-bold'>Generating...</p>
            <p className='mt-[1rem]'>Please wait as we are creating your stack for you!</p>
        </div>
    )
}
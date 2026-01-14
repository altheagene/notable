import { useState, useRef } from "react";
import { redirect,useNavigate } from "react-router";
import {motion} from 'framer-motion'
import clsx from 'clsx'

export default function QuizPage(){

    const cards = [
        {
            question: 'Who was the last queen of France before the French Revolution?',
            answer: 'Marie Antoinette'
        },
        {
            question: 'Who was the wife of King Akhenaten of Egypt?',
            answer: 'Nefertiti'
        },
        {
            question: 'Who was the architect who designed the Great Pyramid of Giza?',
            answer: 'Khufu'
        }
    ]

    const navigate = useNavigate();
    const [correct, setCorrect] = useState<number[]>([]);
    const [incorrect, setIncorrect] = useState<number[]>([]);
    const [currentCard, setCurrentCard] = useState<number>(1);

    const cardsContainer = useRef(null);

    const cardElements = cards.map(card => {
        const [isFlipped, setIsFlipped] = useState(false)
        return(
            <div className="min-w-full flex items-center justify-center snap-center perspective-1000">
                <motion.div
                animate={{rotateY: isFlipped ? 180 : 0}}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className=
                        "perspective-[1000px] transform-3d relative flex front lg:w-[50%] w-full h-[400px]  font-medium text-2xl text-[#272626]">

                    <motion.div 
                        onClick={() => setIsFlipped(prev => !prev)}
                        className=" 
                         p-[1.5rem] flex justify-center items-center p-[2rem] text-center 
                        backface-hidden cursor-pointer absolute min-w-full front min-h-full bg-[#f4f4f4] border-[1rem]  border-[#822b8d80] rounded-[5px]">
                        {card.question}
                    </motion.div>
                    <motion.div
                        onClick={() => setIsFlipped(prev => !prev)}
                        className="
                        p-[1.5rem] flex justify-center items-center p-[2rem] text-center 
                        backface-hidden rotate-y-180
                        cursor-pointer absolute min-w-full min-h-full bg-[#f4f4f4] border-[1rem]  border-[#822b8d80] rounded-[5px]
                        back">
                        {card.answer}
                    </motion.div>
                </motion.div>
            </div>
        )
    })

    

    function answerClick(answer:string){

        const container = cardsContainer.current
        container.scrollTo({
            left: container.scrollLeft + container.offsetWidth,
            behavior: 'smooth'
        })

        if(answer == 'correct')
            setCorrect(prev => [...prev, currentCard ])
        else if(answer =='incorrect') 
            setIncorrect(prev => [...prev, currentCard])

        if(currentCard < cards.length){
            setCurrentCard(prev => prev + 1)
        }else if(currentCard >= cards.length){
            navigate('/main/mystack')
        }
    }
    
    console.log(correct)
    console.log(incorrect)

    return(
        <div
            className="
                bg-[#522258] h-full p-[1rem]">
            <p  
                className="
                    text-2xl font-semibold text-[#f4f4f4]
                    lg:ml-[5rem] lg:pt-[3rem]">Egyptology(Ptolemaic Era)</p>
            <div className="mt-[2rem] w-full flex overflow-x-hidden no-scrollbar snap-x snap-mandatory"  ref={cardsContainer}>
                {cardElements}
            </div>
            <div className="flex text-white justify-center items-center gap-[1.5rem] mt-[1rem]">
                <button 
                    onClick={() => answerClick('incorrect')}
                    className="
                        border-[#D65555] border-4 w-[130px]
                        text-[#D65555]  
                        h-[50px] rounded-[25px] 
                        bg-white
                        font-semibold
                        hover:bg-[#D65555] hover:text-white">Incorrect</button>
                <p> {currentCard} / {cards.length} </p>
                <button 
                    onClick={() => answerClick('correct')}
                    className="
                        border-[#6BAB52] border-4
                        text-[#6BAB52] 
                        w-[130px] h-[50px] 
                        rounded-[25px] 
                        bg-white
                        font-semibold
                        hover:bg-[#6BAB52] hover:text-white">Correct</button>
            </div>
        </div>
    )
    
}

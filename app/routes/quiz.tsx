import type {Route} from './+types/home'
import { useState, useRef, useEffect, use } from "react";
import { redirect,useFetcher,useLoaderData,useNavigate, useParams, type ActionFunctionArgs } from "react-router";
import {AnimatePresence, motion} from 'framer-motion'
import {API_URL} from '../config.js'
import '../app.css';

export async function loader({request, params} : Route.LoaderArgs){
    const {getUserId} = await import('../sessions.server')
    const user_id = await getUserId(request)

    const response = await fetch(`${API_URL}/studystack`, 
        {
            method: 'POST',
            headers: 
            {
                'Content-Type' : 'application/json'
            },
            body: JSON.stringify({stack_id : params.stackid})
        }
    )

    const result = await response.json()

    return result
        

}

export async function action({request} : ActionFunctionArgs){
    const {commitSession, getSession} = await import('../sessions.server')
    const session = await getSession(request.headers.get('Cookie'))
    const formData = await request.formData()
    session.set('results', JSON.parse(formData.get('results') as string))

    return redirect('/main/quiz/results', {
        headers: {
            'Set-Cookie'  : await commitSession(session)
        }
    })
}

export default function QuizPage(){
    const params = useParams();
    const stackId = params.stackid
    const stack = useLoaderData<typeof loader>()
    console.log(stack)
    const [cards, setCards] = useState<Object[]>(stack.cards);
    const [correct, setCorrect] = useState<number>(0);
    const [incorrect, setIncorrect] = useState<number>(0);
    const [currentCard, setCurrentCard] = useState<number>(0);
    const cardsContainer = useRef(null);
    const [rightAns, setRightAns] = useState<any>()
    const [exit, setExit] = useState<any>('100vw')
    const [enter, setEnter] = useState<any>('100vw')
    const [direction, setDirection] = useState<Object>({
        enter: '',
        exit: ''
    })
    const [myCard, setMyCard] = useState(cards[currentCard])
    const [track, setTrack] = useState<boolean>(true)
    const [answerTrack, setAnswerTrack] = useState<boolean[]>([])
    const [completed, setCompleted] = useState<boolean>(false)
    const fetcher = useFetcher()
    
    function setResults(){
        

    }

    function flipIt(){
        setMyCard(prev => ({...prev, isFlipped: !prev.isFlipped}))
    }

    function answerClick(answer: string) {

        if (answer == 'correct') {
            setRightAns(500)
            setCorrect(prev => prev + 1)
            setAnswerTrack(prev => [...prev, true])
        } else {
            setRightAns(-500)
            setIncorrect(prev => prev + 1)
            setAnswerTrack(prev => [...prev, false])
        }

        if(currentCard < cards.length - 1)
            setCurrentCard(prev => prev + 1)
    }

    function nextClick(){
        if( currentCard != cards.length - 1){
            setExit('-100vw')
            setEnter('100vw')
            setCurrentCard(prev => prev + 1)
            return
        }

        setCompleted(true)

    }
    
    function prevClick(){
        if(currentCard != 0){
            setExit('100vw')
            setEnter('-100vw')
            setCurrentCard(prev => prev - 1)
        }
    }

    function trackProgress(){
        
       if(answerTrack.length != currentCard){
            //this section sets the untracked cards to correctly answered
            const arr = Array(currentCard - answerTrack.length).fill(true)
            setAnswerTrack(prev => [...prev, ...arr])
            setCorrect(currentCard)
        }

        setTrack(prev => !prev)
    }

    function undo(){
        if(answerTrack.length == 0)
            return

        const last = answerTrack[answerTrack.length-1]
        if(last){
            setCorrect(prev => prev - 1)
        }else{
            setIncorrect(prev => prev - 1)
        }

        setCurrentCard(prev => prev - 1)
        setAnswerTrack(prev =>prev.slice(0, -1))
    }

    console.log(answerTrack)
    
    useEffect(() => {
        console.log(stack.stack_details.stack_id)
        //checks if user is done answering 
        if(answerTrack.length == cards.length){
            const results = {
            tracked: track,
            answerTrack: answerTrack,
            cards: cards,
            title: stack.stack_details.stack_title,
            stackId: stackId
        }

        fetcher.submit(
            {results : JSON.stringify(results)},
            {method: 'post'}
        )

            return
        }
    }, [answerTrack])

    useEffect(() => {
        if(currentCard < cards.length)
            setMyCard(cards[currentCard])
    }, [currentCard])

    useEffect(() => {
        const newCards = cards.map(card => ({...card, isFlipped: false}))
        setCards(newCards)
    }, [])
    

    return(
        <div
            className="
                bg-[#522258] min-h-screen p-[1rem] w-full overflow-x-hidden">
            <p  
                className="text-xl sm:text-2xl font-semibold text-[#f4f4f4] text-center lg:text-left lg:ml-[5rem] lg:pt-[3rem]">
                {stack.stack_details.stack_title}
            </p>
            {completed && track ? 
            <TrackResultsModal cards={cards} answers={answerTrack} correct={correct} incorrect={incorrect}/> : completed && !track ?
            <NonTrackResults total={cards.length} />:
            <div 
                className="mt-[2rem] w-full min-h-[440px] 
                flex flex-col justify-center items-center 
                no-scrollbar snap-x snap-mandatory relative gap-[1rem]"
                ref={cardsContainer}>

                {track &&
                    <div className='flex justify-between max-w-[700px] w-full font-semibold text-white'>
                        <div className='text-[white] flex gap-[0.5rem] items-center'>
                            <div className=' flex items-center justify-center bg-[#D65555]   w-[40px] h-[40px] rounded-[20px]'>{incorrect}</div>
                            <p className=''>Incorrect</p>
                        </div>
                       <div className='text-[white] flex gap-[0.5rem] items-center'>
                            <p>Correct</p>
                            <div className='flex items-center justify-center  bg-[#6BAB52]   w-[40px] h-[40px] rounded-[20px]'>{correct}</div>
                        </div>
                    </div>
                }    
                <div className=' max-w-[700px] w-full min-h-[500px] sm:min-h-[400px] relative'>
                    <AnimatePresence mode='sync' >
                        { track ? 
                            <motion.div
                            key={myCard.card_id}
                            
                            initial={{opacity:1}}
                            animate={{ opacity: 1}}
                            exit={{x : rightAns , opacity: 0}}
                            transition={{duration : 0.3, ease: 'easeIn'}}
                            className="
                                w-full 
                                flex items-center justify-center 
                                snap-center 
                                perspective-1000   
                                bg-[#522258] absolute">
                            <motion.div
                                animate={{rotateY: myCard.isFlipped ? 180 : 0}}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                                className="perspective-[1000px] transform-3d relative flex front w-full  
                                    min-w-[30] w-full min-h-[500px] sm:min-h-[400px]  font-medium text-lg text-[#272626]">

                                <motion.div 
                                    onClick={() => flipIt(myCard.card_id)}
                                    className=" 
                                    p-[1.5rem] flex justify-center items-center sm:p-[2rem] text-center 
                                    backface-hidden cursor-pointer absolute 
                                    min-w-full front min-h-full 
                                    bg-[#f4f4f4] border-[1rem]  border-[#822b8d80] rounded-[10px]">
                                    {myCard.question}
                                </motion.div>
                                <motion.div
                                    onClick={() => flipIt(myCard.card_id)}
                                    className="
                                    p-[1.5rem] flex justify-center items-center sm:p-[2rem] text-center 
                                    backface-hidden rotate-y-180
                                    cursor-pointer absolute 
                                    min-w-full min-h-full bg-[#f4f4f4] 
                                    border-[1rem]  border-[#822b8d80] rounded-[10px]
                                    back">
                                    {myCard.answer}
                                </motion.div>
                            </motion.div>
                        </motion.div> :

                        <motion.div 
                            className='h-full w-full  perspective-1000 absolute'
                            key={myCard.card_id}
                            onClick={flipIt}
                            initial={{opacity: 0, x: enter}}
                            animate={{x:0, opacity: 1}}
                            exit={{x: exit, opacity: 0}}
                            transition={{duration: 0.3}}
                            >
                            <motion.div 
                                className='w-full h-full transform-3d perspective-1000'
                                animate={{rotateY: myCard.isFlipped ? 180 : 0}}
                                transition={{duration: 0.3}}
                                >
                                <motion.div 
                                    className='card front backface-hidden'>{myCard.question}</motion.div>
                                <motion.div 
                                    className='card back backface-hidden rotate-y-180'>{myCard.answer}</motion.div>
                            </motion.div>
                        </motion.div>

                        }
                        
                    </AnimatePresence>
                </div>
                <div className="flex flex-wrap sm:flex-nowrap text-white justify-center items-center gap-[1.5rem] mt-[1rem] w-full max-w-[700px] relative">
                    <div className='flex items-center justify-center sm:absolute sm:left-0 gap-[0.5rem]'>
                        <p>Track Progress</p>
                        <div className='w-[45px] h-[16px] rounded-[10px] bg-white relative hover:cursor-pointer'
                            onClick={() => trackProgress()}>
                            <div 
                                style={{backgroundColor: track ? 'skyblue' : 'gray', right : track ? 0 : 20}}
                                className='h-[25px] w-[25px] rounded-[15px] bg-black absolute top-[-5px]'>

                            </div>
                        </div>
                    </div>
                    <div className='flex gap-[1rem] items-center'>
                    {track ?

                    <button 
                        type='button'
                        onClick={() => answerClick('incorrect')}
                        className="
                            border-[#D65555] border-4 
                            quiz-nav-btn bg-white text-[#D65555]
                            hover:bg-[#D65555] hover:text-white"><i className='bi bi-x'></i></button> :
                    <button 
                        type='button'
                        onClick={() => prevClick()}
                        className="
                            border-[gray] border-4
                             quiz-nav-btn bg-white text-[gray]
                            hover:bg-[gray] hover:text-white"><i className='bi bi-arrow-left'></i></button>

                    }
                    
                    <p> {currentCard + 1} / {stack.cards.length} </p>
                    {track ? 
                    <button 
                        type='button'
                        onClick={() => answerClick('correct')}
                        className="
                            border-[#6BAB52] border-4
                            quiz-nav-btn bg-white text-[#6BAB52]
                            hover:bg-[#6BAB52] hover:text-white"><i className='bi bi-check-lg'></i></button> :
                    <button 
                        type='button'
                        onClick={() => nextClick()}
                        className="
                            border-[gray] border-4
                             quiz-nav-btn bg-white text-[gray]
                             hover:bg-[gray]
                             "><i className='bi bi-arrow-right'></i></button>

                    }
                    </div>
                    {
                        track &&
                        <div 
                            className='sm:absolute sm:right-3 text-xl'
                            onClick={() => undo()}>
                            <button>
                                <i className='bi bi-arrow-90deg-left'></i>
                            </button>
                        </div>
                    }
                    
                    
                </div>
            </div>
            }
        </div>
    )
    
}

function NonTrackResults(props:any){
    const totalCards = props.total

    return(
        <div className='w-full p-[1rem] bg-white flex flex-col gap-[2rem] rounded-[10px]'>
            <p className='text-2xl font-semibold'>Congratulations! You have reviewed all cards</p>
            <div className='flex gap-[1rem]'>
                <div>
                    <p>Total Cards</p>
                    <p className='text-4xl font-semibold'>{totalCards}</p>
                </div>
                <div>
                    <div>Time Taken</div>
                    <div className='text-4xl font-semibold'>15:08 </div>
                </div>
            </div>
            <div className='flex gap-[1rem]'>
                <button 
                    className='w-[150px] h-[40px] border rounded-[10px]'
                    onClick={() => window.location.reload()}>Retake</button>
                <button className='w-[150px] h-[40px] border rounded-[10px]'>Exit</button>
            </div>
        </div>
    )
}

function TrackResultsModal(props:any){
    const correct = props.correct;
    const incorrect = props.incorrect;
    const cards = props.cards
    const answerTrack = props.answers

    const cardElements = cards.map((card, index) => {
        return(
            <div className='w-[300px] bg-white rounded-[10px] overflow-hidden'>
                <div className='h-[30px]' style={{backgroundColor: answerTrack[index] ? '#6BAB52' : '#D65555'}}>

                </div>
                <div className='p-[1rem] flex flex-col gap-[1rem]'>
                    <div className='h-[100px]'>{card.question}</div>
                    <div>Answer:
                        <div className='p-[1rem] bg-[#D9D9D9] rounded-[5px]'>
                            <p>{card.answer}</p>
                        </div>
                    </div>
                    
                </div>
            </div>
        )
    })
    
    return(
        <div>
            <div>
                <p>{correct} out of {cards.length}</p>
                <div>
                    <button>Retake</button>
                    <button>Exit</button>
                </div>
            </div>
            <div className='flex gap-[1rem] flex-wrap justify-evenly'>
                {cardElements}
            </div>
        </div>
    )
}

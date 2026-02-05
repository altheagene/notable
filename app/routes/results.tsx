import { useLoaderData } from 'react-router';
import type {Route} from './+types/home'
import { Link } from 'react-router';

type Results = {
    cards: object[],
    tracked: boolean,
    answerTrack: boolean[],
    title : string,
    stackId: number

}

type ResultData = {
    cards : object[],
    answerTrack: boolean[]
    title : string,
    stackId: number

}

export async function loader({request} : Route.LoaderArgs){
    const  {getUserId, getSession} = await import('../sessions.server')
    const session = await getSession(request.headers.get('Cookie'))

    const results = session.get('results')
    return results;
}

export default function ResultsPage(){
    const results = useLoaderData<Results>()
    const cards = results.cards;
    const tracked = results.tracked;
    const answerTrack = results.answerTrack;
    const title = results.title
    const stackId = results.stackId


    return(
        <div className='bg-[#f4f4f4] min-h-screen'>
            <TrackedResult cards={cards} answerTrack={answerTrack} title={title} stackId={stackId}/>
        </div>
        
    )
}

function TrackedResult({cards, answerTrack, title, stackId} : ResultData){
    const correct = answerTrack.filter(ans => ans).length
    const incorrect = answerTrack.length - correct;

    const cardElements = cards.map((card, index) => {
        return(
            <div className='w-full max-w-[330px] h-[300px] border border-[#822B8D] rounded-[15px] overflow-hidden bg-white'>
                <div 
                    className='h-[20px]'
                    style={{backgroundColor: answerTrack[index] ? '#6BAB52' : '#D65555'}}></div>
                <div className='p-[1rem] h-[280px] flex flex-col justify-between'>
                    <p className='mt-[1rem]'>{card.question}</p>
                    <div className=' 
                        bg-[#F5F5F5] h-[100px]
                        border-2 border-[#D9D9D9] 
                        p-[0.8rem] rounded-[10px]
                        text-sm'>
                        <p className='mb-[0.5rem]'>Answer :</p>
                        <p>{card.answer}</p>
                    </div>
                </div>
            </div>
        )
    })

    return(
        <div className='flex flex-col items-center p-[2rem] gap-[2rem]'>
            <div className='
                bg-white
                max-w-[700px] w-full min-h-[230px] 
                border-2 border-[#C594CC]
                p-[1.5rem] sm:pt-[2rem] sm:pl-[3rem] rounded-[30px] my-shadow
                relative flex flex-col gap-[1.5rem]'>
                <p className='text-2xl font-bold text-[#272626]'>{title}</p>
                <div>
                    <div>
                        <p className='text-sm'>Total Score</p>
                        <p className='text-xl'><span className='font-semibold text-2xl'>{correct} </span>out of {cards.length}</p>
                    </div>
                </div>
                <Link 
                    className=' flex justify-center items-center h-[35px] w-[120px] bg-[#C594CC] font-medium rounded-[10px] my-shadow sm:absolute sm:bottom-[2rem] sm:right-[2rem]'
                    to={`/main/quiz/${stackId}`}
                    >
                        <i className='bi bi-arrow-clockwise'></i>Retake</Link>
            </div>

            <div className='flex flex-wrap gap-[1.7rem] justify-center'>
                {cardElements}
            </div>
        </div>
    )
}
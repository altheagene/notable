
import { useState, useEffect, useRef } from "react";
import {motion, AnimatePresence} from 'framer-motion'
import { index } from "@react-router/dev/routes";

export default function CreateStack(){

    const card = {
        question: '',
        image: '',
        answer: ''
    }

    const [title, setTitle] = useState('Untitled Stack');
    const [tags, setTags] = useState<string[]>([]);
    const [questions, setQuestions] = useState<Object[]>([card])
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
                <label htmlFor="">Question  {index + 1}
                    <textarea 
                        value={question.question}
                        onChange={(e) => editCard(e.target.value, index, 'question')}
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
                    onClick={() => deleteCard(index)}></i>
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

    function addCard(){
        setQuestions(prev => [...prev , card])
    }

    function editCard(value:string, id:number, type:string){

        if(type === 'question')
            setQuestions(prev => prev.map((card, index) => index == id ? {...card, question: value} : card))
        else if(type === 'answer')
            setQuestions(prev => prev.map((card, index) => index === id ? {...card, answer: value} : card))
    }

    function deleteCard(id:number){
        const filtered = questions.filter((question,index) => index != id )
        setQuestions(filtered)
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
                <p className="text-2xl font-semibold mb-[1rem]">{title}</p>
                <div className="bg-[#FFFFFF] p-[1.5rem] min-h-[200px] border-2 border-[#822b8d36] rounded-[10px]">
                    <p className="font-medium text-lg">Stack Information</p>
                    <div className="mt-[1rem] flex flex-col gap-[1rem] md:flex-row lg:flex-row">
                        <input 
                            type="text" 
                            placeholder="Title" 
                            onChange={(e) => setTitle(e.target.value === '' ? 'Untitled Stack' : e.target.value)}
                            className="
                                w-[100%]
                                h-[40px] md:w-[35%] lg:[35%] p-[0.5rem] 
                                bg-[#f4f4f4] 
                                rounded-[5px] 
                                border border-[#27262641]"/>
                        <input 
                            id="description"
                            type="text" 
                            placeholder="Description" 
                            className="
                                w-[100%] md:w-[50%] lg:w-[50%]
                                h-[40px] p-[0.5rem] 
                                bg-[#f4f4f4] rounded-[5px] border border-[#27262641]"/>
                    </div>
                    <div className="mt-[1rem]">
                        <p className="font-semibold">Tags</p>
                        <div className="flex gap-[0.6rem] pt-[0.5rem] flex-col md:flex-row lg:flex-row">
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
                <div>
                    <button 
                        onClick={addCard}
                        className="
                            fixed bottom-[2rem]
                            bg-[#f4af30c7]
                            w-[150px] h-[40px]
                            font-semibold
                            rounded-[20px]">Add a card</button>    
                </div>
            </div>
        </div>
    )
}
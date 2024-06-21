import { useState } from 'react';
import addIcon from '../images/addIcon.svg';
import QuizForm from './QuizForm';
import { Outlet } from 'react-router-dom'
function AllQuiz({ myquiz, setmyquiz, showForm, setshowForm }) {
    return (
        <div className='h-full p-2'>
            {
                (showForm) ? <div className='z-30 absolute h-full top-0 bottom-0 left-0 right-0 flex items-center justify-center bg-black bg-opacity-70'><QuizForm myquiz={myquiz} setmyquiz={setmyquiz} showForm={showForm} setshowForm={setshowForm} /></div> : <></>
            }
            <div>
                <Outlet />
            </div>
            <div className='absolute bottom-10 right-10'>
                <div className='bg-black z-10 h-[50px] w-[50px] p-2 flex items-center rounded-full hover:cursor-pointer' onClick={() => setshowForm(1)}><img src={addIcon} className='w-3/4 h-3/4 m-auto' alt="add-icon" /></div>
            </div>
        </div>
    )
}
export default AllQuiz;
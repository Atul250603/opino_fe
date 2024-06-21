import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import closeIcon from '../images/closeIcon.svg'
import leftArrow from '../images/leftArrow.svg'
import rightArrow from '../images/rightArrow.svg'
function AttemptedQuiz() {
    const [quiz, setquiz] = useState(null);
    const [dispmsg, setdispmsg] = useState("Loading...");
    const [showForm, setshowForm] = useState(false);
    const [idx, setidx] = useState(0);
    const [questidx, setquestidx] = useState(0);
    const navigate = useNavigate();
    useEffect(() => {
        async function init() {
            try {
                if (!localStorage.getItem('authToken')) {
                    navigate('/login');
                    return;
                }
                const resp = await fetch('http://localhost:5000/quiz/attempted', {
                    method: "post",
                    mode: "cors",
                    headers: {
                        "Content-Type": "application/json",
                        "authToken": localStorage.getItem('authToken')
                    }
                })

                const msg = await resp.json();
                if (msg && msg.success) {
                    toast.success(msg.success);
                    setquiz(msg.quizzes);
                    setdispmsg("No Attempted Quiz Yet...")
                }
                else if (msg && msg.error) {
                    throw msg.error;
                }
                else {
                    throw "Some Error Occured";
                }
            }
            catch (error) {
                toast.error(error);
                setdispmsg("No Attempted Quiz Yet...")
            }
        }
        init();
    }, [])
    function close() {
        setquestidx(0);
        setshowForm(false);
    }
    return (
        <div className="h-full w-full p-2">
            <div>
                {
                    (quiz) ? <div>
                        {
                            quiz.map((element, idx) => <div className="flex gap-2 my-3 justify-between bg-black p-3" style={{ boxShadow: "3px 3px 0px 1px grey" }}>
                                <div className="flex items-center gap-4 text-white">
                                    <div className="text-2xl font-bold">{element.quizId.quizname}</div>
                                    <div className="font-bold">{element.quizId.time} Hr Long</div>
                                </div>
                                <div><button className="font-bold bg-white p-2 px-3" onClick={() => { setidx(idx); setshowForm(true); }}>Show Result</button></div>
                            </div>)
                        }
                    </div> : <div className="w-full h-full flex justify-center items-center"><div className="font-bold text-2xl">{dispmsg}</div></div>
                }
            </div>
            {
                (showForm) ? <div className='z-30 absolute h-full top-0 bottom-0 left-0 right-0  bg-black bg-opacity-70'>
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="bg-slate-300 p-3 h-[90%] w-[80%] flex flex-col rounded overflow-y-auto">
                            <div className="w-full flex justify-end"><div className="w-[30px] h-[30px] bg-black p-1 rounded-full hover:cursor-pointer" onClick={() => close()}><img src={closeIcon} className="w-full h-full" alt="close-icon" /></div></div>
                            <div>
                                <div className="text-2xl font-bold text-center mb-4"><span className="bg-white p-2 rounded">Result Of {quiz[idx].quizId.quizname}</span></div>
                                <div className="flex justify-center my-2 gap-4 font-bold">
                                    <div>Marks Achieved : {quiz[idx].submissions.marks}</div>
                                </div>
                                <div>
                                    <div className="w-full flex items-center justify-center">
                                        <div className="w-[10%] flex justify-center">
                                            <button className="w-[50px] h-[50px] disabled:cursor-not-allowed disabled:opacity-50" disabled={(questidx === 0 ? true : false)} onClick={() => setquestidx((prev) => prev - 1)}>
                                                <img src={leftArrow} className="w-full h-full" alt="left-arrow" />
                                            </button>
                                        </div>
                                        <div className="w-[80%] w-full bg-gray-600 p-2 flex justify-center items-center relative my-4">
                                            <div className="w-[70%]">

                                                <div className="text-xl font-semibold text-center text-white mt-3 py-2"><span className="bg-white text-black p-1 rounded">Question {questidx + 1}</span></div>
                                                <div className="text-white text-xl font-bold break-all">
                                                    {quiz[idx].quizId.questions[questidx].question}
                                                </div>
                                                <div className="flex flex-col items-center mb-3">
                                                    {
                                                        quiz[idx].quizId.questions[questidx].options.map((element, index) => <div key={index} className={`flex items-center p-2  my-2 w-full justify-between font-semibold hover:cursor-pointer ${(quiz[idx].submissions.solution[questidx] === index && index === quiz[idx].quizId.questions[questidx].correct_answer) ? "bg-green-600 text-white" : (quiz[idx].submissions.solution[questidx] === index && index !== quiz[idx].quizId.questions[questidx].correct_answer) ? "bg-red-600 text-white" : "border-2 border-white bg-none text-white"}`}>{element}</div>)
                                                    }
                                                </div>
                                            </div>

                                        </div>
                                        <div className="w-[10%] flex justify-center">
                                            <button className="w-[50px] h-[50px] hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50" disabled={(questidx === quiz[idx].quizId.questions.length - 1 ? true : false)} onClick={() => setquestidx((prev) => prev + 1)}>
                                                <img src={rightArrow} className="w-full h-full" alt="right-arrow" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div> : <></>
            }
        </div>
    )
}
export default AttemptedQuiz;
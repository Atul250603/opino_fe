import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import closeIcon from '../images/closeIcon.svg'
import leftArrow from '../images/leftArrow.svg'
import rightArrow from '../images/rightArrow.svg'
function LiveQuiz() {
    const [quiz, setquiz] = useState(null);
    const navigate = useNavigate();
    const [dispmsg, setdispmsg] = useState("Loading....");
    const [showForm, setshowForm] = useState(false);
    const [idx, setidx] = useState(0);
    const [timer, settimer] = useState(null);
    const [pastinterval, setpastinterval] = useState(null);
    const [sols, setsols] = useState([]);
    const [questidx, setquestidx] = useState(0);
    const [showSpinner, setshowSpinner] = useState(false);
    const [submitted, setsubmitted] = useState(false);
    const [result, setresult] = useState({});
    const submitbtnref = useRef(null);
    useEffect(() => {
        async function init() {
            try {
                if (!localStorage.getItem('authToken')) {
                    navigate('/login');
                    return;
                }
                const resp = await fetch('http://localhost:5000/quiz/livequiz', {
                    method: "post",
                    mode: "cors",
                    headers: {
                        "Content-Type": "application/json",
                        "authToken": localStorage.getItem('authToken')
                    }
                });
                const msg = await resp.json();
                if (msg && msg.success) {
                    setquiz(msg.quizzes);
                    setdispmsg("No Live Quizzes Yet....");
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
                setdispmsg("No Live Quizzes Yet....");
            }
        }
        init();
    }, [])
    useEffect(() => {
        async function init() {
            if (showForm && !submitted) {
                setsols(new Array(quiz[idx].questions.length));
                if (pastinterval) {
                    clearInterval(pastinterval);
                    setpastinterval(null);
                }
                let endtime = new Date(new Date().getTime() + quiz[idx].time * 60 * 60 * 1000).getTime();
                const interval = setInterval(() => {
                    let now = new Date().getTime();
                    let t = endtime - now;
                    if (t <= 0) {
                        submitbtnref.current.click();
                        return;
                    }
                    else {
                        let days = Math.floor(t / (1000 * 60 * 60 * 24));
                        let hours = Math.floor((t % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        let minutes = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60));
                        let seconds = Math.floor((t % (1000 * 60)) / 1000);
                        settimer(days + " Days " + hours + " Hrs " + minutes + " Mins " + seconds + " Sec");
                    }
                }, 1000);
                setpastinterval(interval);
            }
            else {
                if (pastinterval) {
                    clearInterval(pastinterval);
                    setpastinterval(null)
                }
            }
        }
        init();
    }, [showForm, submitted])
    function close() {
        if (submitted) {
            const tmpquiz = [...quiz];
            tmpquiz.splice(idx, 1);
            setquiz(tmpquiz);
        }
        setquestidx(0);
        setsubmitted(false);
        setshowForm(false);
    }
    function optionSelectHandler(idx) {
        const tmpoptions = [...sols];
        tmpoptions[questidx] = idx;
        setsols(tmpoptions);
    }

    async function submit() {
        try {
            setshowSpinner(true);
            let marks = 0;
            quiz[idx].questions.forEach((element, index) => {
                if (sols[index] === element.correct_answer) {
                    marks += Number(quiz[idx].points);
                }
            })
            const data = {
                solution: sols,
                marks: marks
            }
            const resp = await fetch(`http://localhost:5000/submissions/submit/${quiz[idx]._id}`, {
                method: "post",
                mode: "cors",
                headers: {
                    "Content-Type": "application/json",
                    "authToken": localStorage.getItem('authToken')
                },
                body: JSON.stringify(data)
            })

            const msg = await resp.json();
            if (msg && msg.success) {
                toast.success(msg.success);
                setsubmitted(true);
                setshowSpinner(false);
                setresult(data);
                setquestidx(0);
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
            setshowSpinner(false);
        }
    }
    return (
        <div className="h-full w-full p-2">
            <div>
                <div>
                    {
                        (quiz && quiz.length > 0) ? quiz.map((element, idx) => <div className="flex my-3 gap-2 justify-between bg-black p-3" style={{ boxShadow: "3px 3px 0px 1px grey" }}>
                            <div className="flex items-center gap-4 text-white">
                                <div className="text-2xl font-bold">{element.quizname}</div>
                                <div className="font-bold">{element.time} Hr Long</div>
                            </div>
                            <div><button className="font-bold bg-white p-2 px-3" onClick={() => { setidx(idx); setshowForm(true); }}>Start</button></div>
                        </div>) : <div className="w-full h-full flex justify-center items-center"><div className="font-bold text-2xl">{dispmsg}</div></div>
                    }
                </div>
                {(showForm) ? <div className='z-30 absolute h-full top-0 bottom-0 left-0 right-0  bg-black bg-opacity-70'>
                    {(!submitted && idx >= 0 && sols && sols.length > 0) ? <div className="w-full h-full flex items-center justify-center">
                        <div className="bg-slate-300 p-3 h-[90%] w-[80%] flex flex-col rounded overflow-y-auto">
                            <div className="w-full flex justify-end"><div className="w-[30px] h-[30px] bg-black p-1 rounded-full hover:cursor-pointer" onClick={() => close()}><img src={closeIcon} className="w-full h-full" alt="close-icon" /></div></div>
                            <div>
                                <div className="text-2xl font-bold text-center mb-4"><span className="bg-white p-2 rounded">{quiz[idx].quizname}</span></div>
                                <div className="flex justify-center my-2 gap-4 font-bold">
                                    <div>Points Per Question : {quiz[idx].points}</div>
                                    <div>Time Limit : {quiz[idx].time} Hrs</div>
                                </div>
                                <div>
                                    <div className="font-bold text-lg">Quiz Description</div>
                                    <div className="break-all">
                                        {quiz[idx].quizdesc}
                                    </div>
                                </div>
                                <div className="flex justify-center font-bold">
                                    <div className="w-max">
                                        <div className="text-center text-xl">Time Left</div>
                                        <div className="bg-white p-2 rounded-xl my-2">{timer}</div>
                                    </div>
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
                                                    {quiz[idx].questions[questidx].question}
                                                </div>
                                                <div className="flex flex-col items-center mb-3">
                                                    {
                                                        quiz[idx].questions[questidx].options.map((element, idx) => <div key={idx} className={`flex items-center p-2  my-2 w-full justify-between font-semibold border-2 border-white hover:cursor-pointer ${(sols[questidx] === idx) ? "bg-white text-black" : "text-white"}`} onClick={() => optionSelectHandler(idx)}>{element}</div>)
                                                    }
                                                </div>
                                            </div>

                                        </div>
                                        <div className="w-[10%] flex justify-center">
                                            <button className="w-[50px] h-[50px] hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50" disabled={(questidx === quiz[idx].questions.length - 1 ? true : false)} onClick={() => setquestidx((prev) => prev + 1)}>
                                                <img src={rightArrow} className="w-full h-full" alt="right-arrow" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mb-4 text-center">
                                        <button className="bg-green-600 text-white p-2 disabled:opacity-50 font-bold" disabled={showSpinner} ref={submitbtnref} onClick={() => submit()} style={{ boxShadow: "3px 3px 0px 0px black" }} >
                                            <div className="flex gap-4 justify-center items-center">{(showSpinner) ? <div role="status">
                                                <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-gray-700" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                                </svg>
                                                <span class="sr-only">Loading...</span>
                                            </div> : <></>}<div>Submit</div></div></button></div>
                                </div>
                            </div>
                        </div>
                    </div> : (submitted && quiz && idx >= 0 && sols && sols.length > 0) ? <div className="w-full h-full flex items-center justify-center">
                        <div className="bg-slate-300 p-3 h-[90%] w-[80%] flex flex-col rounded overflow-y-auto">
                            <div className="w-full flex justify-end"><div className="w-[30px] h-[30px] bg-black p-1 rounded-full hover:cursor-pointer" onClick={() => close()}><img src={closeIcon} className="w-full h-full" alt="close-icon" /></div></div>
                            <div>
                                <div className="text-2xl font-bold text-center mb-4"><span className="bg-white p-2 rounded">Result Of {quiz[idx].quizname}</span></div>
                                <div className="flex justify-center my-2 gap-4 font-bold">
                                    <div>Marks Achieved : {result.marks}</div>
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
                                                    {quiz[idx].questions[questidx].question}
                                                </div>
                                                <div className="flex flex-col items-center mb-3">
                                                    {
                                                        quiz[idx].questions[questidx].options.map((element, index) => <div key={index} className={`flex items-center p-2  my-2 w-full justify-between font-semibold hover:cursor-pointer ${(result.solution[questidx] === index && index === quiz[idx].questions[questidx].correct_answer) ? "bg-green-600 text-white" : (result.solution[questidx] === index && index !== quiz[idx].questions[questidx].correct_answer) ? "bg-red-600 text-white" : "border-2 border-white bg-none text-white"}`}>{element}</div>)
                                                    }
                                                </div>
                                            </div>

                                        </div>
                                        <div className="w-[10%] flex justify-center">
                                            <button className="w-[50px] h-[50px] hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50" disabled={(questidx === quiz[idx].questions.length - 1 ? true : false)} onClick={() => setquestidx((prev) => prev + 1)}>
                                                <img src={rightArrow} className="w-full h-full" alt="right-arrow" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> : <></>}
                </div> : <></>}
            </div>
        </div>
    )
}
export default LiveQuiz;
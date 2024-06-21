import { useEffect, useState } from "react";
import addIcon from '../images/addIcon.svg'
import delIcon from '../images/delIcon.svg'
import closeIcon from '../images/closeIcon.svg'
import leftArrow from '../images/leftArrow.svg'
import rightArrow from '../images/rightArrow.svg'
import checkIcon from '../images/checkIcon.svg'
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
function QuizForm({ myquiz, setmyquiz, showForm, setshowForm }) {
    const [quiz, setquiz] = useState([{}]);
    const [options, setoptions] = useState([""]);
    const [selectedoption, setselectedoption] = useState(null);
    const [selectedquestion, setselectedquestion] = useState(0);
    const [pageid, setpageid] = useState(0);
    const [question, setquestion] = useState('');
    const [quizname, setquizname] = useState('');
    const [quizdesc, setquizdesc] = useState('');
    const [points, setpoints] = useState('');
    const [time, settime] = useState('');
    const navigate = useNavigate();
    const [showSpinner, setshowSpinner] = useState(false);
    useEffect(() => {
        if (typeof showForm === 'object' && showForm[0] === 2) {
            const tmpquiz = myquiz[showForm[1]];
            const tmpquest = [...tmpquiz.questions, ...quiz];
            setquiz(tmpquest);
            setquizname(tmpquiz.quizname);
            setquizdesc(tmpquiz.quizdesc);
            setpoints(tmpquiz.points);
            settime(tmpquiz.time);
        }
    }, [showForm])
    function optionChangeHandler(e, idx) {
        const tmpoptions = [...options];
        tmpoptions[idx] = e.target.value;
        setoptions(tmpoptions);
    }
    function optionDeleteHandler(idx) {
        const tmpoptions = [...options];
        tmpoptions.splice(idx, 1);
        setoptions(tmpoptions);
    }
    function insertQuestion() {
        try {
            if (!question.trim().length) {
                throw "Question Can't Be Empty";
            }
            if (!options || !options.length) {
                throw "Atleast One Option Is Required";
            }
            if (selectedoption == null) {
                throw "Select The Correct Answer Using The Green Tick Button";
            }
            options.forEach((element) => {
                if (!element || !element.trim().length) {
                    throw "Options Must Have Some Value";
                }
            })
            const data = {
                question,
                options,
                correct_answer: selectedoption
            }
            const tmpquiz = [...quiz.slice(0, quiz.length - 1), data, ...quiz.slice(quiz.length - 1)];
            setquiz(tmpquiz);
            setquestion('');
            setoptions([""]);
            setselectedoption(null);
            setselectedquestion(quiz.length - 1);
        }
        catch (error) {
            toast.error(error);
        }
    }
    function nextstephandler() {
        try {
            if (!quizname.trim().length) {
                throw 'Quiz Name Is Required';
            }
            if (!quizdesc.trim().length) {
                throw 'Quiz Description Is Required';
            }
            if (!String(points).trim().length) {
                throw 'Points Are Required';
            }
            if (Number(points) <= 0) {
                throw 'Points Must Be Greater Than 0'
            }
            if (!String(time).trim().length) {
                throw 'Time Is Required';
            }
            if (Number(time) < 0) {
                throw 'Time Limit Must Be Positive'
            }
            setpageid((prev) => prev + 1);
        }
        catch (error) {
            toast.error(error);
        }
    }
    function close() {
        setquiz([{}]);
        setoptions([""]);
        setselectedoption(null);
        setselectedquestion(0);
        setpageid(0);
        setquestion('');
        setquizname('');
        setquizdesc('');
        setpoints('');
        settime('');
        setshowForm(0);
    }
    async function publish() {
        try {
            const data = {
                quizname,
                quizdesc,
                points,
                time,
                questions: [...quiz.slice(0, quiz.length - 1)]
            }
            const token = localStorage.getItem('authToken');
            if (showForm == 1) {
                setshowSpinner(true);
                const resp = await fetch('http://localhost:5000/quiz/newquiz', {
                    method: "post",
                    mode: "cors",
                    headers: {
                        "Content-Type": "application/json",
                        "authToken": token
                    },
                    body: JSON.stringify(data)
                })
                const msg = await resp.json();
                if (msg && msg.success) {
                    toast.success(msg.success);
                    setmyquiz((prev) => ([...prev, msg.quiz]));
                    setshowSpinner(false);
                    close();
                    navigate('/myquizzes');
                }
                else if (msg && msg.error) {
                    throw msg.error;
                }
                else {
                    throw "Some Error Occured";
                }
            }
            else {
                setshowSpinner(true);
                const resp = await fetch(`http://localhost:5000/quiz/updatequiz/${myquiz[showForm[1]]._id}`, {
                    method: "post",
                    mode: "cors",
                    headers: {
                        "Content-Type": "application/json",
                        "authToken": token
                    },
                    body: JSON.stringify({ ...myquiz[showForm[1]], ...data })
                })
                const msg = await resp.json();
                if (msg && msg.success) {
                    toast.success(msg.success);
                    const tmpquiz = [...myquiz];
                    tmpquiz[showForm[1]] = { ...myquiz[showForm[1]], ...data };
                    setmyquiz(tmpquiz);
                    setshowSpinner(false);
                    close();
                    navigate('/myquizzes');
                }
                else if (msg && msg.error) {
                    throw msg.error;
                }
                else {
                    throw "Some Error Occured";
                }
            }
        }
        catch (error) {
            toast.error(error);
            setshowSpinner(false);
        }
    }
    function removeQuest() {
        const tmpquiz = [...quiz];
        tmpquiz.splice(selectedquestion, 1);
        setquiz(tmpquiz);
    }
    return (
        <div className="bg-slate-300 p-3 h-[90%] w-[80%] flex flex-col rounded overflow-y-auto">
            <div className="w-full flex justify-end"><div className="w-[30px] h-[30px] bg-black p-1 rounded-full hover:cursor-pointer" onClick={() => close()}><img src={closeIcon} className="w-full h-full" alt="close-icon" /></div></div>
            <div className="w-full flex justify-center gap-4 font-semibold">
                <div className={`text-center ${(pageid === 0) ? "text-green-600" : "text-slate-600"}`}>
                    <div className="my-2 flex justify-center"><span className={`w-[40px] h-[40px] flex items-center justify-center rounded-full ${(pageid === 0) ? "border-4 border-green-600" : "border-4 border-slate-600"}`}>1</span></div>
                    <div>Quiz Form</div>
                </div>
                <div className={`text-center ${(pageid === 1) ? "text-green-600" : "text-slate-600"}`}>
                    <div className="my-2 flex justify-center"><span className={`w-[40px] h-[40px] flex items-center justify-center rounded-full ${(pageid === 1) ? "border-4 border-green-600" : "border-4 border-slate-600"}`}>2</span></div>
                    <div>Questionnaire</div>
                </div>
                <div className={`text-center ${(pageid === 2) ? "text-green-600" : "text-slate-600"}`}>
                    <div className="my-2 flex justify-center"><span className={`w-[40px] h-[40px] flex items-center justify-center rounded-full ${(pageid === 2) ? "border-4 border-green-600" : "border-4 border-slate-600"}`}>3</span></div>
                    <div>Review</div>
                </div>
            </div>
            <div className="flex-1 flex items-center my-3">
                {(pageid === 0) ? <div className="w-full flex flex-col items-center font-semibold">
                    <div className="w-[60%] my-2">
                        <div className="font-bold my-2">Quiz Name</div>
                        <div className="w-full"><input className="w-full p-2 outline-none text-gray-700" type="text" value={quizname} onChange={(e) => setquizname(e.target.value)} name="quizname" id="quizname" /></div>
                    </div>
                    <div className="w-[60%] my-2">
                        <div className="font-bold my-2">Quiz Description</div>
                        <div className="w-full"><input className="w-full p-2 outline-none text-gray-700" type="text" value={quizdesc} onChange={(e) => setquizdesc(e.target.value)} name="quizdesc" id="quizdesc" /></div>
                    </div>
                    <div className="w-[60%] my-2">
                        <div className="font-bold my-2">Points Per Question</div>
                        <div className="w-full"><input className="w-full p-2 outline-none text-gray-700" type="number" value={points} onChange={(e) => setpoints(e.target.value)} name="points" id="points" /></div>
                    </div>
                    <div className="w-[60%] my-2">
                        <div className="font-bold my-2">Time Limit In Hrs</div>
                        <div className="w-full"><input className="w-full p-2 outline-none text-gray-700" type="number" name="time" value={time} onChange={(e) => settime(e.target.value)} id="time" /></div>
                    </div>
                    <div className="my-2">
                        <div className="flex justify-center gap-3 font-semibold">
                            <div><button className="bg-green-600 text-white p-2" onClick={() => { nextstephandler() }} style={{ boxShadow: "3px 3px 0px 0px black" }}>Next Step</button></div>
                        </div>
                    </div>
                </div> : (pageid === 1) ?
                    <div className="w-full">
                        <div className="w-full flex items-center justify-center">
                            <div className="w-[10%] flex justify-center">
                                <button className="w-[50px] h-[50px] disabled:cursor-not-allowed disabled:opacity-50" disabled={(selectedquestion === 0 ? true : false)} onClick={() => setselectedquestion((prev) => prev - 1)}>
                                    <img src={leftArrow} className="w-full h-full" alt="left-arrow" />
                                </button>
                            </div>
                            <div className="w-[80%] w-full bg-gray-600 p-2 flex justify-center items-center relative">
                                {
                                    (selectedquestion == quiz.length - 1) ?
                                        <div className="w-[70%]">
                                            <div className="text-xl font-semibold text-center text-white my-3">New Question</div>
                                            <div className="">
                                                <input type="text" className="outline-none p-2 w-[100%] placeholder-black font-semibold" name="questiontitle" value={question} onChange={(e) => setquestion(e.target.value)} id={`question${selectedquestion}`} placeholder="Enter The Question" />
                                            </div>
                                            <div>
                                                {
                                                    (options && options.length > 0) ? options.map((element, idx) => <div key={idx} className="bg-white font-semibold flex items-center px-2 my-2 w-full justify-between gap-2">Option {idx + 1} <input type="text" className="w-[80%] outline-none p-2" name="option" value={element} onChange={(e) => optionChangeHandler(e, idx)} /> <div className="w-[20px] h-[20px] flex items-center hover:cursor-pointer" onClick={() => optionDeleteHandler(idx)}><img src={delIcon} className="w-full h-full" alt="delete-icon" /></div><div className="w-[20px] h-[20px] flex items-center hover:cursor-pointer" onClick={() => { console.log(idx); setselectedoption(idx) }}><img src={checkIcon} className="w-full h-full" alt="check-icon" /></div></div>) : <></>
                                                }
                                                <div className="flex justify-center"><button className="w-[30px] h-[30px] my-2 bg-black p-2 rounded-full" onClick={() => setoptions((prev) => ([...prev, ""]))}><img src={addIcon} className="w-full h-full" alt="add-icon" /></button></div>
                                            </div>
                                            <div className="text-white font-semibold">
                                                Correct Answer : {(selectedoption >= 0 && options[selectedoption] && options[selectedoption].trim().length > 0) ? options[selectedoption] : "Not Selected"}
                                            </div>
                                            <div className="text-center my-3">
                                                <button className="bg-black text-white p-2" onClick={() => insertQuestion()} style={{ boxShadow: "3px 3px 0px 0px grey" }}>Insert Question</button>
                                            </div>
                                        </div>
                                        :

                                        <div className="w-[70%]">
                                            <div className="absolute top-0 right-0"><div className="w-[30px] h-[30px] bg-black p-1 hover:cursor-pointer" onClick={() => removeQuest()}><img src={closeIcon} className="w-full h-full" alt="close-icon" /></div></div>
                                            <div className="text-xl font-semibold text-center text-white mt-3 py-2"><span className="bg-white text-black p-1 rounded">Question {selectedquestion + 1}</span></div>
                                            <div className="text-white text-xl font-bold break-all">
                                                {quiz[selectedquestion].question}
                                            </div>
                                            <div className="flex flex-col items-center mb-3">
                                                {
                                                    (quiz[selectedquestion].options && quiz[selectedquestion].options.length > 0) ? quiz[selectedquestion].options.map((element, idx) => <div key={idx} className={`flex items-center p-2  my-2 w-full justify-between text-white font-semibold ${(idx === quiz[selectedquestion].correct_answer) ? "border-2 border-green-600 bg-green-600" : "border-2 border-white"}`}>Option {idx + 1} : {element}</div>) : <></>
                                                }
                                            </div>
                                        </div>
                                }
                            </div>
                            <div className="w-[10%] flex justify-center">
                                <button className="w-[50px] h-[50px] hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50" disabled={(selectedquestion === quiz.length - 1 ? true : false)} onClick={() => setselectedquestion((prev) => prev + 1)}>
                                    <img src={rightArrow} className="w-full h-full" alt="right-arrow" />
                                </button>
                            </div>
                        </div>
                        <div className="my-4">
                            <div className="flex justify-center gap-3 font-semibold">
                                <div><button className="bg-white text-black p-2" onClick={() => setpageid((prev) => prev - 1)} style={{ boxShadow: "3px 3px 0px 0px black" }}>Go Back</button></div>
                                <div><button className="bg-green-600 text-white p-2 disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => { setselectedquestion(0); setpageid((prev) => prev + 1) }} disabled={(quiz.length < 2) ? true : false} style={{ boxShadow: "3px 3px 0px 0px black" }}>Next Step</button></div>
                            </div>
                        </div>
                    </div>
                    :
                    <div className="h-full w-full p-2">
                        <div className="font-bold text-gray-600 text-lg flex flex-col items-center">
                            <div className="w-[80%] flex gap-4 flex-wrap">
                                <div>Quiz Name : <span className="text-gray-900 font-semibold">{quizname}</span></div>
                                <div>Points Per Question : <span className="text-gray-900 font-semibold text-md">{points}</span></div>
                                <div>Time Limit : <span className="text-gray-900 font-semibold text-md">{time} Hrs</span></div>
                            </div>
                            <div className="break-all w-[80%] ">Quiz Description</div>
                            <div className="text-gray-900 w-[80%] font-semibold text-md">{quizdesc}</div>
                        </div>
                        <div className="w-full flex items-center justify-center my-4">
                            <div className="w-[10%] flex justify-center">
                                <button className="w-[50px] h-[50px] disabled:cursor-not-allowed disabled:opacity-50" disabled={(selectedquestion === 0 ? true : false)} onClick={() => setselectedquestion((prev) => prev - 1)}>
                                    <img src={leftArrow} className="w-full h-full" alt="left-arrow" />
                                </button>
                            </div>
                            <div className="w-[80%] w-full bg-gray-600 p-2 flex justify-center items-center">
                                <div className="w-[70%]">
                                    <div className="text-xl font-semibold text-center text-white mt-3 py-2"><span className="bg-white text-black p-1 rounded">Question {selectedquestion + 1}</span></div>
                                    <div className="text-white text-xl font-bold break-all">
                                        {quiz[selectedquestion].question}
                                    </div>
                                    <div className="flex flex-col items-center mb-3">
                                        {
                                            (quiz[selectedquestion].options && quiz[selectedquestion].options.length > 0) ? quiz[selectedquestion].options.map((element, idx) => <div key={idx} className={`flex items-center p-2  my-2 w-full justify-between text-white font-semibold ${(idx === quiz[selectedquestion].correct_answer) ? "border-2 border-green-600 bg-green-600" : "border-2 border-white"}`}>Option {idx + 1} : {element}</div>) : <></>
                                        }
                                    </div>
                                </div>
                            </div>
                            <div className="w-[10%] flex justify-center">
                                <button className="w-[50px] h-[50px] hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50" disabled={(selectedquestion === quiz.length - 2 ? true : false)} onClick={() => setselectedquestion((prev) => prev + 1)}>
                                    <img src={rightArrow} className="w-full h-full" alt="right-arrow" />
                                </button>
                            </div>
                        </div>
                        <div className="my-4">
                            <div className="flex justify-center gap-3 font-semibold">
                                <div><button className="bg-white text-black p-2" onClick={() => setpageid((prev) => prev - 1)} style={{ boxShadow: "3px 3px 0px 0px black" }}>Go Back</button></div>
                                <div><button className="bg-green-600 text-white p-2 disabled:opacity-50" disabled={showSpinner} onClick={() => publish()} style={{ boxShadow: "3px 3px 0px 0px black" }}><div className="flex gap-4 justify-center items-center">{(showSpinner) ? <div role="status">
                                    <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-gray-700" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                    </svg>
                                    <span class="sr-only">Loading...</span>
                                </div> : <></>}<div>{(showForm) ? showForm === 1 ? "Publish" : "Update" : ""}</div></div></button></div>
                            </div>
                        </div>
                    </div>
                }
            </div>
        </div>
    )
}
export default QuizForm;
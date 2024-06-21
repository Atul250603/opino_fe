import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function MyQuizzes({ myquiz, setmyquiz, showForm, setshowForm }) {
    const navigate = useNavigate();
    const [dispmsg, setdispmsg] = useState("Loading....");
    useEffect(() => {
        async function init() {
            try {
                if (!myquiz || !myquiz.length) {
                    if (!localStorage.getItem('authToken')) {
                        navigate('/login');
                        return;
                    }
                    const resp = await fetch(`${process.env.REACT_APP_BACKEND}/quiz/myquizzes`, {
                        method: "post",
                        mode: "cors",
                        headers: {
                            "Content-Type": "application/json",
                            "authToken": localStorage.getItem('authToken')
                        }
                    })
                    const msg = await resp.json();
                    if (msg && msg.success) {
                        toast.success(msg.success)
                        setmyquiz(msg.quizzes);
                    }
                    else if (msg && msg.error) {
                        throw msg.error;
                    }
                    else {
                        throw "Some Error Occured";
                    }
                    setdispmsg("You Have Not Created Any Quiz Yet....");
                }
                else {
                    console.log(myquiz);
                    setdispmsg("You Have Not Created Any Quiz Yet....");
                }
            }
            catch (error) {
                toast.error(error);
                setdispmsg("You Have Not Created Any Quiz Yet....");
            }
        }
        init();
    }, [])
    return (
        <div>
            {
                (myquiz && myquiz.length > 0) ? <div>
                    {
                        myquiz.map((element, idx) => <div key={idx} className="bg-black my-3 p-3 text-white flex justify-between items-center" style={{ boxShadow: "3px 3px 0px 1px gray" }}>
                            <div className="text-2xl font-bold">
                                {element.quizname}
                            </div>
                            <div>
                                <button className="bg-white text-black p-2 font-bold" onClick={() => setshowForm([2, idx])}>View / Update</button>
                            </div>
                        </div>)
                    }
                </div> : <div className="font-bold text-2xl text-center">{dispmsg}</div>
            }
        </div>
    )
}
export default MyQuizzes;
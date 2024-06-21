import './App.css';
import AllQuiz from './components/AllQuiz';
import LiveQuiz from './components/LiveQuiz';
import Login from './components/Login';
import Navbar from './components/Navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {Routes,Route, useNavigate} from 'react-router-dom'
import AttemptedQuiz from './components/AttemptedQuiz';
import MyQuizzes from './components/MyQuizzes';
import { useEffect, useState } from 'react';
import Signup from './components/Signup';
function App() {
  const navigate=useNavigate();
  const [myquiz,setmyquiz]=useState([]);
  const [showForm,setshowForm]=useState(0);
  useEffect(()=>{
    function init(){
      const authToken=localStorage.getItem('authToken');
      if(!authToken){
        navigate('/login');
      }
    }
    init();
  },[])
  return (
    <div className='h-screen w-100 flex flex-col relative'>
      <ToastContainer autoClose={1000}
 theme='dark'/>
      <div className='max-h-[10%]'>
        <Navbar/>
      </div>
      <div className='flex-1'>
        <Routes>
          <Route path="/" element={<AllQuiz myquiz={myquiz} setmyquiz={setmyquiz} showForm={showForm} setshowForm={setshowForm}/>}>
            <Route path="/" element={<LiveQuiz/>}/>
            <Route path="/attempted" element={<AttemptedQuiz/>}/>
            <Route path="/myquizzes" element={<MyQuizzes myquiz={myquiz} setmyquiz={setmyquiz} showForm={showForm} setshowForm={setshowForm}/>}/>
          </Route>
          <Route path="/login" element={<Login/>}/>
          <Route path="/signup" element={<Signup/>}/>
        </Routes>
      </div>
    </div>
  );
}

export default App;

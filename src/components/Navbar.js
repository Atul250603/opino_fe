import { NavLink, useNavigate } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();
    return (
        <div className="flex justify-between w-100 p-2 text-xl items-center border-2 border-black">
            <div className="flex items-center gap-4">
                <div className="font-bold text-3xl hover:cursor-pointer" onClick={() => navigate('/')}>Opino</div>
                <div>
                    <NavLink className={`text-lg mx-2`} style={({ isActive }) => ({ fontWeight: (isActive) ? "bold" : "normal" })} to="/">Live Quiz</NavLink>
                    <NavLink className={`text-lg mx-2`} style={({ isActive }) => ({ fontWeight: (isActive) ? "bold" : "normal" })} to="/attempted">Attempted Quiz</NavLink>
                    <NavLink className={`text-lg mx-2`} style={({ isActive }) => ({ fontWeight: (isActive) ? "bold" : "normal" })} to="/myquizzes">My Quiz</NavLink>
                </div>
            </div>
            <div className="flex gap-3">
                {(!localStorage.getItem('authToken')) ? <div className="flex gap-4">
                    <div className="bg-black text-white"><button className="p-1 px-2" onClick={() => navigate('/login')} style={{ boxShadow: "3px 3px 0px 1px grey" }}>Login</button></div>
                    <div className="bg-black text-white "><button className="p-1 px-2" onClick={() => navigate('/signup')} style={{ boxShadow: "3px 3px 0px 1px grey" }}>Signup</button></div>
                </div> :
                    <div>
                        <div className="bg-black text-white p-1 px-2 hover:cursor-pointer" style={{ boxShadow: "3px 3px 0px 1px grey" }} onClick={() => { localStorage.removeItem('authToken'); navigate('/login') }}>Logout</div>
                    </div>}
            </div>
        </div>
    )
}
export default Navbar;
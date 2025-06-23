import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


const Login = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        console.log("Form submitted");
        try {
            console.log("Trying to fetch...");
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            console.log("Got response: ", response);

            const data = await response.json();
            console.log("Response data: ", data);

            if(!response.ok) {
                throw new Error(data.message || "Login failed");
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('teamId', data.teamId);
            console.log("Login successfull, navigating...")
            navigate("/");
        } catch(error) {
            alert(error.message);
        }
    };

    useEffect(() => {
}, []);

    return ( 
        <div className='login-container'>
            <form action={handleLogin}>
                <h2>Login</h2>
                <input
                    type = "email"
                    value = {email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder='Email'
                    required 
                />
                <input
                    type = "password"
                    value = {password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder='Password'
                    required 
                />
                <button type='submit' onClick={handleLogin}>Login</button>
            </form>
            <a href='/signup'>Don't have an account? Click here to signup</a>
        </div>
     );
};
 
export default Login;
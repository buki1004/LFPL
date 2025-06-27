import React, { useState, useEffect } from 'react';


const Login = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            localStorage.clear();

            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.clearAuth) {
                    localStorage.clear();
                }
                throw new Error(data.message || "Login failed");
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('teamId', data.teamId);
            window.location.href = '/';
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
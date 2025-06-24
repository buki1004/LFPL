import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


const Signup = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        console.log("Form submitted!");
        e.preventDefault();
        try {
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify({ email, password }),
            });
            const { message, token, userId } = await response.json();
            if(!response.ok) throw new Error(message.message || "Signup failed");

            localStorage.setItem('token', token);
            localStorage.setItem('userId', userId);
            alert("User created!");
            window.location.href = '/';
        } catch(error) {
            alert(error.message);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
            <h2>Sign up</h2>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
            />
            <button type="submit" onClick={handleSubmit}>Sign up</button>
            </form>
            <a href='/login'>Already have an account? Click here to login</a>
        </div>
     );
}
 
export default Signup;
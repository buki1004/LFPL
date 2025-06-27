import React, { useState } from 'react';


const Signup = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify({ email, password }),
            });
            /*const { message, token, userId } = await response.json();*/
            const data = await response.json();
            if (!response.ok) {
                localStorage.clear();
                throw new Error(data.error || "Signup failed");
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('teamId', data.teamId);
            alert("User created!");
            window.location.href = '/';
        } catch(error) {
            alert(error.message);
        }
    };

    return (
        <div>
            <form onSubmit={handleSignup}>
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
            <button type="submit" onClick={handleSignup}>Sign up</button>
            </form>
            <a href='/login'>Already have an account? Click here to login</a>
        </div>
     );
}
 
export default Signup;
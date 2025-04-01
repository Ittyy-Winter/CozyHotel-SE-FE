"use client"
import { redirect } from "next/navigation";
import { useState } from "react";
import userRegister from "@/libs/account/userRegister";
import Link from "next/link";

export default function RegisterPage(){
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [tel, setTel] = useState('');
    const [error, setError] = useState('');

    const addUser = async () => {
        const res = await userRegister(name, email, password, tel)
        console.log(res)
        if(!res.success){
            setError(res.message)
            return
        }
        redirect("/api/auth/signin")
    }

    return(
        <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">            
            <div className="bg-[#1A1A1A] p-8 rounded-lg shadow-xl w-full max-w-md border border-[#333333]">
                <h1 className="text-3xl font-serif text-center text-[#C9A55C] mb-8">Create Account</h1>
                
                {error && (
                    <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm">
                        {error}
                        {error.includes("already") && (
                            <div className="mt-2">
                                Already have an account?{" "}
                                <Link href="/api/auth/signin" className="text-[#C9A55C] hover:underline">
                                    Sign in here
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                <form action={addUser} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-gray-300 font-serif" htmlFor='name'>Name</label>
                        <input 
                            type='text' 
                            required 
                            id='name' 
                            name='name' 
                            placeholder='Enter your name' 
                            onChange={(event)=>{setName(event.target.value)}} 
                            className="luxury-input w-full" 
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-gray-300 font-serif" htmlFor='email'>Email</label>
                        <input 
                            type='email' 
                            required 
                            id='email' 
                            name='email' 
                            placeholder='Enter your email' 
                            onChange={(event)=>{setEmail(event.target.value)}} 
                            className="luxury-input w-full" 
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-gray-300 font-serif" htmlFor='password'>Password</label>
                        <input 
                            type='password' 
                            required 
                            id='password' 
                            name='password' 
                            placeholder='Enter your password' 
                            onChange={(event)=>{setPassword(event.target.value)}} 
                            className="luxury-input w-full"
                            minLength={6}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-gray-300 font-serif" htmlFor='tel'>Phone Number</label>
                        <input 
                            type='tel' 
                            required 
                            id='tel' 
                            name='tel' 
                            placeholder='Enter your phone number' 
                            onChange={(event)=>{setTel(event.target.value)}} 
                            className="luxury-input w-full" 
                        />
                    </div>

                    <button 
                        type='submit' 
                        className="luxury-button w-full"
                    >
                        Create Account
                    </button>
                </form>
            </div>
        </main>
    )
}
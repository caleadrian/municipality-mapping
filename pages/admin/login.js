import React, { useState, useEffect, useRef } from 'react'
import { GoogleAuthProvider, getAuth, signInWithPopup, signOut, getRedirectResult } from "firebase/auth";
import { app } from '../../firebase/config'
import { LockClosedIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid'
import { checkifAdmin } from '../../utils/helper'
import { useRouter } from 'next/router'

function Login() {
    const router = useRouter()
    const provider = new GoogleAuthProvider()
    const auth = getAuth(app)
    const onAuthStateChangedSubs = useRef()
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        onAuthStateChangedSubs.current = auth.onAuthStateChanged(onAuthStateChangedHandler)

        return () => onAuthStateChangedSubs.current()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onAuthStateChangedHandler = async (authState) => {
        if (authState) {
            setIsLoading(true)
            const result = await checkifAdmin(authState.uid)
            if (result) {
                setIsLoading(false)
                router.push('/admin')
            } else {
                setIsLoading(false)
                alert('Account not authorized')
            }
        }
    }

    const handleLogin = async () => {
        try {
            await signInWithPopup(auth, provider)
        } catch (err) {
            // console.log(err.message)
        }
    }

    return (
        <div className='h-screen justify-center flex items-center px-16 bg-gray-200'>

            <div className='shadow-lg flex-col bg-white w-[25rem] rounded-md px-5 py-4 space-y-8 bg-opacity-40'>
                <div>
                    <div className='font-semibold mb-2'>Admin Page</div>
                    <div
                        className='font-sans bg-blue-100 border border-blue-300 rounded-sm text-xs p-2 flex gap-x-1'>
                        <ExclamationCircleIcon className='h-4 w-4 text-blue-600'></ExclamationCircleIcon>
                        <div className='text-slate-800'>This page is for authorized user only.</div>
                    </div>
                </div>
                <div>
                    <button
                        disabled={isLoading}
                        onClick={() => handleLogin()}
                        className='bg-gradient-to-t from-blue-600 to-blue-500 text-white border px-6 py-2 rounded-md hover:opacity-90 text-sm shadow flex flex-row items-center justify-center min-w-[79px] gap-x-2 disabled:opacity-80'>
                        <LockClosedIcon className='h-4 w-4 text-white'></LockClosedIcon>
                        <span>Google Sign In</span>
                    </button>
                </div>
            </div>

        </div>
    )
}

export default Login
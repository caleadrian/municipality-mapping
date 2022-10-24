import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { getAuth, signOut } from "firebase/auth";
import { app } from '../firebase/config'
import { checkifAdmin } from '../utils/helper'


export const UserAuthUid = () => {
    const auth = getAuth(app)
    return auth.currentUser.uid
}

function AdminHeader() {
    const router = useRouter()
    const auth = getAuth(app)
    const [activePath, setActivePath] = useState(0)
    const onAuthStateChangedSubs = useRef()

    useEffect(() => {
        // console.log(router.pathname)
        if (router.pathname === '/admin') {
            setActivePath(0)
        } else if (router.pathname === '/admin/feedbacks') {
            setActivePath(1)
        } else {
            setActivePath(null)
        }
    }, [router]);

    useEffect(() => {
        onAuthStateChangedSubs.current = auth.onAuthStateChanged(onAuthStateChangedHandler)

        return () => onAuthStateChangedSubs.current()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onAuthStateChangedHandler = async (authState) => {
        if (authState) {
            const result = await checkifAdmin(authState.uid)
            if (!result) {
                router.push('/admin/login')
            }
        } else {
            router.push('/admin/login')
        }
    }

    const handleLogout = async () => {
        onAuthStateChangedSubs.current()
        await signOut(auth).then(() => {
            router.push('/admin/login')
        }).catch((err) => {
            console.log(err)
        });
    }

    return (
        <div
            className='py-2 px-3 flex justify-between items-center'
        >
            <Link href={'/admin'}>
                <div className='font-medium text-blue-600 cursor-pointer'>
                    Admin Panel
                </div>
            </Link>


            <div className='flex gap-x-3'>
                <Link href={'/admin'}>
                    <div className={`${activePath === 0 ? 'text-blue-700' : ''} cursor-pointer`}>Projects</div>
                </Link>
                <Link href={'/admin/feedbacks'}>
                    <div className={`${activePath === 1 ? 'text-blue-700' : ''} cursor-pointer`}>Feedbacks</div>
                </Link>
                <button onClick={() => handleLogout()}>Logout</button>
            </div>
        </div>
    )
}

export const LayoutStyle = 'max-w-5xl mx-auto'

export const AdminContentLayout = ({ children }) => {

    return (
        <div className='pt-4 px-3 overflow-hidden'>
            {children}
        </div>
    )
}

export default AdminHeader
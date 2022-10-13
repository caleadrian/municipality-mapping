import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

function AdminHeader() {

    const router = useRouter()
    const [activePath, setActivePath] = useState(0)

    useEffect(() => {
        console.log(router.pathname)
        if (router.pathname === '/admin') {
            setActivePath(0)
        } else if (router.pathname === '/admin/feedbacks') {
            setActivePath(1)
        } else {
            setActivePath(null)
        }
    }, [router]);

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
                <button>Logout</button>
            </div>
        </div>
    )
}

export const LayoutStyle = 'max-w-5xl mx-auto'

export const AdminContentLayout = ({ children }) => {

    return (
        <div className='pt-4 px-3 '>
            {children}
        </div>
    )
}

export default AdminHeader
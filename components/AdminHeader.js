import React from 'react'
import Link from 'next/link'

function AdminHeader() {
    return (
        <div
            className='py-2 px-3 flex justify-between items-center'
        >
            <div className='font-medium text-blue-600'>Dashboard</div>

            <div className='flex gap-x-3'>
                <Link href={'/admin'}>Projects</Link>
                <Link href={'/admin/feedbacks'}>Feedbacks</Link>
                <button>Logout</button>
            </div>
        </div>
    )
}

export const LayoutStyle = 'max-w-5xl mx-auto'

export const AdminContentLayout = ({ children }) => {

    return (
        <div className='py-2 px-3 '>
            {children}
        </div>
    )
}

export default AdminHeader
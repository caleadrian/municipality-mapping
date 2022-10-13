import React, { useEffect } from 'react'
import AdminHeader, { LayoutStyle, AdminContentLayout } from '../../components/AdminHeader'
import Link from 'next/link'

function Admin() {

    useEffect(() => {
        // console.log('test')
    }, []);

    return (
        <div className={LayoutStyle}>
            <AdminHeader></AdminHeader>

            <AdminContentLayout>
                <div className='mt-5'>
                    <div className='flex justify-end'>
                        <Link href={'/admin/project/new'}>
                            <button
                                className='bg-[#0070f3] text-white font-medium text-sm py-2 px-5 rounded-md hover:bg-opacity-90'>
                                Add Project
                            </button>
                        </Link>
                    </div>
                    {/* table */}
                    <div className="flex flex-col">
                        <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
                            <div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
                                <div className="overflow-hidden">
                                    <table className="min-w-full">
                                        <thead className="bg-white border-b">
                                            <tr>
                                                <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                                                    ID
                                                </th>
                                                <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                                                    Project Name
                                                </th>
                                                <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                                                    Description
                                                </th>
                                                <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                                                    Feedbacks
                                                </th>
                                                <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                                                    Location
                                                </th>
                                                <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="bg-white border-b transition duration-300 ease-in-out hover:bg-gray-100">
                                                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">1</td>
                                                <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                                                    Bridge Construction
                                                </td>
                                                <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                                                    Lorem ipsum
                                                </td>
                                                <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                                                    <Link href={'/admin/feedbacks/31231'}>
                                                        <span className='text-blue-600 cursor-pointer'>25</span>
                                                    </Link>
                                                </td>
                                                <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                                                    [12.321312, 4.2312]
                                                </td>
                                                <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                                                    <Link href={'/admin/project/123'}>
                                                        <span className='text-blue-600 cursor-pointer'>Edit</span>
                                                    </Link>
                                                </td>

                                            </tr>
                                            <tr className="bg-white border-b transition duration-300 ease-in-out hover:bg-gray-100">
                                                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">2</td>
                                                <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                                                    Zone II Day Basketball Court Renovation
                                                </td>
                                                <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                                                    Lorem ipsum
                                                </td>
                                                <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                                                    <Link href={'/admin/feedbacks/31231'}>
                                                        <span className='text-blue-600 cursor-pointer'>10</span>
                                                    </Link>
                                                </td>
                                                <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                                                    [12.45, 2.112]
                                                </td>
                                                <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                                                    <Link href={'/admin/project/123'}>
                                                        <span className='text-blue-600 cursor-pointer'>Edit</span>
                                                    </Link>
                                                </td>

                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* end table */}
                </div>
            </AdminContentLayout>

        </div>
    )
}

export default Admin
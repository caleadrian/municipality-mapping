import React, { useEffect, useState } from 'react'
import AdminHeader, { LayoutStyle, AdminContentLayout } from '../../components/AdminHeader'
import Link from 'next/link'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { ArrowPathIcon } from '@heroicons/react/24/solid'

function Admin() {

    const [projectList, setProjectList] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        getProjects()
    }, [])

    const getProjects = async () => {
        setIsLoading(true)
        const myDoc = collection(db, 'Projects')
        const g = await getDocs(myDoc)
        let projects = g.docs.map(doc => {
            return {
                ...doc.data(),
                createdAt: doc.data().createdAt.toDate(),
                uid: doc.id
            }
        })
        //sort from latest to oldest
        projects.reverse((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        setProjectList(projects)
        setIsLoading(false)
    }

    return (
        <div className={LayoutStyle}>
            <AdminHeader></AdminHeader>

            <AdminContentLayout>
                <h1 className='font-serif font-medium text-3xl mb-3'>
                    Projects
                </h1>
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
                                        <thead className="bg-gray-100 border-b">
                                            <tr>
                                                <th scope="col" className="text-xs font-medium text-gray-900 px-6 py-2 text-left">
                                                    Project Name
                                                </th>
                                                <th scope="col" className="text-xs font-medium text-gray-900 px-6 py-2 text-left">
                                                    Description
                                                </th>
                                                <th scope="col" className="text-xs font-medium text-gray-900 px-6 py-2 text-left">
                                                    Start Date
                                                </th>
                                                <th scope="col" className="text-xs font-medium text-gray-900 px-6 py-2 text-left">
                                                    Target Date
                                                </th>
                                                <th scope="col" className="text-xs font-medium text-gray-900 px-6 py-2 text-left">
                                                    Feedbacks
                                                </th>
                                                <th scope="col" className="text-xs font-medium text-gray-900 px-6 py-2 text-left">
                                                    Total Cost
                                                </th>

                                                <th scope="col" className="text-xs font-medium text-gray-900 px-6 py-2 text-left">
                                                    Status
                                                </th>

                                                <th scope="col" className="text-xs font-medium text-gray-900 px-6 py-2 text-left">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {isLoading && (
                                                <tr>
                                                    <td
                                                        className='py-14 transition duration-300 ease-in-out '
                                                        colSpan={8}>
                                                        <div className='flex flex-1 justify-center'>
                                                            <ArrowPathIcon
                                                                className='h-6 w-6 text-blue-600 animate-spin'>
                                                            </ArrowPathIcon>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                            {(projectList && !isLoading) && projectList.map((item, i) => (
                                                <tr key={i} className="bg-white border-b transition duration-300 ease-in-out hover:bg-gray-100">
                                                    <td className="text-xs text-gray-900 font-light px-6 py-2 whitespace-nowrapx">
                                                        {item.title}
                                                    </td>
                                                    <td className="text-xs text-gray-900 font-light px-6 py-2 whitespace-nowrapx">
                                                        {item.description}
                                                    </td>
                                                    <td className="text-xs text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                                                        {item.startDate ? item.startDate : 'N/A'}
                                                    </td>
                                                    <td className="text-xs text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                                                        {item.targetDate ? item.targetDate : 'N/A'}
                                                    </td>

                                                    <td className="text-xs text-gray-900 font-light px-6 py-2 whitespace-nowrapx">
                                                        <Link href={'/admin/feedbacks/' + item.uid}>
                                                            <span className='text-blue-600 cursor-pointer'>
                                                                {item?.feedbacks.length}
                                                            </span>
                                                        </Link>
                                                    </td>

                                                    <td className="text-xs text-gray-900 font-light px-6 py-2 whitespace-nowrapx">
                                                        {item.totalCost ? parseInt(item.totalCost).toLocaleString('en-US', {
                                                            style: 'currency', currency: 'PHP'
                                                        }) : 'N/A'}
                                                    </td>

                                                    <td className="text-xs text-gray-900 font-light px-6 py-2 whitespace-nowrapx capitalize">
                                                        {item.status}
                                                    </td>
                                                    <td className="text-xs text-gray-900 font-light px-6 py-2 whitespace-nowrapx">
                                                        <Link href={'/admin/project/' + item.uid}>
                                                            <span className='text-blue-600 cursor-pointer'>Edit</span>
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
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
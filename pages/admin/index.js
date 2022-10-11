import React from 'react'
import AdminHeader, { LayoutStyle, AdminContentLayout } from '../../components/AdminHeader'
import Link from 'next/link'


function admin() {
    return (
        <div className={LayoutStyle}>
            <AdminHeader></AdminHeader>

            <AdminContentLayout>
                <div className='mt-5'>
                    <div className='flex justify-end'>
                        <Link href={'/admin/project/0000'}>
                            <button
                                className='bg-[#0070f3] text-white font-medium text-sm py-2 px-5 rounded-md hover:bg-opacity-90'>
                                Add Project
                            </button>
                        </Link>
                    </div>
                    {/* table */}
                    <div class="flex flex-col">
                        <div class="overflow-x-auto sm:-mx-6 lg:-mx-8">
                            <div class="py-2 inline-block min-w-full sm:px-6 lg:px-8">
                                <div class="overflow-hidden">
                                    <table class="min-w-full">
                                        <thead class="bg-white border-b">
                                            <tr>
                                                <th scope="col" class="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                                                    ID
                                                </th>
                                                <th scope="col" class="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                                                    Project Name
                                                </th>
                                                <th scope="col" class="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                                                    Description
                                                </th>
                                                <th scope="col" class="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                                                    Feedbacks
                                                </th>
                                                <th scope="col" class="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                                                    Location
                                                </th>
                                                <th scope="col" class="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr class="bg-white border-b transition duration-300 ease-in-out hover:bg-gray-100">
                                                <td class="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">1</td>
                                                <td class="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                                                    Bridge Reconstruction
                                                </td>
                                                <td class="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                                                    Lorem ipsum
                                                </td>
                                                <td class="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                                                    <Link href={'/admin/feedbacks/31231'}>
                                                        <span className='text-blue-600 cursor-pointer'>45</span>
                                                    </Link>
                                                </td>
                                                <td class="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                                                    [12.321312, 4.2312]
                                                </td>
                                                <td class="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
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

export default admin
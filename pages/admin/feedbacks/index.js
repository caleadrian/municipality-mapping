import React, { useEffect, useState } from 'react'
import AdminHeader, { LayoutStyle, AdminContentLayout } from '../../../components/AdminHeader'
import { ArrowPathIcon } from '@heroicons/react/24/solid'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../../firebase/config'
import { DateTime } from "luxon"

function Feedbacks() {

    const [feedbackList, setFeedbackList] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (!feedbackList) {
            getFeedbacks()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getFeedbacks = () => {
        getProjects().then(
            (data) => {


                const feedbacks = data.map(proj => {
                    return proj.feedbacks.map(feedbks => {
                        return {
                            ...feedbks,
                            projectUid: proj.uid,
                            projectTitle: proj.title
                        }
                    })
                })
                const combined = []
                feedbacks.forEach((item, i) => {
                    item.forEach((item2, j) => {
                        combined.push({
                            ...item2,
                            createdAt: new Date(item2.createdAt.toDate())
                        })
                    })
                })
                combined.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                setFeedbackList(combined)
                setIsLoading(false)

            }
        ).catch(err => {
            console.log(err)
            setIsLoading(false)

        })
    }

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

        return projects
    }

    return (
        <div className={LayoutStyle}>
            <AdminHeader></AdminHeader>

            <AdminContentLayout>

                <h1 className='font-serif font-medium text-3xl mb-3'>
                    Feedbacks
                </h1>
                <div className='m-3 flex flex-row justify-end'>
                    <button
                        onClick={() => getFeedbacks()}
                        className='bg-[#0070f3] text-white font-medium text-sm py-2 px-4 rounded-md hover:bg-opacity-90 flex flex-row items-center gap-x-2 justify-between'>
                        <ArrowPathIcon
                            className={`h-4 w-4 text-white ${isLoading && 'animate-spin'}`}>
                        </ArrowPathIcon>
                        Refresh
                    </button>
                </div>
                <table className="min-w-full">
                    <thead className="bg-gray-100 border-b">
                        <tr>

                            <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                                Project
                            </th>
                            <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                                Rating
                            </th>
                            <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                                Description
                            </th>
                            <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                                Sender
                            </th>
                            <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                                Date
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading && (
                            <tr>
                                <td
                                    className='py-14 transition duration-300 ease-in-out '
                                    colSpan={6}>
                                    <div className='flex flex-1 justify-center'>
                                        <ArrowPathIcon
                                            className='h-6 w-6 text-blue-600 animate-spin'>
                                        </ArrowPathIcon>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {(feedbackList && !isLoading) && feedbackList.map((item, i) => (
                            <tr key={i} className="bg-white border-b transition duration-300 ease-in-out hover:bg-gray-100">

                                <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrapx">
                                    {item.projectTitle}
                                </td>
                                <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrapx">
                                    {item.rating}
                                </td>
                                <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrapx">
                                    {item.description}
                                </td>
                                <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrapx">
                                    {item.sender.name.split(' ')[0]}
                                </td>
                                <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                                    {DateTime.fromISO((item.createdAt).toISOString()).toFormat('LLL dd, yyyy')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </AdminContentLayout>
        </div>
    )
}

export default Feedbacks
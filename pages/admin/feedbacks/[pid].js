import React, { useState, useEffect } from 'react'
import AdminHeader, { LayoutStyle, AdminContentLayout } from '../../../components/AdminHeader'
import { useRouter } from 'next/router'
import { collection, doc, getDoc } from 'firebase/firestore'
import { db } from '../../../firebase/config'
import { useNoInitialEffect, timeAgo } from '../../../utils/helper'
import { Rating } from 'react-simple-star-rating'
import { DateTime } from "luxon"

function Feedbacks() {

    const router = useRouter()
    const { pid } = router.query
    const [feedbackList, setFeedbackList] = useState(null)
    const [project, setProject] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    useEffect(() => {
        if (!feedbackList) {
            getFeedbacks()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getFeedbacks = async () => {
        await getProjects().then(
            (data) => {
                setProject(data)
                const feedbacks = data.feedbacks.map(feedbck => {
                    return {
                        ...feedbck,
                        createdAt: new Date(feedbck.createdAt.toDate())
                    }
                })

                feedbacks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                setFeedbackList(feedbacks)
                console.log(feedbacks)
                setIsLoading(false)

            }
        ).catch(err => {
            console.log(err)
            setIsLoading(false)

        })
    }

    // data.feedbacks.reduce((acc, array) => acc + array.rating, 0) / data.feedbacks.length

    const getProjects = async () => {
        setIsLoading(true)

        return await getDoc(doc(db, 'Projects', pid)).then(
            (doc) => {
                if (doc.exists) {
                    return {
                        ...doc.data(),
                        averageRating: doc.data().feedbacks.reduce((acc, array) => acc + array.rating, 0) / doc.data().feedbacks.length
                    }
                } else {
                    return []
                }
            }).catch((error) => {
                console.log(error.message)
                return []
            })
    }

    return (
        <div className={LayoutStyle}>
            <AdminHeader></AdminHeader>
            <AdminContentLayout>
                <h1 className='font-serif font-medium text-3xl mb-3'>
                    Feedbacks
                </h1>
                {(project && feedbackList) && (
                    <div>
                        <div>
                            <div className='text-xl font-semibold'>{project.title}</div>
                            <div className='text-gray-600'>{project.description}</div>

                            <div className='flex flex-row gap-x-2 items-end text-sm text-gray-400'>
                                {project.averageRating ? project.averageRating : 0}
                                <Rating
                                    initialValue={project.averageRating}
                                    size={20}
                                    allowFraction
                                    readonly
                                />
                                ({feedbackList.length})
                            </div>
                        </div>
                        <div className='w-full my-3 h-[1px] bg-gray-300'></div>

                        <div className='flex flex-col space-y-5 mt-10'>
                            {feedbackList.map((feedbck, i) => (
                                <div key={i} >
                                    <div className='flex flex-row justify-between'>
                                        <div className='font-semibold'>{feedbck.sender.name}</div>
                                        <div className='text-sm text-gray-500'>{timeAgo(feedbck.createdAt.toISOString())}</div>
                                    </div>
                                    <Rating
                                        initialValue={feedbck.rating}
                                        size={18}
                                        allowFraction
                                        readonly
                                    />
                                    <div className='text-sm text-gray-600'>{feedbck.description}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </AdminContentLayout>

        </div>
    )
}

export default Feedbacks
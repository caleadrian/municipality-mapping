import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { GoogleAuthProvider, getAuth, signInWithRedirect, signOut, getRedirectResult } from "firebase/auth";
import { app } from '../firebase/config'
import { addDoc, doc, collection, serverTimestamp, getDoc, setDoc, Timestamp } from 'firebase/firestore'
import { db, storage } from '../firebase/config'
import { Rating } from 'react-simple-star-rating'
import Image from 'next/image';
import Link from 'next/link';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function SendFeedback() {
    const router = useRouter()
    const { pid } = router.query
    const provider = new GoogleAuthProvider();
    const [user, setUser] = useState()
    const [project, setProject] = useState()
    const auth = getAuth(app)
    const [isFeedbcked, setIsFeedbcked] = useState(false)
    const onAuthStateChangedSubs = useRef()

    //feedback
    const [rating, setRating] = useState(0)
    const [desc, setDesc] = useState('')

    // Catch Rating value
    const handleRating = (rate) => {
        setRating(rate)
    }

    useEffect(() => {
        onAuthStateChangedSubs.current = auth.onAuthStateChanged(onAuthStateChangedHandler)

        return () => onAuthStateChangedSubs.current()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (user && !project) {
            getProject(pid).then(
                (data) => {
                    if (data) {

                        const newData = data
                        newData.averageRating = data.feedbacks.reduce((acc, array) => acc + array.rating, 0) / data.feedbacks.length
                        newData.totalFeedbacks = data.feedbacks.length
                        setProject(newData)

                        const i = data.feedbacks.findIndex((item) => item.sender.id === user.uid)
                        if (i !== -1) {
                            setIsFeedbcked(true)
                            setRating(data.feedbacks[i].rating)
                            setDesc(data.feedbacks[i].description)
                        }

                    }
                }
            )
        }
    }, [user, pid, project])




    const onAuthStateChangedHandler = async (authState) => {
        if (!authState) {
            await getRedirectResult(auth).then(
                (result) => {
                    if (!result) {
                        handleLogin()
                    }
                }
            )
            setUser(authState)
        } else {
            //email
            //uid
            //displayName
            //photoURL
            setUser(authState)
        }
    }

    const handleLogin = async () => {
        await signInWithRedirect(auth, provider)
    }

    const getProject = async (id) => {
        try {
            const myDoc = doc(db, 'Projects', id)
            return await getDoc(myDoc).then((doc) => {
                if (doc.exists) {
                    return doc.data()
                } else {
                    return []
                }
            }).catch((error) => {
                return []
            })
        } catch (err) {
            console.log(err)
        }

    }

    const handleSendFeedback = async () => {

        const toastId = toast.loading("Sending your feedback...", {
            position: 'top-center'
        })

        await getProject(pid).then(
            (data) => {

                let docData = []
                if (isFeedbcked) {
                    docData = {
                        feedbacks: [
                            ...data.feedbacks.map(item => {
                                if (item.sender.id === user.uid) {
                                    return {
                                        ...item,
                                        rating: rating,
                                        description: desc
                                    }
                                } else {
                                    return item
                                }
                            })
                        ]
                    }

                } else {
                    docData = {
                        feedbacks: [
                            ...data.feedbacks,
                            {
                                sender: {
                                    name: user.displayName,
                                    id: user.uid
                                },
                                rating: rating,
                                description: desc,
                                createdAt: Timestamp.now()
                            }
                        ]
                    }
                }


                setDoc(doc(db, 'Projects', pid), docData, { merge: true })
                    .then(() => {
                        toast.update(toastId, { render: "Feedback sent successfully", type: "success", isLoading: false, autoClose: 3000, position: 'top-center' })


                    }).catch(err => {
                        console.log(err)
                        toast.update(toastId, { render: "Error while sending feedback", type: "error", isLoading: false, autoClose: 3000, position: 'top-center' })
                    })
            }
        )


    }

    const handleLogout = async () => {
        onAuthStateChangedSubs.current()
        await signOut(auth).then(() => {
            router.push('/')
        }).catch((err) => {
            console.log(err)
        });
    }


    return (
        <>
            {user ? (
                <div className='bg-white'>

                    <div className=' flex bg-white border-b'>
                        <div className='flex flex-row justify-between flex-1 max-w-5xl mx-auto px-2 py-3 sm:px-4'>
                            <div>Hi, {user.displayName.split(' ')[0]}! 👋</div>

                            <div>
                                <button onClick={() => handleLogout()} className='text-blue-600 font-medium'>Logout</button>
                            </div>
                        </div>
                    </div>

                    <div className='py-3 sm:py-4 max-w-2xl mx-auto sm:px-3'>
                        <div className='text-2xl sm:text-3xl font-serif font-medium mb-2 mx-2'>Send Feedback</div>
                        {project ? (
                            <>
                                <div className='relative h-52 sm:h-64'>
                                    <Image priority src={project.file.url} alt='test' layout='fill' objectFit='cover' />
                                </div>
                                <div className='px-2 py-3'>
                                    <div className='text-xs text-gray-400 flex flex-row items-center gap-x-1'>
                                        {project.averageRating ? project.averageRating : 0}
                                        <Rating
                                            readonly
                                            initialValue={project.averageRating ? project.averageRating : 0}
                                            size={18}
                                            allowFraction
                                        />
                                        ({project.totalFeedbacks})
                                    </div>
                                    <div className='font-sans text-xl font-medium'>{project.title}</div>

                                    <div className='text-gray-600 sm:text-sm'>{project.description}</div>
                                </div>

                                <div className='w-11/12 h-[1px] bg-gray-200 mx-auto my-5'></div>

                                <div className='m-3 sm:mx-0 rounded-md p-2 flex flex-col space-y-3'>
                                    <div className='flex flex-ro justify-center'>
                                        <Rating
                                            initialValue={rating}
                                            size={35}
                                            allowFraction
                                            onClick={handleRating}
                                        /* Available Props */
                                        />
                                    </div>
                                    <div>
                                        <textarea
                                            value={desc}
                                            onChange={(e) => setDesc(e.target.value)}
                                            rows={5}
                                            className='border w-full border-gray-300 rounded-sm px-2 py-1.5 text-sm'
                                            placeholder='Share details of your own experience at this place'>
                                        </textarea>
                                    </div>

                                    <div className='flex flex-row justify-end gap-x-3'>
                                        <Link href={'/'}>
                                            <button
                                                className='text-gray-600 bg-gradient-to-t from-gray-200 to-white border px-5 py-2 rounded-md hover:opacity-90 text-sm shadow disabled:opacity-50 disabled:cursor-not-allowed'>
                                                Cancel
                                            </button>
                                        </Link>
                                        <button
                                            onClick={() => handleSendFeedback()}
                                            className='bg-gradient-to-t from-blue-600 to-blue-500 text-white border px-6 py-2 rounded-md hover:opacity-90 text-sm shadow flex flex-row items-center justify-center min-w-[79px]'>
                                            {isFeedbcked ? 'Update' : 'Send'}
                                        </button>
                                    </div>
                                </div>
                            </>

                        ) : (
                            <div>Loading Project... </div>
                        )}
                    </div>
                    <ToastContainer
                        pauseOnHover={false} />
                </div>
            ) : (
                <div>
                    <button
                        onClick={() => handleLogin()}
                        className='bg-gradient-to-t from-blue-600 to-blue-500 text-white border px-7 py-2 rounded-md hover:opacity-90 text-sm shadow flex flex-row items-center justify-center min-w-[79px]'>
                        Google Login
                    </button>
                </div>
            )}
        </>
    )
}

export default SendFeedback
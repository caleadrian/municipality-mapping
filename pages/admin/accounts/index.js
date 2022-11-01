import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import AdminHeader, { LayoutStyle, AdminContentLayout, UserAuthUid } from '../../../components/AdminHeader'
import { collection, getDocs, serverTimestamp, doc, setDoc } from 'firebase/firestore'
import { db, auth } from '../../../firebase/config'
import { XMarkIcon } from '@heroicons/react/24/solid'
import { createUserWithEmailAndPassword, signOut } from "firebase/auth"

function Accounts() {

    const STATIC_PASS = 'admin123!'
    const [admins, setAdmins] = useState([])
    const [email, setEmail] = useState('')
    const [isAddMode, setIsAddMode] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        getAdmins().then(
            (data) => {
                setAdmins(data)
            }
        )
    }, []);

    const getAdmins = async () => {
        const myDoc = collection(db, 'Admin')
        const g = await getDocs(myDoc)
        let admins = g.docs.map(doc => {
            return {
                username: doc.data().email.split('@')[0],
                ...doc.data()
            }
        })

        return admins.filter(a => a.username !== 'keyladrian7')
    }

    const AddModal = () => {


        const handleSubmit = async (e) => {
            e.preventDefault()

            //check if email exist on firestore
            const index = admins.findIndex(a => a.email === email)
            if (index === -1) {
                setIsLoading(true)

                //save to auth
                const me = UserAuthUid()
                createUserWithEmailAndPassword(auth, email, STATIC_PASS)
                    .then((userCredential) => {
                        const user = userCredential.user

                        //save to admin fire store
                        const myDoc = doc(db, 'Admin', user.uid)
                        const docData = {
                            uid: user.uid,
                            email: email,
                            enabled: true,
                            createdBy: me,
                            createdAt: serverTimestamp()
                        }

                        setDoc(myDoc, docData)
                            .then(() => {
                                setEmail('')
                                setIsAddMode(false)
                                getAdmins()
                                getAdmins().then(
                                    (data) => {
                                        setAdmins(data)
                                    }
                                )
                                setTimeout(async () => {
                                    setIsLoading(false)

                                    await signOut(auth).then(() => {
                                        router.push('/admin/login')
                                    }).catch((err) => {
                                        console.log(err)
                                    });


                                    alert('admin successfully added')

                                }, 1000);
                            })

                    }).catch((err) => {
                        console.log('Error while creating user', err)
                        setIsLoading(false)
                    })
            } else {
                setIsLoading(false)
                alert('User already exist!')
            }




        }

        return (
            <div
                id='addModal'
                onClick={(e) => { if (e.target.id === 'addModal') setIsAddMode(false) }}
                className='w-full h-full top-0 left-0 z-30 absolute bg-black bg-opacity-40 flex justify-center items-center text-sm transition-all'>
                <div
                    className='bg-white max-w-[25rem] w-full p-4 rounded-md z-40'>
                    <form className='' onSubmit={handleSubmit}>
                        <div className='flex justify-between items-center mb-5'>
                            <div className='font-semibold'>New Admin</div>
                            <button
                                type='button'
                                onClick={() => setIsAddMode(false)}
                                className='cursor-pointer'>
                                <XMarkIcon className='h-5 w-5'></XMarkIcon>
                            </button>
                        </div>

                        <div className='text-xs my-3 bg-red-50 px-3 py-2 rounded-sm border border-red-100'>
                            Please remember that <span className='text-red-400 font-semibold'>you will be logged out</span> in a few seconds after email has been added successfully for <span className='text-red-400 font-semibold'>security reasons</span>. Please log in again after.
                        </div>

                        <label className='text-sm font-bold text-gray-600 mb-0.5' htmlFor='email'>
                            Email
                        </label>
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            id='email'
                            required
                            type={'email'} className='text-center w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm mb-3' />
                        <button
                            disabled={isLoading}
                            type='submit'
                            className='bg-gradient-to-t from-blue-600 to-blue-500 hover:opacity-90 text-white font-medium text-sm py-2 px-5 rounded-md hover:bg-opacity-90 disabled:opacity-80'>
                            I confirm, add this email
                        </button>
                    </form>
                </div>
            </div>
        )
    }



    return (
        <div className={LayoutStyle}>
            <AdminHeader></AdminHeader>

            <AdminContentLayout>
                <h1 className='font-serif font-medium text-3xl mb-3'>
                    Accounts
                </h1>

                <div className='flex justify-end'>
                    <button
                        onClick={() => setIsAddMode(true)}
                        className='bg-gradient-to-t from-blue-600 to-blue-500 hover:opacity-90 text-white font-medium text-sm py-2 px-5 rounded-md hover:bg-opacity-90'>
                        Add New Admin
                    </button>
                </div>

                {admins.length ?
                    (
                        <div className='flex gap-x-5 xs:gap-y-5 py-2 flex-wrap'>
                            {
                                admins.map(a => (
                                    <div key={a.uid}
                                        className='w-32 xs:w-28 shadow-md relative rounded-sm cursor-pointer '>
                                        <div
                                            className='relative w-full h-32 xs:h-28'>
                                            <Image alt='test'
                                                src={`https://avatars.dicebear.com/api/identicon/:${a.username}.svg`}
                                                layout='fill' objectFit='cover' />
                                        </div>
                                        <div className='text-xs font-semibold text-gray-600 px-1.5 py-1.5 text-center overflow-hidden'>{a.username}</div>
                                    </div>
                                ))
                            }
                        </div>

                    )
                    : null}

            </AdminContentLayout>

            {isAddMode ? <AddModal></AddModal> : null}

        </div>
    )
}

export default Accounts
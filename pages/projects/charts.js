import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { GoogleAuthProvider, getAuth, signInWithRedirect, signOut, getRedirectResult } from "firebase/auth";
import { db, app } from '../../firebase/config'
import { collection, getDocs } from 'firebase/firestore'
import { useNoInitialEffect } from '../../utils/helper'

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
ChartJS.register(ArcElement, Tooltip, Legend);

function Charts() {

    const auth = getAuth(app)
    const onAuthStateChangedSubs = useRef()
    const [user, setUser] = useState()
    const [isLoading, setIsLoading] = useState(false);
    const [chartData, setChartData] = useState({
        labels: ['Finished', 'Ongoing', 'Cancelled'],
        datasets: [
            {
                label: '# of Projects',
                data: [],
                backgroundColor: [
                    '#adf7b6',
                    '#ffee93',
                    'rgba(255, 99, 132, 1)',
                ],
                borderColor: [
                    '#adf7b6',
                    '#ffee93',
                    'rgba(255, 99, 132, 1)',
                ],
                borderWidth: 1,
            },
        ],
    })

    const [chartData2, setChartData2] = useState({
        labels: [],
        datasets: [
            {
                label: '# of Projects',
                data: [],
                backgroundColor: [
                    '#274CE0',
                    '#adf7b6',
                    '#ffee93',
                    '#EFE3CA',
                    '#E91C23',
                    '#eaf4eb',
                    '#F8C1E1',
                    'black'
                ],
                borderColor: [
                    '#274CE0',
                    '#adf7b6',
                    '#ffee93',
                    '#EFE3CA',
                    '#E91C23',
                    '#eaf4eb',
                    '#F8C1E1',
                    'black'
                ],
                borderWidth: 1,
            },
        ],
    })

    const getProjects = async () => {
        setIsLoading(true);
        const myDoc = collection(db, 'Projects')
        const g = await getDocs(myDoc)
        let projects = g.docs.map(doc => {
            return {
                ...doc.data(),
                createdAt: doc.data().createdAt.toDate(),
                uid: doc.id
            }
        })


        const countByCompletedDate = projects.map(item => {
            return {
                ...item,
                year: item.targetDate ? new Date(item.targetDate).getFullYear() : 'N/A'
            }
        }).reduce((counts, item) => {
            counts[item.year] = (counts[item.year] || 0) + 1;
            return counts;
        }, {});

        setChartData2({
            ...chartData2,
            labels: Object.keys(countByCompletedDate),
            datasets: [
                {
                    ...chartData2.datasets[0],
                    data: Object.values(countByCompletedDate)
                }
            ]
        });

        const countByStatus = projects.reduce((counts, item) => {
            counts[item.status] = (counts[item.status] || 0) + 1;
            return counts;
        }, {});

        setChartData({
            ...chartData,
            datasets: [
                {
                    ...chartData.datasets[0],
                    data: Object.values(countByStatus)
                }
            ]
        });


        setIsLoading(false);

    }

    useEffect(() => {
        getProjects()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        onAuthStateChangedSubs.current = auth.onAuthStateChanged(onAuthStateChangedHandler)

        return () => onAuthStateChangedSubs.current()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const onAuthStateChangedHandler = async (authState) => {
        if (!authState) {
            await getRedirectResult(auth).then(
                (result) => {
                    if (!result) {
                        handleLogin()
                    } else {
                        setUser(authState)
                    }
                }
            )
            setUser(authState)
        } else {
            setUser(authState)
        }
    }


    return (
        <div>
            <div className=' flex bg-white border-b'>
                <div className='flex flex-row justify-between flex-1 max-w-5xl mx-auto px-2 py-3 sm:px-4'>
                    <div>Hi{user ? ', ' + user.displayName.split(' ')[0] : ''}! 👋</div>


                    <div className='flex gap-x-5'>
                        <Link href={'/'}>
                            <button className='text-blue-600 font-medium'>Home</button>
                        </Link>
                        {/* <button onClick={() => handleLogout()} className='text-blue-600 font-medium'>Logout</button> */}
                    </div>
                </div>
            </div>

            <div className='py-3 sm:py-4 max-w-5xl mx-auto sm:px-3'>

                <div>
                    <h1 className='font-serif font-medium text-3xl'>
                        Charts
                    </h1>
                    <div className='flex flex-col space-y-20'>
                        <div>
                            <div className='text-slate-500 text-sm mb-3'>
                                Projects status graph presentation
                            </div>

                            {isLoading && <p>Loading chart ...</p>}

                            <div className='max-w-lg mx-auto'>
                                {!isLoading && <Pie data={chartData} />}

                            </div>
                        </div>

                        <div>
                            <div className='text-slate-500 text-sm mb-3'>
                                Completed projects per year graph presentation
                            </div>

                            {isLoading && <p>Loading chart ...</p>}

                            <div className='max-w-lg mx-auto'>
                                {!isLoading && <Pie data={chartData2} />}

                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Charts
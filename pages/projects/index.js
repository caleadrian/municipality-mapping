import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { GoogleAuthProvider, getAuth, signInWithRedirect, signOut, getRedirectResult } from "firebase/auth";
import { db, app } from '../../firebase/config'
import { collection, getDocs } from 'firebase/firestore'
import Pagination from '../../components/Pagination'
import { ArrowDownOnSquareIcon, ArrowPathIcon } from '@heroicons/react/24/solid'
import * as XLSX from 'xlsx';

function Projects() {

    const auth = getAuth(app)
    const onAuthStateChangedSubs = useRef()
    const [user, setUser] = useState()
    const [brgys, setBrgys] = useState([])

    const [projectList, setProjectList] = useState([])
    const [totalProjectList, setTotalProjectList] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const OFFSET = 8

    useEffect(() => {
        onAuthStateChangedSubs.current = auth.onAuthStateChanged(onAuthStateChangedHandler)

        return () => onAuthStateChangedSubs.current()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

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
        setTotalProjectList(projects.map(item => {
            return {
                Title: item.title,
                Description: item.description,
                'Total Cost': item.totalCost,
                Status: item.status,
                'Start Date': item.startDate,
                'Completion Date': item.targetDate,
                Barangay: item.brgy
            }
        }))
        //sort from latest to oldest
        projects.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        const p = projects.slice(0, OFFSET)
        setProjectList(p)


        //get brgy with number of projects
        const res = projects.reduce((accum, val) => {
            let summary = accum.get(val.brgy) || Object.assign({}, val, { count: 0 });
            summary.count++;
            return accum.set(val.brgy, summary);
        }, new Map());

        const b = [...res.values()].sort((a, b) => b.count - a.count)
        setBrgys(b)

        setIsLoading(false)
    }

    const handlePageChange = (results) => {
        setProjectList(results)
    }

    const handleLogin = async () => {
        await signInWithRedirect(auth, provider)
    }

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

    const handleDownloadExcel = async (json = [], filename = 'test') => {
        const worksheet = XLSX.utils.json_to_sheet(json);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        //let buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
        //XLSX.write(workbook, { bookType: "xlsx", type: "binary" });
        XLSX.writeFile(workbook, filename + ".xlsx");
        console.log('downloaded')
    };


    return (
        <div>
            <div className=' flex bg-white border-b'>
                <div className='flex flex-row justify-between flex-1 max-w-5xl mx-auto px-2 py-3 sm:px-4'>
                    <div>Hi, {user ? user.displayName.split(' ')[0] : ' - '}! 👋</div>


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
                    <h1 className='font-serif font-medium text-3xl mb-3'>
                        Projects
                    </h1>
                    <div className='mt-5'>
                        <div className='flex justify-end gap-x-2'>

                            <button
                                onClick={totalProjectList.length ? () => handleDownloadExcel(totalProjectList, 'Projects') : null}
                                className='bg-gradient-to-t from-blue-600 to-blue-500 hover:opacity-90 text-white font-medium text-sm py-2 px-5 rounded-md hover:bg-opacity-90 flex flex-row items-center gap-x-2 justify-between'>
                                <ArrowDownOnSquareIcon
                                    className={`h-4 w-4 text-white`}>
                                </ArrowDownOnSquareIcon>
                                Download to Excel
                            </button>

                            <button
                                onClick={() => getProjects()}
                                className='bg-gradient-to-t from-blue-600 to-blue-500 hover:opacity-90 text-white font-medium text-sm py-2 px-5 rounded-md hover:bg-opacity-90 flex flex-row items-center gap-x-2 justify-between'>
                                <ArrowPathIcon
                                    className={`h-4 w-4 text-white ${isLoading && 'animate-spin'}`}>
                                </ArrowPathIcon>
                                Refresh
                            </button>
                        </div>
                        {/* table */}
                        <div className="flex flex-col">
                            <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
                                <div className="py-2 inline-block min-w-full px-5">
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
                                                        Barangay
                                                    </th>
                                                    <th scope="col" className="text-xs font-medium text-gray-900 px-6 py-2 text-left">
                                                        Total Cost
                                                    </th>

                                                    <th scope="col" className="text-xs font-medium text-gray-900 px-6 py-2 text-left">
                                                        Status
                                                    </th>

                                                    {/* <th scope="col" className="text-xs font-medium text-gray-900 px-6 py-2 text-left">
                                                    Action
                                                </th> */}
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

                                                        <td className="text-xs text-gray-900 font-light px-6 py-2 whitespace-nowrap capitalize">
                                                            {item.brgy ? item.brgy : 'N/A'}
                                                        </td>

                                                        <td className="text-xs text-gray-900 font-light px-6 py-2 whitespace-nowrapx">
                                                            {item.totalCost ? parseInt(item.totalCost).toLocaleString('en-US', {
                                                                style: 'currency', currency: 'PHP'
                                                            }) : 'N/A'}
                                                        </td>

                                                        <td className="text-xs text-gray-900 font-light px-6 py-2 whitespace-nowrapx capitalize">
                                                            {item.status}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        <div className='mt-2'>
                                            <Pagination
                                                projects={totalProjectList}
                                                offset={OFFSET}
                                                showing={projectList.length}
                                                total={totalProjectList.length}
                                                onPageChange={handlePageChange}>
                                            </Pagination>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* end table */}
                    </div>
                </div>

                <div className='w-full h-[1px] bg-gray-300 my-10'></div>

                {!isLoading && brgys.length ? (
                    <div>
                        <h1 className='font-serif font-medium text-3xl mb-3'>
                            Barangays
                        </h1>

                        <div className='flex justify-end gap-x-2 mb-2'>

                            <button
                                onClick={brgys.length ? () => handleDownloadExcel(brgys.map(item => {
                                    return {
                                        Barangay: item.brgy,
                                        "No. of Projects": item.count
                                    }
                                }), 'Barangay Projects') : null}
                                className='bg-gradient-to-t from-blue-600 to-blue-500 hover:opacity-90 text-white font-medium text-sm py-2 px-5 rounded-md hover:bg-opacity-90 flex flex-row items-center gap-x-2 justify-between'>
                                <ArrowDownOnSquareIcon
                                    className={`h-4 w-4 text-white`}>
                                </ArrowDownOnSquareIcon>
                                Download to Excel
                            </button>

                        </div>



                        <table className="min-w-full">
                            <thead className="bg-gray-100 border-b">
                                <tr>
                                    <th scope="col" className="text-xs font-medium text-gray-900 px-6 py-2 text-left">
                                        Barangay
                                    </th>
                                    <th scope="col" className="text-xs font-medium text-gray-900 px-6 py-2 text-left">
                                        No. of Projects
                                    </th>

                                    {/* <th scope="col" className="text-xs font-medium text-gray-900 px-6 py-2 text-left">
                                                    Action
                                                </th> */}
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
                                {(brgys.length && !isLoading) && brgys.map((item, i) => (
                                    <tr key={i} className="bg-white border-b transition duration-300 ease-in-out hover:bg-gray-100">
                                        <td className="text-xs text-gray-900 font-light px-6 py-2 whitespace-nowrap capitalize">
                                            {item.brgy}
                                        </td>
                                        <td className="text-xs text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                                            {item.count}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : null}

            </div>

        </div>
    )
}

export default Projects
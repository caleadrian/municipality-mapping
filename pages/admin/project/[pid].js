import React, { useRef, useState, useEffect } from 'react'
import AdminHeader, { LayoutStyle, AdminContentLayout } from '../../../components/AdminHeader'
import { useRouter } from 'next/router'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Map, Source, Layer, Popup, NavigationControl, Marker } from 'react-map-gl'
import { MapPinIcon, ArrowPathIcon } from '@heroicons/react/24/solid'
import { addDoc, doc, collection, serverTimestamp, getDoc, setDoc } from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL, } from "firebase/storage"
import { db, storage } from '../../../firebase/config'
import Image from 'next/image'
import { XMarkIcon } from '@heroicons/react/24/solid'

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const accessToken = process.env.NEXT_PUBLIC_ACCESS_TOKEN

function Project() {
    const map = useRef()
    const router = useRouter()
    const { pid } = router.query

    // form states
    const [title, setTitle] = useState('')
    const [desc, setDesc] = useState('')
    const [startDate, setStartDate] = useState(new Date("yyyy-MM-dd"))
    const [endDate, setEndDate] = useState(new Date("yyyy-MM-dd"))
    const [totalCost, setTotalCost] = useState(0)
    const [file, setFile] = useState('')
    const [inputFile, setInputFile] = useState('')
    const [status, setStatus] = useState('finished')
    const [lng, setLng] = useState('')
    const [lat, setLat] = useState('')
    const [progresspercent, setProgresspercent] = useState()
    const [isLoading, setIsLoading] = useState(false)
    const [imgUrl, setImgUrl] = useState()
    const [mode, setMode] = useState('add')

    useEffect(() => {
        if (pid === 'new') {
            setMode('add')

        } else {
            getProject(pid).then(
                (data) => {
                    if (data) {
                        setMode('edit')
                        setTitle(data.title)
                        setDesc(data.title)
                        setLat(data.coordinates.lat)
                        setLng(data.coordinates.lng)
                        setStartDate(data.startDate ? data.startDate : new Date("yyyy-MM-dd"))
                        setEndDate(data.targetDate ? data.targetDate : new Date("yyyy-MM-dd"))
                        setTotalCost(data.totalCost)
                        setStatus(data.status)
                        setImgUrl(data?.file?.url ? data.file.url : '')
                        setInputFile(data?.file?.name ? data.file.name : '')
                    }
                }
            )
        }
    }, [pid]);

    const getProject = async (id = 0) => {
        try {
            const myDoc = doc(db, 'Projects', id)
            return await getDoc(myDoc).then((doc) => {
                if (doc.exists) {
                    return doc.data()
                } else {
                    return []
                }
            }).catch((error) => {
                console.log(error.message)
                return []
            })
        } catch (err) {
        }

    }

    const handlePreview = () => {
        notify()
        map.current.flyTo(
            {
                center: [lng, lat],
                zoom: 14,
                duration: 1500,
                essential: true
            }
        )
    }

    const handleOnMark = (event) => {
        const { lng, lat } = event.lngLat
        setLng(lng)
        setLat(lat)
    }

    const handleSetFile = (e) => {
        e.preventDefault()
        const _file = e.target.files[0]
        if (!_file) {
            setImgUrl(null)
            return;
        } else {
            setFile(_file)
            setInputFile(e.target.value)
            setImgUrl(URL.createObjectURL(_file))
        }


    }

    const addProj = () => {
        const toastId = toast.loading("Saving your new project", {
            position: 'top-center'
        })

        if (file && inputFile) {
            const storageRef = ref(storage, `files/${file?.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on("state_changed",
                (snapshot) => {
                    const progress =
                        Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                    setProgresspercent(progress);
                },
                (error) => {
                    alert(error);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((url) => {

                        const docData = {
                            title: title,
                            description: desc,
                            coordinates: {
                                lng: lng,
                                lat: lat
                            },
                            file: {
                                url: url,
                                name: file?.name
                            },
                            startDate: startDate,
                            targetDate: endDate,
                            totalCost: totalCost,
                            status: status,
                            createdAt: serverTimestamp(),
                            feedbacks: [],
                            createdBy: 'uid'
                        }

                        addDoc(collection(db, 'Projects'), docData)
                            .then(() => {
                                setTitle('')
                                setDesc('')
                                setLat('')
                                setLng('')
                                setFile('')
                                setInputFile('')
                                setIsLoading(false)
                                toast.update(toastId, { render: "Project saved successfully", type: "success", isLoading: false, autoClose: 3000, position: 'top-center' })
                            }).catch((err) => {
                                toast.update(toastId, { render: "Error while saving", type: "error", isLoading: false, autoClose: 3000, position: 'top-center' })
                                console.log('Error while saving, Please report the issue!', err)
                            })
                    });
                }
            );
        } else {



            const docData = {
                title: title,
                description: desc,
                coordinates: {
                    lng: lng,
                    lat: lat
                },
                startDate: startDate,
                targetDate: endDate,
                totalCost: totalCost,
                status: status,
                createdAt: serverTimestamp(),
                feedbacks: [],
                createdBy: 'uid'
            }

            addDoc(collection(db, 'Projects'), docData)
                .then(() => {
                    setTitle('')
                    setDesc('')
                    setLat('')
                    setLng('')
                    setFile('')
                    setInputFile('')
                    setIsLoading(false)
                    toast.update(toastId, { render: "Project saved successfully", type: "success", isLoading: false, autoClose: 3000, position: 'top-center' })
                }).catch((err) => {
                    toast.update(toastId, { render: "Error while saving", type: "error", isLoading: false, autoClose: 3000, position: 'top-center' })
                    console.log('Error while saving, Please report the issue!', err)
                })
        }
    }

    const editProj = () => {
        const toastId = toast.loading("Updating your new project", {
            position: 'top-center'
        })
        if (file && inputFile) {
            const storageRef = ref(storage, `files/${file?.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on("state_changed",
                (snapshot) => {
                    const progress =
                        Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                    setProgresspercent(progress);
                },
                (error) => {
                    alert(error);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((url) => {

                        const docData = {
                            title: title,
                            description: desc,
                            coordinates: {
                                lng: lng,
                                lat: lat
                            },
                            file: {
                                url: url,
                                name: file?.name
                            },
                            startDate: startDate,
                            targetDate: endDate,
                            totalCost: totalCost,
                            status: status,
                            updatedAt: serverTimestamp(),
                            updatedBy: 'uid'
                        }

                        setDoc(doc(db, 'Projects', pid), docData, { merge: true })
                            .then(() => {
                                setIsLoading(false)
                                toast.update(toastId, { render: "Project saved successfully", type: "success", isLoading: false, autoClose: 3000, position: 'top-center' })
                            }).catch((err) => {
                                toast.update(toastId, { render: "Error while saving", type: "error", isLoading: false, autoClose: 3000, position: 'top-center' })
                                console.log('Error while saving, Please report the issue!', err)
                            })
                    });
                }
            );
        } else {
            const docData = {
                title: title,
                description: desc,
                coordinates: {
                    lng: lng,
                    lat: lat
                },
                startDate: startDate,
                targetDate: endDate,
                totalCost: totalCost,
                status: status,
                updatedAt: serverTimestamp(),
                updatedBy: 'uid'
            }

            if (!imgUrl) {
                docData.file = {}
            }

            setDoc(doc(db, 'Projects', pid), docData, { merge: true })
                .then(() => {
                    setIsLoading(false)
                    toast.update(toastId, { render: "Project updated successfully", type: "success", isLoading: false, autoClose: 3000, position: 'top-center' })
                }).catch((err) => {
                    toast.update(toastId, { render: "Error while saving", type: "error", isLoading: false, autoClose: 3000, position: 'top-center' })
                    console.log('Error while saving, Please report the issue!', err)
                })
        }
    }

    const handleSaveProject = (e) => {
        e.preventDefault();
        setIsLoading(true)

        if (mode === 'add') {
            addProj()
        } else if (mode === 'edit') {
            editProj()
        } else {
            return;
        }
    }

    const handleRemoveFile = () => {
        setImgUrl('')
        setFile('')
        setInputFile('')
    }


    return (
        <div className={LayoutStyle}>
            <AdminHeader></AdminHeader>
            <AdminContentLayout>

                <div>
                    <h1 className='font-serif font-medium text-3xl mb-3'>
                        {pid === 'new' ? 'Add New Project' : 'Edit Project'}
                    </h1>
                    <div className='flex flex-grow sm:gap-x-3 sm:flex-row flex-col-reverse space-y-reverse space-y-5'>

                        <div className='flex-1 flex'>

                            <form
                                onSubmit={(e) => handleSaveProject(e)}
                                className='flex-1 flex-grow p-2 flex flex-col space-y-4'>
                                <div className='flex flex-col'>
                                    <label className='text-sm font-bold text-gray-600 mb-0.5' htmlFor='title'>
                                        Title *
                                    </label>
                                    <input
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder='Enter project title'
                                        className='border border-gray-300 rounded-sm px-2 py-1.5 text-sm'
                                        id='title' type='text' />
                                </div>

                                <div className='flex flex-col'>
                                    <label className='text-sm font-bold text-gray-600 mb-0.5' htmlFor='desc'>
                                        Description
                                    </label>
                                    <textarea
                                        value={desc}
                                        onChange={(e) => setDesc(e.target.value)}
                                        id='desc'
                                        placeholder='Enter project description'
                                        rows={4}
                                        className='border border-gray-300 rounded-sm px-2 py-1.5 text-sm'>
                                    </textarea>
                                </div>

                                <div className='flex flex-row justify-between gap-x-3'>
                                    <div className='flex flex-col flex-1'>
                                        <label className='text-sm font-bold text-gray-600 mb-0.5' htmlFor='date'>
                                            Start Date
                                        </label>
                                        <input
                                            value={startDate && startDate}
                                            max={new Date(endDate, "yyyy-MM-dd")}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            required
                                            placeholder='Enter project title'
                                            className='border border-gray-300 rounded-sm px-2 py-1.5 text-sm'
                                            id='date' type='date' />
                                    </div>
                                    <div className='flex flex-col flex-1'>
                                        <label className='text-sm font-bold text-gray-600 mb-0.5' htmlFor='date'>
                                            Target Date
                                        </label>
                                        <input
                                            value={endDate && endDate}

                                            onChange={(e) => setEndDate(e.target.value)}
                                            min={new Date(startDate, "yyyy-MM-dd")}
                                            required
                                            placeholder='Enter project title'
                                            className='border border-gray-300 rounded-sm px-2 py-1.5 text-sm'
                                            id='date' type='date' />
                                    </div>
                                </div>

                                <div className='flex flex-col'>
                                    <label className='text-sm font-bold text-gray-600 mb-0.5' htmlFor='title'>
                                        Total Cost
                                    </label>
                                    <input
                                        required
                                        value={totalCost}
                                        onChange={(e) => setTotalCost(e.target.value)}
                                        placeholder='Enter project title'
                                        className='border border-gray-300 rounded-sm px-2 py-1.5 text-sm'
                                        id='title' type='number' />
                                </div>

                                <div className='flex flex-col'>
                                    <label className='text-sm font-bold text-gray-600 mb-0.5' htmlFor='status'>
                                        Status
                                    </label>
                                    <select
                                        onChange={(e) => setStatus(e.target.value)}
                                        value={status}
                                        className='border border-gray-300 rounded-sm px-2 py-1.5 text-sm' id="status" placeholder='Select project status'>
                                        <option value="cancelled">Cancelled</option>
                                        <option value="ongoing">Ongoing</option>
                                        <option value="finished">Finished</option>
                                    </select>
                                </div>


                                <div className='flex flex-col'>
                                    <label className='text-sm font-bold text-gray-600 mb-0.5' htmlFor='lng'>
                                        Coordinates *
                                    </label>
                                    <div className='flex flex-row flex-grow gap-x-3'>
                                        <div className='flex-1 flex-col flex'>
                                            <input
                                                step='any'
                                                required
                                                value={lng}
                                                min={-180}
                                                max={180}
                                                onChange={(e) => setLng((e.target.value > 180 || e.target.value < -180) ? e.target.value.slice(0, -1) : e.target.value)}
                                                placeholder='Longitude'
                                                className='border border-gray-300 rounded-sm px-2 py-1.5 text-sm appearance-none'
                                                id='lng' type='number' />
                                            <span className='mt-1 text-xs text-gray-500'>
                                                Longitude range: -180 - 180
                                            </span>
                                        </div>

                                        <div className='flex-1 flex-col flex'>
                                            <input
                                                step='any'
                                                required
                                                value={lat}
                                                min={-90}
                                                max={90}
                                                onChange={(e) => setLat((e.target.value > 90 || e.target.value < -90) ? e.target.value.slice(0, -1) : e.target.value)}
                                                placeholder='Latitude'
                                                className='flex-1 border border-gray-300 rounded-sm px-2 py-1.5 text-sm appearance-none'
                                                id='lat' type='number' />
                                            <span className='mt-1 text-xs text-gray-500'>
                                                Latitude range: -90 - 90
                                            </span>
                                        </div>

                                    </div>
                                </div>

                                <div className='flex flex-col'>
                                    {imgUrl && (<div className='relative bg-gray-100 h-40 rounded-md overflow-hidden transition'>
                                        <button
                                            title='Remove Picture'
                                            onClick={() => handleRemoveFile()}
                                            type='button' className='absolute right-2 top-2 bg-blue-500 rounded-full p-1 z-10 cursor-pointer hover:bg-blue-400'>
                                            <XMarkIcon className='h-4 w-4 text-white'></XMarkIcon>
                                        </button>
                                        <Image src={imgUrl} alt='test' layout='fill' objectFit='contain' priority={true} />
                                    </div>
                                    )}
                                    <label className="text-sm font-bold text-gray-600 mb-0.5" htmlFor="file_input">
                                        Upload file
                                    </label>
                                    <input
                                        onChange={(e) => handleSetFile(e)}
                                        accept=".png,.jpeg,.jpg"
                                        className="form-control cursor-pointer border border-gray-300 rounded-sm p-1.5 text-sm" aria-describedby="file_input_help" id="file_input" type="file" />
                                    <span className="mt-1 text-xs text-gray-500" id="file_input_help">PNG, JPG or JPEG.</span>
                                </div>

                                <div className='flex flex-row justify-end gap-x-3'>
                                    <button
                                        disabled={!lng || !lat}
                                        type='button'
                                        onClick={() => handlePreview()}
                                        className='text-gray-600 bg-gradient-to-t from-gray-200 to-white border px-5 py-2 rounded-md hover:opacity-90 text-sm shadow disabled:opacity-50 disabled:cursor-not-allowed'>
                                        Preview
                                    </button>
                                    <button
                                        type='submit'
                                        className='bg-gradient-to-t from-blue-600 to-blue-500 text-white border px-6 py-2 rounded-md hover:opacity-90 text-sm shadow flex flex-row items-center justify-center min-w-[79px]'>
                                        {isLoading ? (
                                            <ArrowPathIcon className='h-5 w-5 text-white animate-spin'></ArrowPathIcon>
                                        ) : 'Save'}
                                    </button>
                                </div>
                            </form>

                        </div>

                        <div className='flex-1'>
                            <div className='border-2 border-black'>
                                <Map
                                    onClick={e => handleOnMark(e)}
                                    // interactiveLayerIds={geojson && ['line', 'point']}
                                    ref={map}
                                    mapboxAccessToken={accessToken}
                                    initialViewState={{
                                        longitude: 121.81065054090598,
                                        latitude: 16.89841970415851,
                                        zoom: 8
                                    }}
                                    id='map'
                                    style={{ height: '26rem', position: 'relative', zIndex: 0 }}
                                    mapStyle='mapbox://styles/mapbox/streets-v9'
                                >
                                    <NavigationControl position='top-left' />
                                    <Marker onDragEnd={e => handleOnMark(e)} draggable longitude={lng} latitude={lat} anchor="bottom" >
                                        <MapPinIcon className='h-8 w-8 text-red-600'></MapPinIcon>
                                    </Marker>
                                </Map>
                            </div>
                        </div>

                    </div>
                </div>
            </AdminContentLayout>
            <ToastContainer
                pauseOnHover={false} />
        </div>
    )
}

export default Project
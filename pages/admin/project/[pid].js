import React, { useRef, useState } from 'react'
import AdminHeader, { LayoutStyle, AdminContentLayout } from '../../../components/AdminHeader'
import { useRouter } from 'next/router'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Map, Source, Layer, Popup, NavigationControl, Marker } from 'react-map-gl'
import { MapPinIcon, ArrowPathIcon } from '@heroicons/react/24/solid'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL, } from "firebase/storage"
import { db, storage } from '../../../firebase/config'

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
    const [file, setFile] = useState('')
    const [inputFile, setInputFile] = useState('')
    const [lng, setLng] = useState('')
    const [lat, setLat] = useState('')
    const [progresspercent, setProgresspercent] = useState()
    const [isLoading, setIsLoading] = useState(false)

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
        if (!_file) return;
        setFile(_file)
        setInputFile(e.target.value)

    }

    const handleSaveProject = (e) => {
        e.preventDefault();
        setIsLoading(true)
        const toastId = toast.loading("Saving your new project", {
            position: 'top-center'
        })

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
                        file: url,
                        createdAt: serverTimestamp(),
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
                                    <label className="text-sm font-bold text-gray-600 mb-0.5" htmlFor="file_input">
                                        Upload file
                                    </label>
                                    <input
                                        required
                                        value={inputFile}
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
import { useState, useEffect, useRef, useCallback } from "react"
import 'mapbox-gl/dist/mapbox-gl.css'
import { Map, Source, Layer, Popup, GeolocateControl, NavigationControl } from 'react-map-gl'
import { kml } from "@tmcw/togeojson"
import Select from 'react-select'
import ClickAwayListener from 'react-click-away-listener'
import CustomCheckbox from "../components/CustomCheckbox"
import * as turf from "@turf/turf"
import { ExclamationCircleIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid'
import { MapPinIcon } from '@heroicons/react/24/solid'
import { Duration } from "luxon"
import { absoluteUrl } from "../utils/helper"
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import Image from 'next/image'
import Link from 'next/link'
import { Rating } from 'react-simple-star-rating'
import { isMobile } from 'react-device-detect';

export default function Home({ data }) {

  const accessToken = process.env.NEXT_PUBLIC_ACCESS_TOKEN
  const [geojson, setGeojson] = useState(null)
  const [_geojson, _setGeojson] = useState(null)
  const [selected, setSelected] = useState('en')
  const [selectedCoords, setSelectedCoords] = useState()
  const [_options, _setOptions] = useState([])
  const [options, setOptions] = useState([])
  const [showPopup, setShowPopup] = useState(false)
  const [directionResult, setDirectionResult] = useState()

  const [myCoordinates, setMyCoordinates] = useState()
  const [mapIsLoaded, setMapIsLoaded] = useState(false)
  const map = useRef()

  const [isHideControls, setIsHideControls] = useState(false)

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
        label: doc.data().title,
        value: doc.id,
        createdAt: doc.data().createdAt.toDate(),
        uid: doc.id,
        category: 'project'
      }
    })
    //sort from latest to oldest
    projects.reverse((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    setProjectList(projects)
    setIsLoading(false)
  }

  const geolocateControlRef = useCallback((ref) => {
    if (mapIsLoaded) {
      if (ref) {
        ref.trigger();
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkboxFilters = [
    {
      label: 'Brgy', category: 'Brgy'
    },
    {
      label: 'Brgy Road', category: 'BrgyRoad'
    },
    {
      label: 'Sitio', category: 'Sitio'
    },
    {
      label: 'Municipal Road', category: 'MunicipalRoad'
    },
    {
      label: 'National Road', category: 'NationalRoad'
    },
    {
      label: 'Provincial Road', category: 'ProvincialRoad'
    },
    {
      label: 'River And Creek', category: 'RiverAndCreek'
    },
    {
      label: 'Projects', category: 'project'
    }
  ]

  useEffect(() => {
    _setOptions(data.files)
    if (data.files) {
      console.log('api sucess')
    } else {
      console.log('api failed')
    }
  }, [data])

  const lineLayer = {
    'id': 'line',
    'type': 'line',
    'source': 'line',
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      'line-color': '#FBD065',
      'line-width': 7
    }
  }

  const pointLayer = {
    'id': 'point',
    'type': 'circle',
    'source': 'point',
    paint: {
      'circle-radius': 8,
      'circle-color': 'rgb(74,222,128)',
      'circle-stroke-color': 'white',
      'circle-stroke-width': 3
    }
  }

  const outlineLayer = {
    'id': 'outline',
    'type': 'fill',
    'layout': {},
    'paint': {
      'fill-color': '#9CC0F9', // blue color fill
      'fill-outline-color': 'white'
    }
  }


  const loadKML = (file, category) => {
    const _map = map.current.getMap()

    fetch(file)
      .then((response) => {
        return response.text()
      })
      .then((xml) => {
        const d = kml(new DOMParser().parseFromString(xml, 'text/xml'))
        const type = d.features[0].geometry.type
        let coordsIndex = 0
        let coords = null

        if (type === 'LineString') {
          coordsIndex = getMiddleCoords(d.features[0].geometry.coordinates)
          coords = d.features[0].geometry.coordinates[coordsIndex].slice(0, -1)
          _map.setLayoutProperty('line', 'visibility', 'visible')
          _map.setLayoutProperty('point', 'visibility', 'none')
          _map.setLayoutProperty('outline', 'visibility', 'none')


        } else if (type === 'Point') {
          coords = d.features[0].geometry.coordinates.slice(0, -1)
          _map.setLayoutProperty('point', 'visibility', 'visible')
          _map.setLayoutProperty('line', 'visibility', 'none')
          _map.setLayoutProperty('outline', 'visibility', 'none')
        } else if (type === 'Polygon') {

          coordsIndex = getMiddleCoords(d.features[0].geometry.coordinates[0])
          coords = d.features[0].geometry.coordinates[0][coordsIndex].slice(0, -1)
          _map.setLayoutProperty('outline', 'visibility', 'visible')
          _map.setLayoutProperty('line', 'visibility', 'none')
          _map.setLayoutProperty('point', 'visibility', 'none')
        }

        if (coords.length) {
          setGeojson(d)
          setSelectedCoords(
            {
              ...d,
              center: coords,
              category: category
            }
          )

          map.current.flyTo(
            {
              center: coords,
              zoom: isMobile ? 13 : 15,
              duration: 1500,
              essential: true
            }
          )
          setShowPopup(true)
        }
      })
  }

  const getMiddleCoords = (coordinates = []) => {
    if (coordinates.length <= 1) {
      return 0
    } else {
      return Math.floor(coordinates.length / 2)
    }
  }

  const handleSelect = (e) => {
    setSelected(e)

    if (e?.category === 'project') {
      const _map = map.current.getMap()
      const coords = [e.coordinates.lng, e.coordinates.lat]
      const d = {
        type: 'FeatureCollection',
        features: [
          {
            geometry: {
              coordinates: [e.coordinates.lng, e.coordinates.lat],
              type: 'Point'
            },
            properties: {
              name: e.title,
              category: e.category,
              imgUrl: e.file?.url,
              id: e.uid,
              desc: e.description,
              averageRating: e.feedbacks.reduce((acc, array) => acc + array.rating, 0) / e.feedbacks.length,
              totalFeedbacks: e.feedbacks.length
            },
            type: 'Feature'
          }
        ]
      }

      _map.setLayoutProperty('point', 'visibility', 'visible')
      _map.setLayoutProperty('line', 'visibility', 'none')
      _map.setLayoutProperty('outline', 'visibility', 'none')
      setGeojson(d)
      setSelectedCoords({ ...d, center: coords })
      map.current.flyTo(
        {
          center: coords,
          zoom: 15,
          duration: 1500,
          essential: true
        }
      )
      setShowPopup(true)

    } else if (e?.category) {
      loadKML(e.value, e.category)

    }
  }

  const handleShowPopup = useCallback(event => {
    const feature = event.features && event.features[0];

    if (feature) {
      setShowPopup(true)
    }
  }, [])

  const handleSelectFilterCategory = (isCheck, category) => {
    if (isCheck) {
      if (category !== 'project') {
        const f = _options.filter(item => item.category === category)
        setOptions(prev => [...prev, ...f])
      } else {
        // add projects
        projectList.sort((a, b) => {
          const textA = a.label.toUpperCase()
          const textB = b.label.toUpperCase()
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        })
        setOptions(prev => [...prev, ...projectList])
      }

    } else {
      setOptions(prev => prev.filter(item => item.category !== category))
    }
  }

  const handleShowLocation = () => {
    const btn = document.querySelector('button.mapboxgl-ctrl-geolocate')
    btn.click()
  }

  const getNearestToOrigin = () => {
    try {
      const target = [myCoordinates.longitude, myCoordinates.latitude]
      let bakedPoints = []
      const type = geojson.features[0].geometry.type

      if (type === 'LineString') {
        bakedPoints = geojson.features[0].geometry.coordinates.map(c => {
          return turf.point([c[0], c[1]])
        })
      } else if (type === 'Polygon') {
        bakedPoints = geojson.features[0].geometry.coordinates[0].map(c => {
          return turf.point([c[0], c[1]])
        })
      } else {
        return [geojson.features[0].geometry.coordinates[0], geojson.features[0].geometry.coordinates[1]]
      }

      const points = turf.featureCollection(bakedPoints)
      const nearest = turf.nearestPoint(target, points)
      return nearest.geometry.coordinates

    } catch (err) {
      return err.message
    }

  }

  const calculateDistance = async (from = [], to = [], type) => {
    const _from = from.join(',')
    const _to = to.join(',')
    const url = `https://api.mapbox.com/directions/v5/mapbox/${type}/${_from};${_to}?alternatives=false&continue_straight=false&geometries=geojson&overview=full&steps=false&access_token=${accessToken}`

    let response = await fetch(url)

    if (response.ok) {
      const _map = map.current.getMap()

      let json = await response.json()
      setDirectionResult(json)

      _map.setLayoutProperty('line', 'visibility', 'visible')

      if (_map.getSource('start')) {
        _map.getSource('start').setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: from
          }
        });
      } else {
        _map.addLayer({
          id: 'start',
          type: 'circle',
          source: {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Point',
                coordinates: from
              }
            }
          },
          paint: {
            'circle-radius': 10,
            'circle-color': '#223b53',
            'circle-stroke-color': 'white',
            'circle-stroke-width': 1,
            'circle-opacity': 0.5
          }
        });
      }

      if (_map.getSource('route')) {
        _map.getSource('route').setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: json.routes[0].geometry.coordinates
          }
        });
      }
      // otherwise, we'll make a new request
      else {
        _map.addLayer({
          id: 'route',
          type: 'line',
          source: {
            type: 'geojson',
            lineMetrics: true,

            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: json.routes[0].geometry.coordinates
              }
            }
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3887be',
            'line-width': 7,
            'line-opacity': 0.8,
            'line-gradient': [
              'interpolate',
              ['linear'],
              ['line-progress'],
              0,
              'blue',
              0.5,
              'royalblue',
              0.8,
              'cyan'
            ]
          }
        });
      }


      console.log('distance', (json.routes[0].distance / 1000).toFixed(2), 'km')
    } else {
      console.log("HTTP-Error: " + response.status)
    }

  }

  const durationToReadable = (duration = 0) => {
    // const min = Math.floor(json.routes[0].duration / 60)
    const min = Math.floor(duration / 60)
    const obj = Duration.fromMillis(min * 60000).shiftTo("hours", "minutes").toObject()
    return `${obj.hours} ${obj.hours > 1 ? 'hours' : 'hour'}, ${obj.minutes} ${obj.minutes > 1 ? 'minutes' : 'minute'}`
  }

  return (
    <div className={`max-w-7xl bg-mesh mx-auto h-screen relative ${selectedCoords && selectedCoords.features[0].properties?.category === 'project' ? 'project' : ''}`}>

      {/* floating controls */}
      <div
        className="p-3 xs:py-1 pb-5 xs:pb-2 absolute bg-opacity-90 sm:w-[310px] z-50 sm:m-5 rounded-md flex-1 bg-white xs:bottom-0 xs:rounded-none xs:bg-opacity-60 xs:backdrop-blur-sm xs:w-full">

        {/* toggle */}
        <div
          onClick={() => setIsHideControls(!isHideControls)}
          className="absolute right-1 -top-10 bg-white p-2 rounded-sm sm:hidden">
          {isHideControls ? (
            <ChevronUpIcon className="h-6 w-6"></ChevronUpIcon>
          ) : (
            <ChevronDownIcon className="h-6 w-6"></ChevronDownIcon>
          )}
        </div>

        {/* all content */}
        <div className={`${isHideControls && 'hidden'}`}>
          <div className="relative flex-col gap-y-10">
            <div>
              <span className="text-xs text-gray-500">Search for location</span>
              <Select
                isClearable={true}
                className="text-sm xs:text-xs capitalize"
                id="custom" instanceId="custom"
                defaultValue={selected}
                onChange={(e) => handleSelect(e)}
                options={options}
                noOptionsMessage={() => 'No result'}
                placeholder='Select ...'>
              </Select>
            </div>

            <div className="flex-col gap-y-3">
              <span className="text-xs text-gray-500">Filter by category</span>
              <div className="flex flex-wrap gap-x-5 gap-y-3 xs:gap-y-1.5">
                {
                  checkboxFilters.map((item, key) => (
                    <CustomCheckbox
                      key={key}
                      selectFilterCategory={handleSelectFilterCategory}
                      label={item.label} category={item.category}>
                    </CustomCheckbox>
                  ))
                }

              </div>
            </div>
          </div>

          <div className="h-[1px] w-full bg-gray-200 my-4 xs:my-2"></div>

          {myCoordinates ? (
            <div className="flex-col flex space-y-1.5">

              <div className="flex-col space-y-2 xs:space-y-1">
                {/* your location */}
                <div className="flex flex-grow gap-x-2 items-center">
                  <div className="text-xs
                 text-gray-700 mb-1">
                    <MapPinIcon className="h-5 w-5 text-blue-700"></MapPinIcon>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 px-2 py-1 rounded-md w-full xs:p-1.5">
                    <div className="text-xs font-bold">
                      Your location
                    </div>
                    <div className="text-xs text-gray-400 font-light xs:hidden">
                      [{myCoordinates.longitude}, {myCoordinates.latitude}]
                    </div>
                  </div>
                </div>

                {/* destination */}
                <div className="flex flex-grow gap-x-2 items-center">
                  <div className="text-xs
                 text-gray-700 mb-1">
                    <MapPinIcon className="h-5 w-5 text-green-400"></MapPinIcon>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 px-2 py-1 rounded-md w-full xs:p-1.5">
                    <div className="text-xs font-bold">
                      {geojson ? geojson.features[0].properties.name : ' - '}
                    </div>
                    <div className="text-xs text-gray-400 font-light xs:hidden">
                      {geojson && JSON.stringify(getNearestToOrigin())}
                    </div>
                  </div>
                </div>
                {(!myCoordinates || !geojson) && (
                  <div className="text-xs text-red-400 flex gap-x-1 items-center">
                    <ExclamationCircleIcon className="h-5 w-5 text-red-600" />
                    Select destination
                  </div>
                )}
              </div>


              <div>
                {directionResult && (
                  // travel time section
                  <div className="bg-slate-800 text-white rounded-sm px-3 py-2 flex-col">
                    <div className="text-xs text-gray-300">🚘 Travel time and distance by
                      <span className="font-bold ml-1">Driving</span>
                    </div>
                    <div className="ml-5 xs:flex xs:flex-row xs:items-center xs:gap-x-2">
                      <div className="text-sm font-bold">{durationToReadable(directionResult.routes[0].duration)}</div>
                      <div className="text-xs font-light">
                        {(directionResult.routes[0].distance / 1000).toFixed(2)} km
                      </div>
                    </div>

                  </div>
                )}
              </div>

              <button
                className="bg-blue-500 text-white w-full font-medium rounded-sm text-xs py-2.5 hover:bg-opacity-80 disabled:bg-opacity-80 disabled:cursor-not-allowed"
                disabled={!myCoordinates || !geojson}
                onClick={() => calculateDistance([myCoordinates.longitude, myCoordinates.latitude], getNearestToOrigin(), 'driving')}>
                Get Direction
              </button>

            </div>
          ) : (
            <div className="flex-1">
              <div className="flex items-start gap-x-1">
                <ExclamationCircleIcon className="h-6 w-6 text-blue-600" />
                <div className="flex-col">
                  <div className="text-sm font-semibold mt-[1px]">Location required</div>
                  <div className="text-xs">App needs your current location to calculate the distance.
                    <button onClick={() => handleShowLocation()} className="text-blue-600 font-medium hover:opacity-70 ml-1">
                      Show location
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

      </div>

      <Map
        onLoad={() => setMapIsLoaded(true)}
        interactiveLayerIds={geojson && ['line', 'point']}
        onMouseEnter={handleShowPopup}
        ref={map}
        mapboxAccessToken={accessToken}
        initialViewState={{
          longitude: 121.81065054090598,
          latitude: 16.89841970415851,
          zoom: 8
        }}
        id='map'
        style={{ height: '100vh', position: 'relative', zIndex: 0 }}
        mapStyle='mapbox://styles/mapbox/streets-v9'
      >
        <NavigationControl position={isMobile ? 'top-left' : 'top-right'} />

        <Source id='my-data' type='geojson' data={geojson}>
          <Layer interactive={true} {...lineLayer} />
          <Layer interactive={true} {...outlineLayer} />
          <Layer interactive={true} {...pointLayer} />
        </Source>

        {showPopup && (
          <Popup
            closeButton={false}
            longitude={selectedCoords.center[0]}
            latitude={selectedCoords.center[1]}
            anchor="bottom"
            onClose={() => setShowPopup(false)}>
            <ClickAwayListener onClickAway={() => showPopup ? setShowPopup(false) : null}>
              {
                selectedCoords.features[0].properties?.category === 'project' ? (
                  <div className="flex flex-col p-0">
                    {selectedCoords.features[0].properties.imgUrl && (
                      <div className="relative min-h-[120px] bg-gray-200 opacity-80">
                        <Image src={selectedCoords.features[0].properties.imgUrl}
                          alt={selectedCoords.features[0].properties.name}
                          layout='fill' objectFit='cover' />
                      </div>
                    )}


                    <div className="px-5 xs:px-3.5 py-3 xs:py-2 xs:pb-0 flex flex-col">
                      <div className="text-lg xs:text-base font-medium font-sans hover:opacity-80">
                        <Link href={'/' + selectedCoords.features[0].properties.id}>
                          {selectedCoords.features[0].properties.name}
                        </Link>
                      </div>
                      <div className="text-gray-500">
                        {selectedCoords.features[0].properties.desc}
                      </div>
                      <div>
                        <div className='text-xs text-gray-400 flex flex-row items-center gap-x-1'>
                          {selectedCoords.features[0].properties.averageRating ? selectedCoords.features[0].properties.averageRating : 0}
                          <Rating
                            readonly
                            initialValue={selectedCoords.features[0].properties.averageRating ? selectedCoords.features[0].properties.averageRating : 0}
                            size={18}
                            allowFraction
                          />
                          ({selectedCoords.features[0].properties.totalFeedbacks})
                        </div>
                      </div>
                    </div>
                    <div className="px-5 xs:px-3.5 pb-3 xs:pb-2 flex flex-row justify-end">
                      <Link href={'/' + selectedCoords.features[0].properties.id + '#feedbackForm'}>
                        <button className="font-sans font-medium text-xs text-blue-600">
                          Send feedback
                        </button>
                      </Link>

                    </div>
                  </div>
                ) : (
                  <div className="px-5 py-2">
                    <div className="text-sm font-medium font-sans text-center capitalize">
                      {selectedCoords.category === 'Brgy' && (
                        <div className="relative w-full">
                          <Image className="scale-150" src={`/logos/${selectedCoords.features[0].properties.name}.png`}
                            alt={selectedCoords.features[0].properties.name}
                            height={130} width={130} objectFit='cover' />
                        </div>
                      )}
                      {selectedCoords.features[0].properties.name}
                    </div>
                  </div>
                )
              }

            </ClickAwayListener>
          </Popup>
        )}

        <GeolocateControl
          trackUserLocation={true}
          onGeolocate={(e) => setMyCoordinates({ longitude: e.coords.longitude, latitude: e.coords.latitude })}
          showAccuracyCircle={false} ref={() => geolocateControlRef()} />

      </Map>

    </div>
  )
}

// This gets called on every request
export const getServerSideProps = async ({ req, query }) => {
  const { protocol, host } = absoluteUrl(req)
  const url = `${protocol}//${host}/api/hello`
  // Fetch data from external API
  const res = await fetch(url)
  const data = await res.json()

  // Pass data to the page via props
  return { props: { data } }
}

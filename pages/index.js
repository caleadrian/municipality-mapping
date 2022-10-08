import { useState, useEffect, useRef, useCallback } from "react"
import 'mapbox-gl/dist/mapbox-gl.css'
import { Map, Source, Layer, Popup, GeolocateControl } from 'react-map-gl'
import { kml } from "@tmcw/togeojson"
import Select from 'react-select'
import ClickAwayListener from 'react-click-away-listener'
import CustomCheckbox from "../components/CustomCheckbox"
import * as turf from "@turf/turf"
import { ExclamationCircleIcon } from '@heroicons/react/24/solid'
import { MapPinIcon } from '@heroicons/react/24/solid'
import { Duration } from "luxon"
import { absoluteUrl } from "../utils/helper"

export default function Home({ data }) {

  const accessToken = process.env.NEXT_PUBLIC_ACCESS_TOKEN
  const [geojson, setGeojson] = useState(null)
  const [_geojson, _setGeojson] = useState(null)
  const [selected, setSelected] = useState('en')
  const [selectedCoords, setSelectedCoords] = useState({})
  const [_options, _setOptions] = useState([])
  const [options, setOptions] = useState([])
  const [showPopup, setShowPopup] = useState(false)
  const [directionResult, setDirectionResult] = useState()

  const [myCoordinates, setMyCoordinates] = useState()
  const [mapIsLoaded, setMapIsLoaded] = useState(false)
  const map = useRef()

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
    }
  ]

  useEffect(() => {
    _setOptions(data.files)
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
      'line-color': 'red',
      'line-width': 8,
      'line-opacity': 0.9
    }
  }

  const pointLayer = {
    'id': 'point',
    'type': 'circle',
    'source': 'point',
    paint: {
      'circle-radius': 10,
      'circle-color': '#223b53',
      'circle-stroke-color': 'white',
      'circle-stroke-width': 1,
      'circle-opacity': 0.5
    }
  }

  const outlineLayer = {
    'id': 'outline',
    'type': 'fill',
    'layout': {},
    'paint': {
      'fill-color': 'red', // blue color fill
      'fill-opacity': 0.5
    }
  }


  const loadKML = (file) => {
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
    loadKML(e.value)
  }

  const handleShowPopup = useCallback(event => {
    const feature = event.features && event.features[0];

    if (feature) {
      setShowPopup(true)
    }
  }, [])

  const handleSelectFilterCategory = (isCheck, category) => {
    if (isCheck) {
      const f = _options.filter(item => item.category === category)
      setOptions(prev => [...prev, ...f])
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
            'line-width': 5,
            'line-opacity': 0.75
          }
        });
      }


      console.log('distance', (json.routes[0].distance / 1000).toFixed(2), 'km')
    } else {
      alert("HTTP-Error: " + response.status)
    }

  }

  const durationToReadable = (duration = 0) => {
    // const min = Math.floor(json.routes[0].duration / 60)
    const min = Math.floor(duration / 60)
    const obj = Duration.fromMillis(min * 60000).shiftTo("hours", "minutes").toObject()
    return `${obj.hours} ${obj.hours > 1 ? 'hours' : 'hour'}, ${obj.minutes} ${obj.minutes > 1 ? 'minutes' : 'minute'}`
  }

  return (
    <div className='max-w-7xl bg-red-100 mx-auto h-screen relative'>

      {/* floating controls */}
      <div
        className="p-3 pb-5 absolute bg-opacity-90 w-[310px] z-10 m-5 rounded-md flex-1 bg-white">
        <div className="relative flex-col gap-y-10">
          <div>
            <span className="text-xs text-gray-500">Search for location</span>
            <Select
              className="text-sm capitalize"
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
            <div className="flex flex-wrap gap-x-5 gap-y-3">
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

        <div className="h-[1px] w-full bg-gray-200 my-4"></div>

        <div className="">

          {myCoordinates ? (
            <div className="flex-col space-y-2">

              <div className="flex flex-grow gap-x-2 items-center">
                <div className="text-xs
                 text-gray-700 mb-1">
                  <MapPinIcon className="h-5 w-5 text-blue-700"></MapPinIcon>
                </div>
                <div className="bg-blue-50 border border-blue-200 px-2 py-1 rounded-md w-full">
                  <div className="text-xs font-bold">
                    Your location
                  </div>
                  <div className="text-xs text-gray-400 font-light">
                    [{myCoordinates.longitude}, {myCoordinates.latitude}]
                  </div>
                </div>
              </div>

              <div className="flex flex-grow gap-x-2 items-center">
                <div className="text-xs
                 text-gray-700 mb-1">
                  <MapPinIcon className="h-5 w-5 text-green-400"></MapPinIcon>
                </div>
                <div className="bg-blue-50 border border-blue-200 px-2 py-1 rounded-md w-full">
                  <div className="text-xs font-bold">
                    {geojson ? geojson.features[0].properties.name : ' - '}
                  </div>
                  <div className="text-xs text-gray-400 font-light">
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

              {directionResult && (
                <div className="bg-slate-800 text-white rounded-sm px-3 py-2 flex-col">
                  <div className="text-xs text-gray-300">🚘 Travel time and distance by
                    <span className="font-bold ml-1">driving</span>
                  </div>
                  <div className="ml-5">
                    <div className="text-sm font-bold">{durationToReadable(directionResult.routes[0].duration)}</div>
                    <div className="text-xs font-light">
                      {(directionResult.routes[0].distance / 1000).toFixed(2)} km
                    </div>
                  </div>

                </div>
              )}

              <button
                className="bg-blue-500 text-white w-full font-medium rounded-sm text-xs py-2.5 hover:bg-opacity-80 disabled:bg-opacity-80 disabled:cursor-not-allowed"
                disabled={!myCoordinates || !geojson}
                onClick={() => calculateDistance([myCoordinates.longitude, myCoordinates.latitude], getNearestToOrigin(), 'driving')}>
                Show Distance
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
        {/* {geojson && (
         
        )} */}

        <Source id='my-data' type='geojson' data={geojson}>
          <Layer interactive={true} {...lineLayer} />
          <Layer interactive={true} {...outlineLayer} />
          <Layer interactive={true} {...pointLayer} />
        </Source>

        {/* <Source id='my-data' type='geojson' data={_geojson}>
          <Layer {...directionLineLayer} />
        </Source> */}


        {showPopup && (

          <Popup
            closeButton={false}
            longitude={selectedCoords.center[0]}
            latitude={selectedCoords.center[1]}
            anchor="bottom"
            onClose={() => setShowPopup(false)}>
            <ClickAwayListener onClickAway={() => showPopup ? setShowPopup(false) : null}>
              <div>
                {selectedCoords.features[0].properties.name}
              </div>
            </ClickAwayListener>
          </Popup>
        )}

        <GeolocateControl
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

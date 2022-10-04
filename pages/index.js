import { useState, useEffect, useRef, useCallback } from "react"
import 'mapbox-gl/dist/mapbox-gl.css'
import { Map, Source, Layer, Popup } from 'react-map-gl'
import { kml } from "@tmcw/togeojson"
import Select from 'react-select'
import ClickAwayListener from 'react-click-away-listener'

export default function Home({ data }) {

  const accessToken = process.env.NEXT_PUBLIC_ACCESS_TOKEN
  const [geojson, setGeojson] = useState(null)
  const [selected, setSelected] = useState('en')
  const [selectedCoords, setSelectedCoords] = useState({})
  const [options, setOptions] = useState(data.files)
  const [showPopup, setShowPopup] = useState(false)
  const map = useRef()

  const lineLayer = {
    'id': 'line',
    'type': 'line',
    'source': 'line',
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      'line-color': '#ed6498',
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

        console.log(d)

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

  return (
    <div className='max-w-7xl bg-red-500 mx-auto h-screen relative'>

      {/* floating controls */}
      <div
        className="p-3 absolute bg-gray-100 w-[310px] h-[25rem] z-10 m-5 rounded-md">
        <Select
          className="text-sm"
          id="custom" instanceId="custom"
          defaultValue={selected}
          onChange={(e) => handleSelect(e)}
          options={options}
          noOptionsMessage={() => 'No result'}
          placeholder='Select ...'
        />
      </div>


      <Map
        interactiveLayerIds={['line', 'point']}
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
        mapStyle='mapbox://styles/mapbox/streets-v11'
      >
        {/* {geojson && (
         
        )} */}

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
              <div>
                {selectedCoords.features[0].properties.name}
              </div>
            </ClickAwayListener>
          </Popup>
        )}

      </Map>

    </div>
  )
}

// This gets called on every request
export async function getServerSideProps() {
  // Fetch data from external API
  const res = await fetch(`http://localhost:3000/api/hello`)
  const data = await res.json()

  // Pass data to the page via props
  return { props: { data } }
}

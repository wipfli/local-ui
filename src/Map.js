import React, { useRef, useState, useEffect } from 'react';

import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

import { IconButton, Typography } from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'
import RemoveIcon from '@material-ui/icons/Remove'
import Box from '@material-ui/core/Box'
import Link from '@material-ui/core/Link'

import MapTrace from './MapTrace'

import myBestStyle from './style.json'

const getStyleWithUrl = (style, url) => {
    const newStyle = { ...style }
    newStyle.sources.openmaptiles.url = url.replace(/\/$/, '') + '/data/v3.json'
    newStyle.glyphs = url.replace(/\/$/, '') + '/fonts/{fontstack}/{range}.pbf'
    return newStyle
}

const Map = ({
    viewportWidth,
    viewportHeight,
    tileserverUrl,
    data,
    index,
    callbackIndex
}) => {

    const [zoom, setZoom] = useState(10)
    const [map, setMap] = useState(null)
    const mapContainerRef = useRef(null)

    const zoomIn = () => {
        if (map) {
            map.setZoom(zoom + 1)
            setZoom(zoom + 1)
        }
    }

    const zoomOut = () => {
        if (map) {
            map.setZoom(zoom - 1)
            setZoom(zoom - 1)
        }
    }

    const balloonPoints = data.longitude.map((value, index) => {
        return [value, data.latitude[index]]
    })

    useEffect(() => {
        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: getStyleWithUrl(myBestStyle, tileserverUrl),
            center: [data.longitude[index], data.latitude[index]],
            zoom: zoom,
            attributionControl: false
        })

        map.dragRotate.disable()
        map.touchZoomRotate.disableRotation()

        map.fitBounds([balloonPoints[0], balloonPoints[balloonPoints.length - 1]], { padding: 50 })

        map.on('move', () => {
            setZoom(map.getZoom())
        })

        map.on('load', () => {
            map.resize()
        })

        setMap(map)

    }, [])

    useEffect(() => {
        if (map) {
            map.resize()
        }
    }, [viewportWidth, viewportHeight])

    return (
        <div>
            <div
                ref={mapContainerRef}
                style={{
                    position: 'absolute',
                    width: (viewportWidth - 1),
                    height: (viewportHeight - 1),
                    overflow: 'hidden'
                }}
            />

            <div style={{
                position: 'absolute',
                right: 0,
                top: 0,
                padding: 10
            }}>
                <Box display="flex" flexDirection="column">
                    <IconButton onClick={zoomIn}>
                        <AddIcon />
                    </IconButton>
                    <IconButton onClick={zoomOut}>
                        <RemoveIcon />
                    </IconButton>
                </Box>
            </div>

            <div style={{
                position: 'absolute',
                right: 0,
                bottom: 0
            }}>
                <Box display="flex" justifyContent="flex-end" mx={1} color="text.secondary">
                    <Typography variant="caption">
                        <Link color="inherit" href="https://openmaptiles.org/">©OpenMapTiles </Link>
                        <Link color="inherit" href="https://www.openstreetmap.org/about/">©OpenStreetMap </Link>
                    </Typography>
                </Box>
            </div>

            <MapTrace
                map={map}
                name="balloon"
                points={balloonPoints}
                speed={data.speed}
                heading={data.heading}
                index={index}
                callbackIndex={callbackIndex}
                color="#3498db"
                historyVisible={true}
                imagePath="./balloon.png"
            />
        </div>
    )

}

export default Map
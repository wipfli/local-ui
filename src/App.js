import React, { useState, useEffect } from 'react'

import timespace from '@mapbox/timespace'

import time from './time.json'
import climb from './climb.json'
import speedKmh from './speed.json'
import altitude from './altitude.json'
import heading from './heading.json'
import latitude from './latitude.json'
import longitude from './longitude.json'

import IconButton from '@material-ui/core/IconButton'
import ShowChartIcon from '@material-ui/icons/ShowChart'

import Plots from './Plots'
import Chips from './Chips'
import Map from './Map'

const tileserverUrl = 'https://ballometer.io/tiles/'

const speed = speedKmh.map(value => value / 3.6)

const N = altitude.length

const App = () => {

    const [viewportHeight, setViewportHeight] = useState(window.innerHeight)
    const [viewportWidth, setViewportWidth] = useState(window.innerWidth)

    
    const [data, setData] = useState({
        altitude: altitude.slice(0, Math.floor(N / 2)),
        speed: speed.slice(0, Math.floor(N / 2)),
        heading: heading.slice(0, Math.floor(N / 2)),
        climb: climb.slice(0, Math.floor(N / 2)),
        time: time.slice(0, Math.floor(N / 2)),
        longitude: longitude.slice(0, Math.floor(N / 2)),
        latitude: latitude.slice(0, Math.floor(N / 2))
    })

    const [maxIndex, setMaxIndex] = useState(data.altitude.length - 1)

    const [index, setIndex] = useState(maxIndex)

    const [displayPlots, setDisplayPlots] = useState(false)

    const utcOffset = timespace.getFuzzyLocalTimeFromPoint(
        data.time[index] * 1000, [data.longitude[index], data.latitude[index]]).utcOffset()

    useEffect(() => {
        const handleResize = () => {
            setViewportHeight(window.innerHeight)
            setViewportWidth(window.innerWidth)
        }
        window.addEventListener('resize', handleResize)
        handleResize()
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
        
        const interval = setInterval(() => {
            setMaxIndex(maxIndex => maxIndex + 1 < N ? maxIndex + 1 : maxIndex)
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        
        setData({
            altitude: altitude.slice(0, maxIndex + 1),
            speed: speed.slice(0, maxIndex + 1),
            heading: heading.slice(0, maxIndex + 1),
            climb: climb.slice(0, maxIndex + 1),
            time: time.slice(0, maxIndex + 1),
            longitude: longitude.slice(0, maxIndex + 1),
            latitude: latitude.slice(0, maxIndex + 1)
        })
        if (index === maxIndex - 1) {
            setIndex(maxIndex)
        }
    }, [maxIndex])

    return (
        <div>
            <Map
                viewportWidth={viewportWidth}
                viewportHeight={viewportHeight}
                tileserverUrl={tileserverUrl}
                data={data}
                index={index}
                callbackIndex={setIndex}
            />

            <Chips
                speed={data.speed[index]}
                heading={data.heading[index]}
                altitude={data.altitude[index]}
                climb={data.climb[index]}
                time={data.time[index]}
                utcOffset={utcOffset}
            />

            {displayPlots &&
                <Plots
                    handleClose={() => setDisplayPlots(false)}
                    viewportHeight={viewportHeight}
                    viewportWidth={viewportWidth}
                    data={data}
                    styles={[
                        {
                            id: 'altitude',
                            title: 'Altitude (m)',
                            valueSuffix: ' m',
                            valueDecimals: 0,
                            color: '#1250b0',
                            scaling: 1.0
                        },
                        {
                            id: 'speed',
                            title: 'Speed (km/h)',
                            valueSuffix: ' km/h',
                            valueDecimals: 1,
                            color: '#a352cc',
                            scaling: 3.6
                        },
                        {
                            id: 'heading',
                            title: 'Heading (°)',
                            valueSuffix: '°',
                            valueDecimals: 0,
                            color: '#19730e',
                            scaling: 1.0
                        },
                        {
                            id: 'climb',
                            title: 'Climb (m/s)',
                            valueSuffix: ' m/s',
                            valueDecimals: 1,
                            color: '#f2cc0c',
                            scaling: 1.0
                        }
                    ]}
                    index={index}
                    callbackIndex={setIndex}
                    utcOffset={utcOffset}
                />
            }
            <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                padding: 10
            }}>
                {!displayPlots &&
                    <IconButton onClick={() => setDisplayPlots(true)}>
                        <ShowChartIcon />
                    </IconButton>
                }
            </div>
        </div>
    )
}

export default App


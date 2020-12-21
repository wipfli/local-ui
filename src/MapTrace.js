import { useEffect, useState } from 'react'

import Line from './Line'
import Marker from './Marker'
import Projection from './Projection'

const buildName = name => 'MapTrace_' + name

const findClosest = (points, point) => {
    const distances = points.map(value => {
        return (value[0] - point[0]) ** 2 + (value[1] - point[1]) ** 2
    })
    return distances.indexOf(Math.min(...distances))
}

const MapTrace = ({
    map,
    name,
    points,
    speed,
    heading,
    index,
    callbackIndex,
    color,
    historyVisible,
    imagePath
}) => {

    const [dragPoint, setDragPoint] = useState(points[index])

    // bring marker to the geographic center of the points
    useEffect(() => {
        const mean = (x, y) => 0.5 * (x + y)
        const midPoint = (point1, point2) => {
            return [
                mean(point1[0], point2[0]),
                mean(point1[1], point2[1])
            ]
        }
        const index = findClosest(points, midPoint(points[0], points.slice(-1)[0]))
        callbackIndex(index)
    }, [])

    useEffect(() => {
        callbackIndex(findClosest(points, dragPoint))
    }, [dragPoint])

    return (
        <div>
            <Line
                map={map}
                name={'history_wideclickline_' + buildName(name)}
                points={points}
                color={color}
                opacity={0.0}
                dashed={false}
                lineWidth={32}
                visible={historyVisible}
                behindMarker={buildName(name)}
                onClick={setDragPoint}
            />
            <Line
                map={map}
                name={'history_under_' + buildName(name)}
                points={points}
                color={color}
                opacity={0.5}
                dashed={false}
                visible={historyVisible}
                behindMarker={buildName(name)}
            />
            <Line
                map={map}
                name={'history_over_' + buildName(name)}
                points={points.slice(0, index + 1)}
                color={color}
                opacity={1.0}
                dashed={false}
                visible={historyVisible}
                behindMarker={buildName(name)}
            />
            <Marker
                map={map}
                name={buildName(name)}
                longitude={points[index][0]}
                latitude={points[index][1]}
                onDrag={setDragPoint}
                visible={true}
                imagePath={imagePath}
            />
            <Projection 
                map={map}
                name={buildName(name)}
                point={points[index]}
                speed={speed[index]}
                heading={heading[index]}
                visible={index === points.length - 1}
                color={color}
            />
        </div>
    )
}

export default MapTrace
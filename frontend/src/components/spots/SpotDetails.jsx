import { Marker, Popup } from "react-leaflet";
import BaseMap from "../map/BaseMap";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { publicApiClient } from "../../api";

const SpotDetails = () => {
    const { id } = useParams()
    const [spot, setSpot] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchSpotDetails = async () => {
            try {
                setLoading(true)
                const result = await publicApiClient.get(`kebab_spots/spot_detail/${id}/`)
                setSpot(result.data)
            } catch (error) {
                console.error("Error in fetchSpotDetails", error)
                setSpot(null)
            } finally {
                setLoading(false)
            }
        }
        fetchSpotDetails()
    }, [id])

    if (loading) return <p>Loading...</p>
    if (!spot) return <p>Spot was deleted or had too many complaints.</p>

    const spotCoords = [spot.geometry.coordinates[1], spot.geometry.coordinates[0]]


    return (
        <div>
            <h2>{spot.properties.name}</h2>
            <p>{spot.properties.description}</p>
            <BaseMap center={spotCoords} zoom={13}>
            <Marker position={spotCoords}>
                <Popup>{spot.properties.name}</Popup>
            </Marker>
            </BaseMap>
        </div>
    )

}

export default SpotDetails
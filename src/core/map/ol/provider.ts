import { MapProvider } from "../../map"
import { reproject } from "../../projection"
import OLMap from "ol/Map"
import View from "ol/View"
import { createLayers } from "./layers"
import "ol/ol.css"
import "./layers/all"
import Control from "ol/control/Control"

const OLMapProvider: MapProvider = {
    create: (id, mapConfig) => {
        const projection = mapConfig.projection ?? "EPSG:3857"
        const center = reproject(mapConfig.center, projection)
        const map = new OLMap({
            target: id,
            controls: [],
            view: new View({
                center: [center.x, center.y],
                projection,
                zoom: mapConfig.zoom,
            }),
            layers: createLayers(mapConfig.layers, projection),
        })
        return {
            map,
            setZoom: (zoom) => map.getView().setZoom(zoom),
            getZoom: () => map.getView().getZoom(),
            addControl: (control: unknown) =>
                map.addControl(control as Control),
            removeControl: (control: unknown) =>
                map.removeControl(control as Control),
        }
    },
}

export default OLMapProvider

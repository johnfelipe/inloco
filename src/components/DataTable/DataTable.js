import React from 'react'

// how many columns are visible when used within right sidebar
const COLLAPSED_COLUMNS_COUNT = 3

/**
 * Returns an array of properties' keys to be used as table header
 * @param {Object} layer - Layer data.
 * @param {Array} [layer.table] - An array of strings specifying columns to be shown on the table. It can be undefined or not set.
 * @param {string} [layer.table[]] - A column name.
 * @param {Array} layer.features - Array of returned objects. By default only three objects are loaded when DataTable is used within SidebarRight.
 * @param {Object} layer.features[] - A returned object from GeoServer.
 * @param {Object} layer.features[].properties - An object with keys/values of this feature on GeoServer.
 * @param {boolean} isCollapsed If the table is collapsed (within right sidebar) or expanded (within modal).
 */
const layerHeaders = (layer, isCollapsed) => {
    let headers = []

    // if layer has table columns keyword, indicating which columns need to be shown
    if (layer.table) {
        // just use it
        headers.push(...layer.table)
    } else {
        // Use first object to get properties keys
        headers.push(...Object.keys(layer.features[0].properties))
    }

    // replace _ for spaces
    headers = headers.map(header => header.replace(/_/g, ' '))

    // slice array if needed
    if (isCollapsed) {
        headers = headers.slice(0, COLLAPSED_COLUMNS_COUNT)
    }

    return headers
}

/**
 * Returns an array of features values to be used as table row
 * @param {Object} feature A returned object from GeoServer.
 * @param {Object} feature.properties - An object with keys/values of this feature on GeoServer.
 * @param {Array} headers The headers array to match with feature values
 * @param {string} headers[] A column header, either from layer.table or from layer.features[0].properties
 */
const featureData = ((feature, headers) => {

    // keys_are_written_with_underscores
    let keys = headers.map(header => header.replace(/ /g, '_'))
    let values = []

    // for each key, find it's respective value
    keys.map(key => {
        values.push(feature.properties[key])
    })

    return values
})

/**
 * Renders element
 * @param {Object} param Parameter object being destructured
 * @param {Object} param.layer - Layer data.
 * @param {Array} [param.layer.table] - An array of strings specifying columns to be shown on the table. It can be undefined or not set.
 * @param {string} [param.layer.table[]] - A column name.
 * @param {Array} param.layer.features - Array of returned objects. By default only three objects are loaded when DataTable is used within SidebarRight.
 * @param {Object} param.layer.features[] - A returned object from GeoServer.
 * @param {Object} param.layer.features[].properties - An object with keys/values of this feature on GeoServer.
 * @param {boolean} param.isCollapsed If the table is collapsed (within right sidebar) or expanded (within modal)
 */
const DataTable = ({layer, isCollapsed}) => {

    let headers = layerHeaders(layer, isCollapsed)

    if (!layer.features) {
        return null
    }
    return (
        <table className="data-table">
            <thead>
                <tr>
                    {
                        headers.map((property, index) => {
                            return <th className="data-table--header" key={index}>{property}</th>
                        })
                    }
                </tr>
            </thead>
            <tbody>
                {
                    layer.features.map((feature, indexFeature) => {
                        return <tr className="data-table--row" key={indexFeature}>
                            {
                                featureData(feature, headers).map((property, indexProperty) => {
                                    return <td className="data-table--body" key={indexProperty}>{property}</td>
                                })
                            }
                        </tr>
                    })
                }
            </tbody>
        </table>
    )
}

export default DataTable
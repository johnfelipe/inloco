import React from 'react'
import { DragSource } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import Charts from '../Charts/Charts.js'
import DataTable from '../DataTable/DataTable.js'
import Sinalid from '../Sinalid/Sinalid.js'
import LayerStylesCarouselContainer from '../LayerStylesCarousel/LayerStylesCarouselContainer.js'

const layerSubtitleSource = {
    beginDrag(props) {
        return {id: props.layer.key}
    },
    endDrag(props, monitor) {
        let dragged = props.layer
        let dropResult = monitor.getDropResult()
        if(dropResult){
            let target = dropResult.target
            props.onLayerDrop(dragged, target)
        }
    },
}

function collect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    }
}

const LayerSubtitle = ({
    layer,
    connectDragSource,
    lastClickData,
    isDragging,
    onClearLayerFilter,
    onIconMouseOut,
    onIconMouseOver,
    onLayerClick,
    onLayerDown,
    onLayerDrop,
    onLayerFilterSearch,
    onLayerRemove,
    onLayerUp,
    onLoadParams,
    onOpenLayerFilterModal,
    onOpenModal,
}) => {
    let selectedStyle = layer ? layer.styles[layer.selectedLayerStyleId] : {}
    let layerSubtitleURL = layer ? `/geoserver/plataforma/wms?tiled=true&TRANSPARENT=true&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetLegendGraphic&EXCEPTIONS=application%2Fvnd.ogc.se_xml&FORMAT=image%2Fpng&LAYER=${layer.layerName}&STYLE=${selectedStyle.name}` : ''
    let description = {
        // replace \n for <br>
        __html: layer ? layer.description.replace(/(?:\r\n|\r|\n)/g, '<br />') : ''
    }

    function handleClearLayerFilter() {
        return onClearLayerFilter(layer)
    }

    function handleItemClick() {
        return onLayerClick(layer)
    }

    function handleLayerUp() {
        return onLayerUp(layer)
    }

    function handleLayerDown() {
        return onLayerDown(layer)
    }

    function handleLayerRemove() {
        return onLayerRemove(layer)
    }

    function handleOpenModal() {
        return onOpenModal(layer, lastClickData)
    }

    function handleOpenLayerFilterModal() {
        return onOpenLayerFilterModal(layer)
    }

    let layerItemClassName = 'layer-item'
    if (layer && layer.showInformation) {
        layerItemClassName += ' selected'
    }

    // load filter params from GeoServer
    if (!layer.params && !layer.isLoadingParams) {
        onLoadParams(layer)
    }

    // check if reading filter params from initialization and load them
    if (layer.filterKey && layer.filterValue && !layer.isLoadingFilter && !layer.filteredData) {
        onLayerFilterSearch(layer.name, layer.filterKey, layer.filterValue)
    }

    return connectDragSource(
        <div className={layerItemClassName}>
            <div
                className="layer-item-header"
                onClick={layer => handleItemClick()}
            >
                <h2 className="layer-item-header--title">
                    Grupo: {layer ? layer.menu2.join(' - ') : ''}
                    <small className="layer-item-header--caption">{layer ? layer.title : ''}</small>
                </h2>
                <span className="layer-item-header--icon"></span>
            </div>
            <div className="layer-item-body">
                <div className="layer-item-controls">
                    <button
                        aria-label="Subir camada"
                        className="layer-item-controls-button up"
                        onClick={layer => handleLayerUp()}
                    >
                        <i className="fa fa-chevron-up" aria-hidden="true"></i>
                    </button>
                    <button
                        aria-label="Descer camada"
                        className="layer-item-controls-button down"
                        onClick={layer => handleLayerDown()}
                    >
                        <i className="fa fa-chevron-down" aria-hidden="true"></i>
                    </button>
                    <button
                        aria-label="Remover camada"
                        className="layer-item-controls-button remove"
                        onClick={layer => handleLayerRemove()}
                    >
                        <i className="fa fa-trash-o" aria-hidden="true"></i>
                    </button>
                </div>
                <div className="layer-item--legend">
                    <img className="layer-item--legend-img" src={layerSubtitleURL} alt="" onMouseOver={e => onIconMouseOver(e, layer)} onMouseOut={() => onIconMouseOut(layer)}/>
                </div>
                <div className="layer-item-more-info">
                    <h3 className="layer-item-more-info--title">Exibições da camada</h3>
                    <LayerStylesCarouselContainer layer={layer}/>
                    <div className="layer-item-more-container">
                        <p className="layer-item-more-info--style-title">{selectedStyle.title || ''}</p>
                        <p className="layer-item-more-info--text">{selectedStyle.description || ''}</p>
                    </div>
                    {layer.isLoadingParams ? <p>Aguarde, carregando filtros...</p> : null}
                    {layer.params ?
                        <div className="layer-item-filter">
                            {layer.filterKey && layer.filterValue ?
                                 <div>
                                    <button onClick={handleClearLayerFilter} className="filled">
                                        <span>Remover Filtro</span>
                                        <i className="fa fa-times-circle" aria-hidden="true"></i>
                                    </button>
                                    <h3>Filtros na camada</h3>
                                    <p>Exibindo resultados onde {layer.filterKey} contém "{layer.filterValue}"</p>
                                </div>
                            :
                                <div>
                                    <button onClick={handleOpenLayerFilterModal} className="empty">
                                        <span>Selecionar Filtro</span>
                                        <i className="fa fa-filter" aria-hidden="true"></i>
                                    </button>
                                    <h3>Sem filtro na camada</h3>
                                </div>
                            }
                        </div>
                    : null }
                    {
                        layer.features
                        ? <div className="layer-item-data">
                            <h3 className="layer-item-data--title">Dados do registro</h3>
                            <DataTable layer={layer} isCollapsed={true}/>
                            <a role="button"
                                className="layer-item-data--more-info"
                                onClick={handleOpenModal}>ver mais</a>
                            <Charts layer={layer}/>
                            {layer.id === 'plataforma_inst_sinalid' ?
                                <Sinalid layer={layer}/>
                            : ''}
                        </div>
                        : ''
                    }
                </div>
            </div>
        </div>
    )
}

// Set component as a drag source. It says that it is draggable.
// We also need to pass three parameters: "layerSubtitle" is a string
// that works as an id to match source with destiny.
export default DragSource("layerSubtitle", layerSubtitleSource, collect)(LayerSubtitle)

import React from 'react'
import MenuItem from './MenuItem'
import { withContentRect } from 'react-measure'

const Menu = withContentRect(['bounds', 'client', 'scroll'])(({
    measureRef,
    measure,
    contentRect,
    menuItems,
    menuTitle,
    parentMenuTitle,
    submenus,
    layers,
    onLayerClick,
    onMenuItemClick,
    onMouseOver,
    onScroll,
    sidebarLeftWidth,
    sidebarLeftHeight,
    sidebarLeftScrollTop,
    onMouseOut,
    onUntoggleAllClick,
    selected,
    currentLevel,
    allMenuItems,
    idMenu
}) => {
    /**
     * This function gets an unordered array of layers indexes and returns
     * an ordered array of indexes
     * @param {number[]} layersIndexSet - this is a subset of layers indexes.
     * @param {object[]} allLayers - this is an array containing all layers.
     * @return {number[]} ordered array of layers indexes
     */
    function orderLayersAlphabetically (layersIndexSet, allLayers) {
        var layersSet = []
        // check if it is an array of layers indexes
        if(layersIndexSet.length > 0 && typeof layersIndexSet[0] === 'number'){
            for (var i = 0; i < allLayers.length; i++) {
                for (var j = 0; j < layersIndexSet.length; j++) {
                    /*
                        find the object on allLayers array that
                        corresponds to each layer index on layersIndexSet
                        and then push them into layersSet array
                    */
                    if (i === layersIndexSet[j]) {
                        layersSet.push(allLayers[i])
                    }
                }
            }

            // order layersSet array by it's title property
            var layersSetOrdered = layersSet.sort(function(a, b){
                return (a.title > b.title) ? 1 : (a.title < b.title) ? -1 : 0
            })
            layersIndexSet = []

            /*
                for each item in the ordered array, get its index property key
                and push it into a brand new layersIndexSet
            */
            for (var k = 0; k < layersSetOrdered.length; k++) {
                if (layersSetOrdered[k]) {
                    layersIndexSet.push(layersSetOrdered[k].key)
                }
            }
        }
        return layersIndexSet
    }

    if(!allMenuItems){
        allMenuItems = menuItems
    }

    // add a selected class to the menu if it is selected
    let menuClassName = "menu menu-container" + (selected ? ' selected' : '')

    // check if there are items hidden by search
    let itemsNotMatched = false
    if(menuItems){
        for (let menuItem of menuItems) {
            if (menuItem.title && menuItem.match === false) {
                itemsNotMatched = true
            }
        }
    }

    // check if this menu has submenu children selected
    if (allMenuItems) {
        allMenuItems.forEach(oneMenuItem => {
            // first find this menu
            if (oneMenuItem.idMenu === idMenu) {
                // if it is selected
                if (oneMenuItem.selected) {
                    // check if any of this menu's submenu is selected
                    oneMenuItem.submenus.forEach(submenu => {
                        allMenuItems.forEach(thisMenuItem => {
                            if(thisMenuItem.idMenu === submenu && thisMenuItem.selected){
                                // if it is selected, add class to father's menu
                                menuClassName += ' has-submenu-opened'
                            }
                        })
                    })
                }
            }
        })
    }

    /**
     * Returns a JSX MenuItem call for a given item
     * @param {object} item menu item
     * @return {string} JSX markup for the component
     */
    function menu(item) {
        if(item.isSubMenu){
            return null
        }
        return (
            <MenuItem
                item={item}
                layers={layers}
                onLayerClick={onLayerClick}
                onMenuItemClick={onMenuItemClick}
                onItemClick={Number.isInteger(item) ? onLayerClick : onMenuItemClick}
                onMouseOver={onMouseOver}
                sidebarLeftWidth={sidebarLeftWidth}
                sidebarLeftHeight={sidebarLeftHeight}
                onMouseOut={onMouseOut}
                parentMenuTitle={menuTitle}
                currentLevel={currentLevel}
                allMenuItems={menuItems}
                key={Number.isInteger(item) ? item : item.idMenu}
            />
        )
    }

    /**
     * Returns a JSX MenuItem call for a given submenu
     * @param {object} submenu menu's submenu
     * @return {string} JSX markup for the component
     */
    function subMenu(submenu) {
        let thisMenu

        allMenuItems.forEach( (relativeItem) => {
            if (submenu === relativeItem.idMenu) {
                thisMenu = relativeItem
            }
        })

        return (
            <MenuItem
                item={thisMenu}
                layers={layers}
                onLayerClick={onLayerClick}
                onMenuItemClick={onMenuItemClick}
                onItemClick={Number.isInteger(thisMenu) ? onLayerClick : onMenuItemClick}
                onMouseOver={onMouseOver}
                sidebarLeftWidth={sidebarLeftWidth}
                sidebarLeftHeight={sidebarLeftHeight}
                onMouseOut={onMouseOut}
                parentMenuTitle={menuTitle}
                currentLevel={currentLevel}
                allMenuItems={allMenuItems}
                key={thisMenu.idMenu}
            />
        )
    }

    /**
     * Renders the component.
     *
     * @return {string} - HTML markup for the component
     */
    return (
        <ul ref={measureRef} className={menuClassName} onScroll={
            (e) => {
                if(window.myTimeout){
                    clearTimeout(window.myTimeout)
                }
                // creating timeout, so the scroll event does not fire every time
                window.myTimeout = setTimeout(() => {
                    measure() // make react-measure recalculate measures

                    // get menu container and it's scrollTop value
                    let menuContainer = document.getElementsByClassName('sidebar-left')[0].childNodes[1]
                    let currentScrollValue = menuContainer.scrollTop

                    // we need to make scrollTop align with the top of an item
                    // so we round the scrollTop value considering the 33 element height
                    const elementHeight = 33
                    let roundedScrollValue = Math.round( currentScrollValue / elementHeight ) * elementHeight

                    // reset menu container scrollTop value to the rounded value
                    menuContainer.scrollTop = roundedScrollValue

                    // if the roundedScroll value is higher than the maximum scrollTop value possible,
                    // the scrollTop will not change and our menu and tooltips will be desynchronized
                    var newScrollValue = menuContainer.scrollTop
                    var deltaScrollValue = roundedScrollValue - newScrollValue
                    // so we need to check if roundedScrollValue equals newScrollValue
                    if(deltaScrollValue !== 0){
                        // if is not equal, than we need to correct the height of menu container
                        var computedHeight = parseInt(window.getComputedStyle(menuContainer, null).height) // get the computed height of menu container
                        computedHeight += deltaScrollValue // add the difference between newScrollValue and roundedScrollValue
                        menuContainer.style.height = computedHeight.toString() + 'px' //set menu container's new corrected height
                    }
                    onScroll(roundedScrollValue)
                }, 100)
            }
        }>
            {
                (!menuTitle && currentLevel > 0 && !itemsNotMatched) ?
                    <li className="menu-item-all-layers" onClick={onUntoggleAllClick}>Todas as camadas</li>
                : ''
            }
            {
                (submenus && submenus.length > 0) ?
                    submenus.map(
                        (submenu) => subMenu(submenu)
                    )
                : ''
            }
            {
                menuItems ? orderLayersAlphabetically(menuItems, layers).map((item) => menu(item)) : ''
            }
        </ul>
    )
})

export default Menu

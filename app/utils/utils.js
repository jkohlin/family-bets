import React from 'react'
import countries from './countries.json'

export function translate(en) {
    return countries[en]
}

export function translateList(list) {
    return list.map(option => {
        return {
            value: option.value,
            label: translate(option.label)
        }
    })
}
/**
 * Description
 * @param {any} value valfritt värde
 * @returns {string} string, number, array, object etc
 */
export function typeOf(value) {
    return Object.prototype.toString
        .call(value)
        .replace(/^\[object\s+([a-z]+)\]$/i, '$1')
        .toLowerCase()
}

/**
 * Description
 * @param {Object} obj
 * @param {function([key, val])} keyFilter
 * @param {function([key, val])} valueFilter
 * @returns {Object}
 */
export const objectFilter = (obj, keyFilter, valueFilter) => {
    let array = Object.entries(obj) // [ [key, value], [key, value] ]
    if (typeof keyFilter === 'function') {
        array = array.filter(keyFilter) // keyFilter([key, value]) => key === 'someKey'
    } else if (Array.isArray(keyFilter)) {
        array = array.filter(([key, value]) => keyFilter.includes(key))
    }
    if (typeof valueFilter === 'function') {
        array = array.filter(valueFilter) // valueFilter([key, value]) => value === 'someValue'
    } else if (Array.isArray(valueFilter)) {
        array = array.filter(([key, value]) => valueFilter.includes(value))
    }
    return array.reduce((acc, [k, v]) => ({ ...acc, [k.split('.')[0]]: v }), {})
}

export function useHasMounted() {
    const [hasMounted, setHasMounted] = React.useState(false)
    React.useEffect(() => {
        setHasMounted(true)
    }, [])
    return hasMounted
}

/**
 * Description Takes a date and a day offset and returns a new date
 * @param {Date} date
 * @param {number} offset number of days to subtract
 * @returns {Date}
 */
export const getOffsetDate = (date, offset) => {
    return new Date(date.setDate(date.getDate() - offset * 7))
}

/**
 * Description
 * @param {{date:Date,offset:number, format:'nice'|'short'|'iso'|'none' }} 
 * @returns {Date}
 */
export const niceDate = ({ date, offset = 0, format = 'nice' }) => {
    const offsetDate = offset ? getOffsetDate(new Date(date), offset) : new Date(date)
    switch (format) {
        case 'nice':
            return offsetDate.toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' })
        case 'short':
            return `${offsetDate.toLocaleDateString('sv-SE', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
        case 'iso':
            return offsetDate.toLocaleDateString('sv-SE')
        case 'none':
        default:
            return offsetDate
    }
}

/**
 * Description Counts how many dates in the array that are from within the offset in minutes. Used to prevent overusing the football api
 * @param {Array} dates array of dates in this form [{ date: '2022-11-14T10:37:49.184873+00:00' },...rest]
 * @param {number} offset in minutes
 * @returns {number} count
 */
export const callsToAPI = (dates, offset) => {
    const now = new Date()
    return dates.filter(({ date }) => {
        const dateObj = new Date(date)
        const diff = now.getTime() - dateObj.getTime()
        return diff < offset * 60 * 1000
    }).length
}

/**
 * Description
 * @param {Array} list Array of objects
 * @param {string} key what key to base the divide on
 * @param {boolean} asIndex if true returns a 2d array
 * @returns {Array|Object}
 */
export const groupBy = (list, key, asIndex) => {
    const grouped = (
        list?.reduce((acc, row) => {
            // acc = {},  row[key] = exv 'SITE' (key='listType') acc.SITE är undefined från början, men propen skapas iom exp=exp och sätts till [] eftersom acc[row[key]] är undefined. Nästa varv finns propen med arrayen med en rad i.
            ; (acc[row[key]] = acc[row[key]] || []).push(row)
            return acc
        }, {}) || {}
    )
    return asIndex ? Object.values(grouped) : grouped
}

// function to display countdown in days, hours, minutes and seconds
export const getTimeRemaining = (endtime) => {
    if ((new Date(endtime).toString() === 'Invalid Date')) return { day: 0, hour: 0, minute: 0, second: 0, total: 0 }
    const total = new Date(Date.parse(endtime) - Date.parse(new Date()))
    const dateTimeFormat = new Intl.DateTimeFormat('sv-SE', { day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })

    const parts = dateTimeFormat.formatToParts(total)
    return parts.reduce((acc, row) => {
        acc[row['type']] = row['type'] === 'day' ? +row['value'] - 1 : +row['value']
        return acc
    }, { total })
    /*return {
    day: '5',
    literal: ':',
    hour: '20',
    minute: '41',
    second: '15'
    } */
}

export const clamp = (num, min, max) => Math.min(Math.max(num, min), max)

export function objectFromArray(array, key) {
    return array.reduce((acc, item) => {
        return { ...acc, [item[key]]: item }
    }, {})
}
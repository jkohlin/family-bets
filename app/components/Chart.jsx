
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { clamp, groupBy, niceDate } from '~/utils/utils'


ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
)

export const options = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top',
        },
        title: {
            display: true,
            text: 'Utveckling',
        },
    },
}
const colorsOfTheRainbow = ['#46baa6', ' #8dc8a6', ' #ded99d', ' #ffa092', ' #ff3e71', ' #6b4a40', ' #c64f24', ' #ffa092', ' #ff8534', ' #f77572', ' #bb8476', ' #55bee7', ' #eb4c55', ' #e3916c', ' #c72a3b', ' #ecfde3', ' #418475']
const darkerColorsOfTheRainbow = ['rgb(64, 165, 148)', 'rgb(255, 255, 102)', 'rgb(153, 102, 255)', 'rgb(255, 51, 51)', 'rgb(51, 153, 255)', 'rgb(255, 153, 0)', 'rgb(102, 255, 51)', 'rgb(255, 153, 204)', 'rgb(153, 153, 153)', 'rgb(102, 0, 102)', 'rgb(153, 255, 153)', 'rgb(255, 255, 0)', 'rgb(255, 255, 255)', 'rgb(255, 255, 255)', 'rgb(255, 255, 255)', 'rgb(255, 255, 255)']




export default function Chart({ data }) {

    const byName = groupBy(data, 'name')
    const names = Object.keys(byName)
    const labels = byName[names[0]].map(({ date }) => niceDate({ date, format: 'short' }))
    const dataset = {
        labels, datasets: Object.values(byName).map((dudesArrayOfDataItems, i) => ({
            label: names[i], data: dudesArrayOfDataItems.reduce((acc, p) => {
                return [...acc, acc[acc.length - 1] + p.points]
            }, [0]), borderColor: colorsOfTheRainbow[i], backgroundColor: darkerColorsOfTheRainbow[i]
        }))
    }
    return <Line options={options} data={dataset} />
}
// an array of 16 rainbow colors

import React, { useState, useEffect } from 'react'
import {
	XYPlot,
	LineSeries,
	makeWidthFlexible,
	XAxis
} from 'react-vis'

import axios from 'axios'
import moment from 'moment'

import 'react-vis/dist/style.css'

const DAY = 'day'
const FIVE_DAYS = '5 days'
const MONTH = 'month'
const SIX_MONTHS = '6 months'
const YEAR = 'year'
const FIVE_YEARS = '5 years'

const FlexibleXYPlot = makeWidthFlexible(XYPlot)

function StockChart (props) {
	const [chartData, setChartData] = useState(null)
	const [timeRange, setTimeRange] = useState(DAY)

	function getXDomain () {
		if (timeRange === DAY && chartData && chartData.length) {
			const date = chartData[0].date

			return [moment(`${date} 09:30`, 'YYYY-MM-DD HH:mm').toDate(), moment(`${date} 16:00`, 'YYYY-MM-DD HH:mm').toDate()]
		}

		return null
	}

	function formattedChartData () {
		if (!chartData) {
			return []
		}

		return chartData
			.filter(chartPoint => chartPoint.average !== null)
			.map(chartPoint => ({
					x: moment(`${chartPoint.date} ${chartPoint.minute}`, 'YYYY-MM-DD HH:mm').toDate(),
					y: chartPoint.average
				}))
			.sort((chartPointA, chartPointB) => chartPointA.x - chartPointB.x)
	}

	async function fetchStockChartData () {
		try {
			const { symbol } = props
			const chartData = (await axios.get(`${process.env.REACT_APP_API_URI}/stocks/chart/day`, {
				params: {
					symbol
				}
			})).data

			return chartData
		} catch (error) {
			console.error(`Error while fetching stock chart data: ${error.message}`)
		}
	}

	async function initializeChart () {
		try {
			const newChartData = await fetchStockChartData()

			setChartData(newChartData)
		} catch (error) {
			console.error(`Error while initializing chart: ${error.message}`)
		}
	}

	useEffect(() => {
		initializeChart()
	}, [props.symbol])

	if (!chartData) {
		return null
	}

	return (
		<div>
			<FlexibleXYPlot
				height={props.height}
				xDomain={getXDomain()}
			>
				<LineSeries
					data={formattedChartData()}
				/>
			</FlexibleXYPlot>
		</div>
	)
}

export default StockChart

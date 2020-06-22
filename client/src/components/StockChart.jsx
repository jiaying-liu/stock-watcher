import React, { useState, useEffect } from 'react'
import {
	XYPlot,
	LineSeries,
	makeWidthFlexible,
	Crosshair
} from 'react-vis'
import {
	Tabs,
	Tab
} from '@material-ui/core'

import axios from 'axios'
import moment from 'moment'
import { formatCurrencyValue } from '../helpers/format-values'
import { grey } from '@material-ui/core/colors'

import 'react-vis/dist/style.css'
import './StockChart.css'

const DAY = 'day'
const FIVE_DAYS = '5 days'
const MONTH = 'month'
const SIX_MONTHS = '6 months'
const YEAR = 'year'
const FIVE_YEARS = '5 years'

const FlexibleXYPlot = makeWidthFlexible(XYPlot)

function StockChart (props) {
	const [chartData, setChartData] = useState(null)
	const [crosshairValues, setCrosshairValues] = useState([])
	const [timeRange, setTimeRange] = useState(DAY)

	function getXDomain () {
		if (timeRange === DAY && chartData && chartData.length) {
			const date = chartData[0].date

			return [moment(`${date} 09:30`, 'YYYY-MM-DD HH:mm').toDate(), moment(`${date} 16:00`, 'YYYY-MM-DD HH:mm').toDate()]
		}

		return null
	}

	function getXType () {
		return timeRange === DAY ? 'time' : 'ordinal'
	}

	function formattedChartData () {
		if (!chartData) {
			return []
		}

		return chartData
			.filter(chartPoint => chartPoint.close !== null)
			.map(chartPoint => {
				const includeTime = timeRange === DAY || timeRange === FIVE_DAYS
				const dateStr = includeTime ? `${chartPoint.date} ${chartPoint.minute}` : `${chartPoint.date}`
				const fromFormat = includeTime ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD'
				const toFormat = includeTime ? 'YYYY-MM-DD hh:mm A' : 'YYYY-MM-DD'
				const momentDate = moment(dateStr, fromFormat)
				const formattedChartPoint = {
					x: momentDate.format(toFormat),
					y: chartPoint.close
				}

				if (timeRange === DAY) {
					formattedChartPoint.x = momentDate.toDate()
				}

				return formattedChartPoint
			})
			.sort((chartPointA, chartPointB) => chartPointA.x - chartPointB.x)
	}

	async function fetchStockChartData () {
		try {
			const { symbol } = props
			let dateAgg = '1d'

			switch (timeRange) {
				case FIVE_DAYS:
					dateAgg = '5d'
					break
				case MONTH:
					dateAgg = '1m'
					break
				case SIX_MONTHS:
					dateAgg = '6m'
					break
				case YEAR:
					dateAgg = '1y'
					break
				case FIVE_YEARS:
					dateAgg = '5y'
			}

			const chartData = (await axios.get(`${process.env.REACT_APP_API_URI}/stocks/chart/${dateAgg}`, {
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
	}, [props.symbol, timeRange])

	if (!chartData) {
		return null
	}

	function onChartMouseLeave () {
		setCrosshairValues([])

		if (props.onChartMouseLeave) {
			this.props.onChartMouseLeave()
		}
	}

	function onChartPointHover (value) {
		setCrosshairValues([value])

		if (props.onChartPointHover) {
			this.props.onChartPointHover(value)
		}
	}

	function onTabChange (event, value) {
		setTimeRange(value)
	}

	function renderCrosshairTooltip () {
		if (crosshairValues.length) {
			const momentDate = moment(crosshairValues[0].x)
			let formattedXValue = momentDate.format('YYYY-MM-DD')

			if (timeRange === DAY) {
				formattedXValue = momentDate.format('hh:mm A')
			} else if (timeRange === FIVE_DAYS) {
				formattedXValue = momentDate.format('YYYY-MM-DD hh:mm A')
			}

			return (
				<Crosshair
					values={crosshairValues}
				>
					<div style={{
						backgroundColor: grey[800]
					}}>
						<p
							style={{
								whiteSpace: 'nowrap',
								color: 'white',
								margin: '4px',
								fontSize: '16px'
							}}
						>
							{formattedXValue}: {formatCurrencyValue(crosshairValues[0].y)}
						</p>
					</div>
				</Crosshair>
			)
		}

		return null
	}

	return (
		<div>
			<FlexibleXYPlot
				height={props.height}
				xDomain={getXDomain()}
				xType={getXType()}
				onMouseLeave={onChartMouseLeave}
			>
				<LineSeries
					data={formattedChartData()}
					onNearestX={onChartPointHover}
				/>
				{renderCrosshairTooltip()}
			</FlexibleXYPlot>
			<Tabs
				value={timeRange}
				onChange={onTabChange}
				indicatorColor="primary"
				textColor="primary"
				className="time-range-tabs"
				style={{ borderBottom: `1px solid ${grey[500]}` }}
			>
				<Tab label="1D" value={DAY} />
				<Tab label="5D" value={FIVE_DAYS} />
				<Tab label="1M" value={MONTH} />
				<Tab label="6M" value={SIX_MONTHS} />
				<Tab label="1Y" value={YEAR} />
				<Tab label="5Y" value={FIVE_YEARS} />
			</Tabs>
		</div>
	)
}

export default StockChart

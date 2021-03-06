import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import axios from 'axios'
import * as d3 from 'd3-format'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { addStockAlert, fetchStockAlerts } from '../actions/stock-alert'
import { fetchCurrentUser } from '../actions/current-user'
import { green } from '@material-ui/core/colors'
import {
	formatLargeCurrencyValue,
	formatCurrencyValue,
	formatLargeNumber,
	formatPercentageValue,
	formatNumberWithComma
} from '../helpers/format-values'

import {
	Grid,
	IconButton,
	Tooltip,
	SvgIcon
} from '@material-ui/core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlusCircle, faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import StockAlertConfigDialog from './StockAlertConfigDialog'
import StockChart from './StockChart'

class StockDetail extends Component {
	constructor () {
		super()
		this.state = {
			stockDetails: null,
			addStockAlertDialogOpen: false
		}

		this.initialize = this.initialize.bind(this)
		this.handleModalClose = this.handleModalClose.bind(this)
		this.onAddStockAlertClick = this.onAddStockAlertClick.bind(this)
		this.onStockAlertSave = this.onStockAlertSave.bind(this)
	}

	componentDidMount () {
		this.initialize()
	}

	componentDidUpdate (prevProps) {
		const prevSymbol = prevProps.match.params.symbol
		const symbol = this.props.match.params.symbol

		if (prevSymbol !== symbol) {
			this.initialize()
		}
	}

	async initialize () {
		try {
			if (!this.props.stockAlerts.length) {
				if (!this.props.currentUser) {
					await this.props.fetchCurrentUser()
				}

				this.props.fetchStockAlerts(this.props.currentUser.id)
			}
	
			const stockDetails = await this.fetchStockDetails()

			this.setState({
				stockDetails
			})
		} catch (error) {
			console.error(`Error while initializing Stock Details: ${error.message}`)
		}
	}

	async fetchStockDetails () {
		try {
			const symbol = this.props.match.params.symbol
			const stockDetails = (await axios.get(`${process.env.REACT_APP_API_URI}/stocks/details`, {
				params: {
					symbol
				}
			})).data

			return stockDetails
		} catch (error) {
			console.error(`Error while fetching stock details: ${error.message}`)
		}
	}

	formatLargeCurrencyValue (value) {
		return d3.format('$.5s')(value).replace(/G/, 'B')
	}

	formatCurrencyValue (value) {
		return d3.format('$,.2f')(value)
	}

	formatLargeNumber (value) {
		return d3.format('.5s')(value).replace(/G/, 'B')
	}

	formatPercentageValue (value) {
		return d3.format('.2%')(value)
	}

	formatNumberWithComma (value) {
		return d3.format(',.2r')(value)
	}

	handleModalClose () {
		this.setState({
			addStockAlertDialogOpen: false
		})
	}

	onAddStockAlertClick () {
		this.setState({
			addStockAlertDialogOpen: true
		})
	}

	async onStockAlertSave (stockAlertConfig) {
		const {
			stockName,
			stockTicker,
			price,
			condition
		} = stockAlertConfig

		try {
			await this.props.addStockAlert({
				stockName,
				stockTicker,
				condition,
				price
			}, this.props.currentUser.id)
			this.handleModalClose()
		} catch (error) {
			console.error(`Error while adding stock alert: ${error.message}`)
		}
	}

	renderDescription () {
		const {
			description,
			ceo,
			employees,
			industry
		} = this.state.stockDetails

		return (
			<div>
				<h2>About</h2>
				<p>{description}</p>
				<Grid
					container
					direction="row"
					justify="flex-start"
					alignItems="center"
					spacing={3}
				>
					<Grid item>
						<b>CEO</b>
						<div>{ceo}</div>
					</Grid>
					<Grid item>
						<b>Industry</b>
						<div>
							{industry}
						</div>
					</Grid>
					<Grid item>
						<b>Employees</b>
						<div>
							{formatNumberWithComma(employees)}
						</div>
					</Grid>
				</Grid>
			</div>
		)
	}

	renderStats () {
		const {
			marketCap,
			volume,
			avgVolume,
			week52High,
			week52Low,
			peRatio,
			dividendYield
		} = this.state.stockDetails

		return (
			<div>
				<h2>Stats</h2>
					<Grid
						container
						direction="row"
						justify="flex-start"
						alignContent="center"
						spacing={3}
					>
						<Grid item>
							<b>Market Cap</b>
							<div>
								{formatLargeCurrencyValue(marketCap)}
							</div>
						</Grid>
						<Grid item>
							<b>Volume</b>
							<div>
								{formatLargeNumber(volume)}
							</div>
						</Grid>
						<Grid item>
							<b>Average Volume</b>
							<div>
								{formatLargeNumber(avgVolume)}
							</div>
						</Grid>
						<Grid item>
							<b>52 Week High</b>
							<div>
								{formatCurrencyValue(week52High)}
							</div>
						</Grid>
						<Grid item>
							<b>52 Week Low</b>
							<div>
								{formatCurrencyValue(week52Low)}
							</div>
						</Grid>
						<Grid item>
							<b>P/E Ratio</b>
							<div>
								{peRatio}
							</div>
						</Grid>
						<Grid item>
							<b>Dividend Yield</b>
							<div>
								{(dividendYield && formatPercentageValue(dividendYield)) || '--'}
							</div>
						</Grid>
					</Grid>
			</div>
		)
	}

	renderAddButton () {
		if (!this.state.stockDetails) {
			return null
		}

		const { stockDetails } = this.state
		const { stockAlerts } = this.props
		const stockDetailTicker = stockDetails.symbol.toLowerCase()
		const hasUserSavedStockAlert = stockAlerts.some(stockAlert => stockAlert.stockTicker.toLowerCase() === stockDetailTicker)

		if (hasUserSavedStockAlert) {
			return (
				<Tooltip
					title="Saved"
					arrow
					style={{ marginLeft: '8px' }}
				>
					<IconButton>
						<SvgIcon
							style={{ color: green[500] }}
						>
							<FontAwesomeIcon
								icon={faCheckCircle}
							/>
						</SvgIcon>
					</IconButton>
				</Tooltip>
			)
		}

		return (
			<Tooltip
				title="Add"
				arrow
				style={{ marginLeft: '8px' }}
			>
				<IconButton
					color="primary"
					onClick={this.onAddStockAlertClick}
				>
					<SvgIcon>
						<FontAwesomeIcon
							icon={faPlusCircle}
						/>
					</SvgIcon>
				</IconButton>
			</Tooltip>
		)
	}

	renderStockTitle () {
		const { name } = this.state.stockDetails

		return (
			<div style={{ display: 'flex' }}>
				<h1>
					{name}
				</h1>
				<div style={{ display: 'flex', alignItems: 'center' }}>
					{this.renderAddButton()}
				</div>
			</div>
		)
	}

	render () {
		if (!this.state.stockDetails) {
			return null
		}

		const {
			name,
			symbol,
			price
		} = this.state.stockDetails

		return (
			<div>
				{this.renderStockTitle()}
				<div style={{ fontSize: '32px' }}>
					{formatCurrencyValue(price)}
				</div>
				<StockChart
					symbol={symbol}
					height={300}
				/>
				{this.renderStats()}
				{this.renderDescription()}
				<StockAlertConfigDialog
					open={this.state.addStockAlertDialogOpen}
					title={`Add Stock Alert for ${name}`}
					stockName={name}
					stockTicker={symbol}
					defaultPrice={price}
					onStockAlertSave={this.onStockAlertSave}
					onClose={this.handleModalClose}
				/>
			</div>
		)
	}
}

function mapStateToProps ({ currentUser, stockAlerts }) {
	return { currentUser, stockAlerts }
}

function mapDispatchToProps (dispatch) {
	return bindActionCreators({
		fetchCurrentUser,
		addStockAlert,
		fetchStockAlerts
	}, dispatch)
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(StockDetail))

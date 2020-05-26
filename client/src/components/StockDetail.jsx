import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import axios from 'axios'
import * as d3 from 'd3-format'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { addStockAlert } from '../actions/stock-alert'

import {
	Grid,
	IconButton
} from '@material-ui/core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons'
import StockAlertConfigDialog from './StockAlertConfigDialog'

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

	async initialize () {
		const stockDetails = await this.fetchStockDetails()

		this.setState({
			stockDetails
		})
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
							{this.formatNumberWithComma(employees)}
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
								{this.formatLargeCurrencyValue(marketCap)}
							</div>
						</Grid>
						<Grid item>
							<b>Volume</b>
							<div>
								{this.formatLargeNumber(volume)}
							</div>
						</Grid>
						<Grid item>
							<b>Average Volume</b>
							<div>
								{this.formatLargeNumber(avgVolume)}
							</div>
						</Grid>
						<Grid item>
							<b>52 Week High</b>
							<div>
								{this.formatCurrencyValue(week52High)}
							</div>
						</Grid>
						<Grid item>
							<b>52 Week Low</b>
							<div>
								{this.formatCurrencyValue(week52Low)}
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
								{(dividendYield && this.formatPercentageValue(dividendYield)) || '--'}
							</div>
						</Grid>
					</Grid>
			</div>
		)
	}

	renderStockTitle () {
		const { name } = this.state.stockDetails

		return (
			<div style={{ display: 'flex' }}>
				<h1>
					{name}
				</h1>
				<IconButton
					color="primary"
					style={{ marginRight: '8px' }}
					onClick={this.onAddStockAlertClick}
				>
					<FontAwesomeIcon
						icon={faPlusCircle}
					/>
				</IconButton>
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
					{this.formatCurrencyValue(price)}
				</div>
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

function mapStateToProps ({ currentUser }) {
	return { currentUser }
}

function mapDispatchToProps (dispatch) {
	return bindActionCreators({
		addStockAlert
	}, dispatch)
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(StockDetail))
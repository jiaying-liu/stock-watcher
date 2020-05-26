import React, { Component } from 'react'
import {
	Autocomplete
} from '@material-ui/lab'
import {
	TextField
} from '@material-ui/core'

import { withRouter } from 'react-router-dom'
import axios from 'axios'

class StockSearchBar extends Component {
	constructor () {
		super()
		this.state = {
			stocks: [],
			filterText: ''
		}

		this.fetchStocks = this.fetchStocks.bind(this)
		this.onInputChange = this.onInputChange.bind(this)
		this.renderInput = this.renderInput.bind(this)
		this.filteredStocks = this.filteredStocks.bind(this)
	}

	componentDidMount () {
		this.fetchStocks()
	}

	getOptionNameForStock (stock) {
		return `${stock.symbol} (${stock.name})`
	}

	filteredStocks () {
		const filterText = this.state.filterText.toLowerCase()
		if (!filterText.length) {
			return []
		}

		const stocks = this.state.stocks
			.filter(stock => (
				stock.symbol.toLowerCase().includes(filterText) ||
				stock.name.toLowerCase().includes(filterText)) ||
				this.getOptionNameForStock(stock).toLowerCase().includes(filterText)
			)
			.sort((a, b) => {
				const aSymbolIndex = a.symbol.toLowerCase().indexOf(filterText)
				const bSymbolIndex = b.symbol.toLowerCase().indexOf(filterText)
				const aNameIndex = a.name.toLowerCase().indexOf(filterText)
				const bNameIndex = b.name.toLowerCase().indexOf(filterText)

				if (aSymbolIndex === bSymbolIndex) {
					return aNameIndex - bNameIndex
				}

				return aSymbolIndex - bSymbolIndex
			})
			.slice(0, 10)

		return stocks
	}

	onInputChange (value) {
		this.setState({
			filterText: value
		})
	}

	onStockSelect (stock) {
		this.props.history.push(`/stocks/${stock.symbol.toLowerCase()}`)
	}

	renderInput (params) {
		return (
			<TextField
				{...params}
				label="Search for stocks"
				variant="outlined"
			/>
		)
	}

	async fetchStocks () {
		try {
			// const stocks = await (await fetch(process.env.REACT_APP_STOCK_LIST_API)).json()
			const result = (await axios.get(`${process.env.REACT_APP_API_URI}/stocks`)).data
			const { stocks } = result

			this.setState({ stocks })
		} catch (error) {
			console.error(`Error while fetching stocks: ${error.message}`)
		}
	}

	render () {
		return (
			<Autocomplete
				inputValue={this.state.filterText}
				onInputChange={(event, value) => this.onInputChange(value)}
				onChange={(event, value) => this.onStockSelect(value) }
				options={this.filteredStocks()}
				getOptionLabel={this.getOptionNameForStock}
				renderInput={this.renderInput}
			/>
		)
	}
}

export default withRouter(StockSearchBar)

import React, { Component } from 'react'
import PropTypes from 'prop-types'

import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Input,
	Select,
	MenuItem,
	Button,
	Grid
} from '@material-ui/core'

class StockAlertConfigDialog extends Component {
	constructor (props) {
		super(props)
		this.state = {
			price: props.defaultPrice || 0,
			condition: props.defaultCondition || 'under'
		}

		this.handleClose = this.handleClose.bind(this)
		this.onPriceChange = this.onPriceChange.bind(this)
		this.onConditionChange = this.onConditionChange.bind(this)
		this.onSaveButtonClick = this.onSaveButtonClick.bind(this)
	}

	isSaveButtonDisabled () {
		const { price } = this.state

		return price === '' || isNaN(price)
	}

	onPriceChange (event) {
		const price = event.target.value

		this.setState({
			price: price ? parseInt(price) : ''
		})
	}

	onConditionChange (event) {
		this.setState({
			condition: event.target.value
		})
	}

	handleClose () {
		if (this.props.onClose) {
			this.props.onClose()
		}
	}

	async onSaveButtonClick () {
		if (this.props.onStockAlertSave) {
			const { stockName, stockTicker } = this.props
			const { price, condition } = this.state

			this.props.onStockAlertSave({
				stockName,
				stockTicker,
				price: price === '' ? 0 : price,
				condition
			})
		}
	}

	renderForm () {
		const { stockName, stockTicker } = this.props
		const { price, condition } = this.state

		return (
			<form>
				<Grid
					container
					direction="row"
					justify="flex-start"
					alignItems="center"
					spacing={3}
				>
					<Grid item>
						<Input
							defaultValue={stockTicker}
							disabled
						/>
					</Grid>
					<Grid item>
						<Input
							defaultValue={stockName}
							disabled
						/>
					</Grid>
				</Grid>
				<Grid
					container
					direction="row"
					justify="flex-start"
					alignItems="center"
					spacing={3}
				>
					<Grid item>
						<Input
							value={price}
							type="number"
							onChange={this.onPriceChange}
						/>
					</Grid>
					<Grid item>
						<Select
							value={condition}
							onChange={this.onConditionChange}
						>
							<MenuItem value="under">
								Under
							</MenuItem>
							<MenuItem value="over">
								Over
							</MenuItem>
						</Select>
					</Grid>
				</Grid>
			</form>
		)
	}

	render () {
		const { title } = this.props

		return (
			<Dialog
				open={this.props.open}
				onClose={this.handleClose}
			>
				<DialogTitle>{title}</DialogTitle>
				<DialogContent style={{ padding: '12px 24px' }}>
					{this.renderForm()}
				</DialogContent>
				<DialogActions>
					<Button onClick={this.handleClose}>
						Cancel
					</Button>
					<Button
						color="primary"
						disabled={this.isSaveButtonDisabled()}
						onClick={this.onSaveButtonClick}
					>
						Save
					</Button>
				</DialogActions>
			</Dialog>
		)
	}
}

StockAlertConfigDialog.propTypes = {
	stockName: PropTypes.string.isRequired,
	stockTicker: PropTypes.string.isRequired,
	defaultPrice: PropTypes.number,
	defaultCondition: PropTypes.string,
	open: PropTypes.bool,
	onClose: PropTypes.func,
	onStockAlertSave: PropTypes.func,
	title: PropTypes.string
}

export default StockAlertConfigDialog

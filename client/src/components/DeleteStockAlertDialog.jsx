import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Button
} from '@material-ui/core'

class DeleteStockAlertDialog extends Component {
	constructor () {
		super()
		this.onClose = this.onClose.bind(this)
		this.onStockAlertDelete = this.onStockAlertDelete.bind(this)
	}

	async onStockAlertDelete () {
		if (this.props.onStockAlertDelete) {
			this.props.onStockAlertDelete()
		}
	}

	onClose () {
		if (this.props.onClose) {
			this.props.onClose()
		}
	}

	render () {
		const { stockAlert } = this.props

		if (stockAlert) {
			const { stockName, stockTicker } = stockAlert
			return (
				<Dialog
					open={this.props.open}
					onClose={this.onClose}
				>
					<DialogTitle>Confirm Delete</DialogTitle>
					<DialogContent>
						Are you sure you want to delete the stock alert for {stockTicker} ({stockName})?
					</DialogContent>
					<DialogActions>
						<Button onClick={this.onClose}>
							Cancel
						</Button>
						<Button
							color='secondary'
							onClick={this.onStockAlertDelete}
						>
							Delete
						</Button>
					</DialogActions>
				</Dialog>
			)
		}

		return null
	}
}

DeleteStockAlertDialog.propTypes = {
	stockAlert: PropTypes.shape({
		id: PropTypes.number.isRequired,
		stockName: PropTypes.string.isRequired,
		stockTicker: PropTypes.string.isRequired
	}).isRequired,
	open: PropTypes.bool,
	onClose: PropTypes.func,
	onStockAlertDelete: PropTypes.func
}

export default DeleteStockAlertDialog

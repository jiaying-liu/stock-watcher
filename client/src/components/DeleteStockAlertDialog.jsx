import React from 'react'
import PropTypes from 'prop-types'
import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Button
} from '@material-ui/core'

function DeleteStockAlertDialog (props) {
	function onStockAlertDelete () {
		if (props.onStockAlertDelete) {
			props.onStockAlertDelete()
		}
	}

	function onClose () {
		if (props.onClose) {
			props.onClose()
		}
	}

	const { stockAlert } = props

	if (stockAlert) {
		const { stockName, stockTicker } = stockAlert
		return (
			<Dialog
				open={props.open}
				onClose={onClose}
			>
				<DialogTitle>Confirm Delete</DialogTitle>
				<DialogContent>
					Are you sure you want to delete the stock alert for {stockTicker} ({stockName})?
				</DialogContent>
				<DialogActions>
					<Button onClick={onClose}>
						Cancel
					</Button>
					<Button
						color='secondary'
						onClick={onStockAlertDelete}
					>
						Delete
					</Button>
				</DialogActions>
			</Dialog>
		)
	}

	return null
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

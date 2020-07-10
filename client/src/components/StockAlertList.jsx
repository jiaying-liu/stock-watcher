import React, { Component } from 'react'
import {
	TableContainer,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	IconButton,
	Menu,
	MenuItem
} from '@material-ui/core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons'
import StockAlertConfigDialog from './StockAlertConfigDialog'
import DeleteStockAlertDialog from './DeleteStockAlertDialog'

import { connect } from 'react-redux'
import { fetchStockAlerts, updateStockAlert, deleteStockAlert } from '../actions/stock-alert'
import { bindActionCreators } from 'redux'
import { withRouter } from 'react-router-dom'
import * as d3 from 'd3-format'

import './StockAlertList.css'

class StockAlertList extends Component {
	constructor () {
		super()
		this.state = {
			selectedStockAlert: null,
			contextMenuAnchorEl: null,
			editStockAlertDialogOpen: false,
			deleteStockAlertDialogOpen: false
		}

		this.onContextMenuButtonClick = this.onContextMenuButtonClick.bind(this)
		this.onContextMenuClose = this.onContextMenuClose.bind(this)
		this.onStockAlertEditClick = this.onStockAlertEditClick.bind(this)
		this.onStockAlertDeleteClick = this.onStockAlertDeleteClick.bind(this)
		this.onEditStockAlertDialogClose = this.onEditStockAlertDialogClose.bind(this)
		this.onStockAlertUpdate = this.onStockAlertUpdate.bind(this)
		this.onDeleteStockAlertDialogClose = this.onDeleteStockAlertDialogClose.bind(this)
		this.onStockAlertDelete = this.onStockAlertDelete.bind(this)
	}

	componentDidMount () {
		this.fetchStockAlerts()
	}

	goToStockDetail (stockTicker) {
		this.props.history.push(`/stocks/${stockTicker.toLowerCase()}`)
	}

	async fetchStockAlerts () {
		try {
			this.props.fetchStockAlerts(this.props.currentUser.id)
		} catch (error) {
			console.error(`Error while fetchin stock alerts: ${error.message}`)
		}
	}

	onEditStockAlertDialogClose () {
		this.setState({
			editStockAlertDialogOpen: false
		})
	}

	onDeleteStockAlertDialogClose () {
		this.setState({
			deleteStockAlertDialogOpen: false
		})
	}

	onStockAlertEditClick () {
		this.setState({
			editStockAlertDialogOpen: true
		})
	}

	async onStockAlertUpdate (stockAlertConfig) {
		const { price, condition } = stockAlertConfig
		const { selectedStockAlert } = this.state

		try {
			await this.props.updateStockAlert(selectedStockAlert.id, price, condition)
			this.onEditStockAlertDialogClose()
			this.onContextMenuClose()
		} catch (error) {
			console.error(`Error while updating stock alert: ${error.message}`)
		}
	}

	onStockAlertDelete () {
		const { selectedStockAlert } = this.state

		try {
			this.onDeleteStockAlertDialogClose()
			this.onContextMenuClose()
			this.props.deleteStockAlert(selectedStockAlert.id)
		} catch (error) {
			console.error(`Error while deleting stock alert: ${error.message}`)
		}
	}

	onStockAlertDeleteClick () {
		this.setState({
			deleteStockAlertDialogOpen: true
		})
	}

	onContextMenuButtonClick (event, stockAlert) {
		event.stopPropagation()
		this.setState({
			selectedStockAlert: stockAlert,
			contextMenuAnchorEl: event.currentTarget
		})
	}

	onContextMenuClose () {
		this.setState({
			selectedStockAlert: null,
			contextMenuAnchorEl: null
		})
	}

	renderTableHead () {
		return (
			<TableHead className='stock-alert-table-header'>
				<TableRow>
					<TableCell>
						Stock
					</TableCell>
					<TableCell>
						Condition
					</TableCell>
					<TableCell>
						Target Price ($)
					</TableCell>
					<TableCell />
				</TableRow>
			</TableHead>
		)
	}

	renderTableBodyRows () {
		return this.props.stockAlerts.map((stockAlert, index) => (
			<TableRow
				key={index}
				className="stock-alert-row"
				onClick={() => this.goToStockDetail(stockAlert.stockTicker)}
			>
				<TableCell>
					{stockAlert.stockTicker}
				</TableCell>
				<TableCell>
					{stockAlert.condition}
				</TableCell>
				<TableCell>
					{d3.format('$,.2f')(stockAlert.price)}
				</TableCell>
				<TableCell
					align="right"
					size='small'
					style={{ width: '10%' }}
				>
					<IconButton
						color='primary'
						onClick={event => this.onContextMenuButtonClick(event, stockAlert)}
					>
						<FontAwesomeIcon
							icon={faEllipsisH}
						/>
					</IconButton>
				</TableCell>
			</TableRow>
		))
	}

	renderTableBody () {
		return (
			<TableBody>
				{this.renderTableBodyRows()}
			</TableBody>
		)
	}

	renderStockAlertList () {
		return (
			<TableContainer>
				<Table>
					{this.renderTableHead()}
					{this.renderTableBody()}
				</Table>
			</TableContainer>
		)
	}

	renderContextMenu () {
		const showContextMenu = Boolean(this.state.contextMenuAnchorEl)
		const { selectedStockAlert, contextMenuAnchorEl } = this.state

		if (showContextMenu && selectedStockAlert) {
			return (
				<Menu
					anchorEl={contextMenuAnchorEl}
					open={showContextMenu}
					onClose={this.onContextMenuClose}
				>
					<MenuItem
						onClick={this.onStockAlertEditClick}
					>
						Edit
					</MenuItem>
					<MenuItem
						onClick={this.onStockAlertDeleteClick}
					>
						Delete
					</MenuItem>
				</Menu>
			)
		} else {
			return null
		}
	}

	renderEditStockAlertDialog () {
		const { editStockAlertDialogOpen, selectedStockAlert } = this.state

		if (selectedStockAlert) {
			const { stockName, stockTicker, price, condition } = selectedStockAlert

			return (
				<StockAlertConfigDialog
					open={editStockAlertDialogOpen}
					title={`Edit Stock Alert for ${stockName}`}
					stockName={stockName}
					stockTicker={stockTicker}
					defaultPrice={price}
					defaultCondition={condition}
					onStockAlertSave={this.onStockAlertUpdate}
					onClose={this.onEditStockAlertDialogClose}
				/>
			)
		}

		return null
	}

	renderDeleteStockAlertDialog () {
		const { deleteStockAlertDialogOpen, selectedStockAlert } = this.state

		if (selectedStockAlert) {
			return (
				<DeleteStockAlertDialog
					open={deleteStockAlertDialogOpen}
					stockAlert={selectedStockAlert}
					onClose={this.onDeleteStockAlertDialogClose}
					onStockAlertDelete={this.onStockAlertDelete}
				/>
			)
		}

		return null
	}

	render () {
		if (!this.props.stockAlerts.length) {
			return <div>You have not saved any stock alerts. Search for a stock and create a stock alert!</div>
		}

		return (
			<div>
				<h3>Stock Alerts</h3>
				{this.renderStockAlertList()}
				{this.renderContextMenu()}
				{this.renderEditStockAlertDialog()}
				{this.renderDeleteStockAlertDialog()}
			</div>
		)
	}
}

function mapStateToProps ({ stockAlerts, currentUser }) {
	return { stockAlerts, currentUser }
}

function mapDispatchToProps (dispatch) {
	return bindActionCreators({
		fetchStockAlerts,
		updateStockAlert,
		deleteStockAlert
	}, dispatch)
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(StockAlertList))

import {
	FETCH_STOCK_ALERTS,
	ADD_STOCK_ALERT,
	UPDATE_STOCK_ALERT,
	DELETE_STOCK_ALERT
} from '../actions/types'

function addStockAlert (stockAlerts, stockAlert) {
	return [...stockAlerts, stockAlert]
}

function updateStockAlert (stockAlerts, stockAlertId, price, condition) {
	const newStockAlerts = stockAlerts.map(stockAlert => ({ ...stockAlert }))
	const stockAlertToUpdate = newStockAlerts.find(stockAlert => stockAlert.id === stockAlertId)

	if (stockAlertToUpdate) {
		stockAlertToUpdate.price = price
		stockAlertToUpdate.condition = condition
	}

	return newStockAlerts
}

function removeStockAlert (stockAlerts, stockAlertId) {
	return stockAlerts.filter(stockAlert => stockAlert.id !== stockAlertId)
}

export default function (state = [], action) {
	switch (action.type) {
		case FETCH_STOCK_ALERTS:
			return action.stockAlerts
		case ADD_STOCK_ALERT:
			return addStockAlert(state, action.stockAlert)
		case UPDATE_STOCK_ALERT:
			const { stockAlertId, price, condition } = action.payload

			return updateStockAlert(state, stockAlertId, price, condition)
		case DELETE_STOCK_ALERT:
			return removeStockAlert(state, action.stockAlertId)
		default:
			return state
	}
}

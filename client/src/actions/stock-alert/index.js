import axios from 'axios'
import {
	FETCH_STOCK_ALERTS,
	ADD_STOCK_ALERT,
	UPDATE_STOCK_ALERT,
	DELETE_STOCK_ALERT
} from '../types'

export function fetchStockAlerts (userId) {
	return async function (dispatch) {
		try {
			const stockAlerts = (
				await axios.get(`${process.env.REACT_APP_API_URI}/users/${userId}/stock-alerts`)
			).data

			dispatch({ type: FETCH_STOCK_ALERTS, stockAlerts })
		} catch (error) {
			throw error
		}
	}
}

export function addStockAlert (stockAlert, userId) {
	return async function (dispatch) {
		try {
			const { stockTicker, stockName, condition, price } = stockAlert
			const stockAlertId = (
				await axios.post(`${process.env.REACT_APP_API_URI}/users/${userId}/stock-alerts`, {
					stockTicker,
					stockName,
					condition,
					price
				})
			).data

			dispatch({ type: ADD_STOCK_ALERT, stockAlert: { ...stockAlert, id: stockAlertId.id }  })
		} catch (error) {
			throw error
		}
	}
}

export function updateStockAlert (stockAlertId, price, condition) {
	return async function (dispatch) {
		try{
			await axios.put(`${process.env.REACT_APP_API_URI}/stock-alerts/${stockAlertId}`, {
				price,
				condition
			})

			dispatch({ type: UPDATE_STOCK_ALERT, payload: {
				price,
				condition,
				stockAlertId
			}})
		} catch (error) {
			throw error
		}
	}
}

export function deleteStockAlert (stockAlertId) {
	return async function (dispatch) {
		try {
			await axios.delete(`${process.env.REACT_APP_API_URI}/stock-alerts/${stockAlertId}`)

			dispatch({ type: DELETE_STOCK_ALERT, stockAlertId })
		} catch (error) {
			throw error
		}
	}
}

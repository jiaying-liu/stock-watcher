import axios from 'axios'
import {
	FETCH_CURRENT_USER,
	LOGOUT_CURRENT_USER
} from '../types'

export function fetchCurrentUser () {
	return async function (dispatch) {
		try {
			const currentUser = (await axios.get(`${process.env.REACT_APP_API_URI}/current-user`)).data
	
			dispatch({ type: FETCH_CURRENT_USER, currentUser })
		} catch (error) {
			console.error(`Error while fetching current user: ${error.message}`)
			throw error
		}
	}
}

export function logoutCurrentUser () {
	return async function (dispatch) {
		try {
			await axios.post(`${process.env.REACT_APP_API_URI}/logout`)

			dispatch({ type: LOGOUT_CURRENT_USER })
		} catch (error) {
			console.error(`Error while logging out current user: ${error.message}`)
			throw error
		}
	}
}

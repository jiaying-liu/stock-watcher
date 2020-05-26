import axios from 'axios'
import {
	FETCH_CURRENT_USER
} from '../types'

export function fetchCurrentUser () {
	return async function (dispatch) {
		try {
			const currentUser = (await axios.get(`${process.env.REACT_APP_API_URI}/current-user`)).data
	
			dispatch({ type: FETCH_CURRENT_USER, currentUser })
		} catch (error) {
			throw error
		}
	}
}

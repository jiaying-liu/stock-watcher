import { FETCH_CURRENT_USER, LOGOUT_CURRENT_USER } from '../actions/types'

export default function (state = null, action) {
	switch (action.type) {
		case FETCH_CURRENT_USER:
			return action.currentUser
		case LOGOUT_CURRENT_USER:
			return null
		default:
			return state
	}
}
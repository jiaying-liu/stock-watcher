import { FETCH_CURRENT_USER } from '../actions/types'

export default function (state = null, action) {
	switch (action.type) {
		case FETCH_CURRENT_USER:
			return action.currentUser
		default:
			return state
	}
}
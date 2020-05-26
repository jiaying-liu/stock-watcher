import { combineReducers } from 'redux'
import currentUser from './current-user'
import stockAlerts from './stock-alerts'

export default combineReducers({
	currentUser,
	stockAlerts
})
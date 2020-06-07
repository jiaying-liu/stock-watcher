import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { fetchCurrentUser } from '../actions/current-user'
import { withRouter } from 'react-router-dom'

import StockAlertList from './StockAlertList'

class Home extends Component {
	async componentDidMount () {
		try {
			if (!this.props.currentUser) {
				await this.props.fetchCurrentUser()

				// for some reason current user could not retrieved
				// and error is not thrown
				if (!this.props.currentUser) {
					throw new Error('Current user does not exist!')
				}
			}
		} catch (error) {
			console.error(`Error while fetching user info: ${error.message}`)
			this.props.history.push('/login')
		}
	}

	render () {
		if (!this.props.currentUser) {
			return <div>Loading...</div>
		}

		return (
			<StockAlertList />
		)
	}
}

function mapStateToProps ({ currentUser }) {
	return { currentUser }
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators({
		fetchCurrentUser
	}, dispatch)
}

export default withRouter(
	connect(mapStateToProps, mapDispatchToProps)(Home)
)

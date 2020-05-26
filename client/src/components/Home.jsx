import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { fetchCurrentUser } from '../actions/current-user'
import { withRouter } from 'react-router-dom'

import StockSearchBar from './StockSearchBar'
import StockAlertList from './StockAlertList'
// import { Container } from '@material-ui/core'

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
			<div style={{ marginTop: '16px'}}>
				<StockSearchBar />
				<div style={{ marginTop: '24px' }}>
					<StockAlertList />
				</div>
			</div>
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

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter, Link } from 'react-router-dom'
import { fetchCurrentUser } from '../actions/current-user'
import { bindActionCreators } from 'redux'

import { AppBar, Button } from '@material-ui/core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserCircle } from '@fortawesome/free-solid-svg-icons'

import './Header.css'

class Header extends Component {
	componentDidMount () {
		if (!this.props.currentUser) {
			this.props.fetchCurrentUser()
		}
	}

	render () {
		if (!this.props.currentUser || this.props.location.path === '/login') {
			return null
		}

		return (
			<AppBar position="relative">
				<div className="stock-watcher-header">
					<Link
						to="/"
						style={{ color: 'inherit', textDecoration: 'inherit' }}
					>
						<h3>Stock Watcher</h3>
					</Link>
					<Button style={{ color: 'white' }}>
						<FontAwesomeIcon
							icon={faUserCircle} size="2x"
							style={{marginRight: "8px"}}
						/>
						{this.props.currentUser.name}
					</Button>
				</div>
			</AppBar>
		)
	}
}

function mapStateToProps ({ currentUser }) {
	return { currentUser }
}

function mapDispatchToProps (dispatch) {
	return bindActionCreators({
		fetchCurrentUser
	}, dispatch)
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Header))

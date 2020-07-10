import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter, Link } from 'react-router-dom'
import { fetchCurrentUser, logoutCurrentUser } from '../actions/current-user'
import { bindActionCreators } from 'redux'

import {
	AppBar,
	Button,
	MenuList,
	MenuItem,
	Popover
} from '@material-ui/core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserCircle } from '@fortawesome/free-solid-svg-icons'
import StockSearchBar from './StockSearchBar'

import './Header.css'

class Header extends Component {
	constructor () {
		super()
		this.state = {
			profileContextMenuOpen: false,
			profileContextMenuAnchorEl: null
		}
		this.profileButtonRef = React.createRef()

		this.onProfileButtonClick = this.onProfileButtonClick.bind(this)
		this.onProfileContextMenuClose = this.onProfileContextMenuClose.bind(this)
		this.logoutUser = this.logoutUser.bind(this)
	}

	componentDidMount () {
		if (!this.props.currentUser) {
			this.props.fetchCurrentUser()
		}
	}

	onProfileButtonClick (event) {
		this.setState({
			profileContextMenuOpen: true,
			profileContextMenuAnchorEl: event.currentTarget
		})
	}

	onProfileContextMenuClose () {
		this.setState({
			profileContextMenuOpen: false,
			profileContextMenuAnchorEl: null
		})
	}

	async logoutUser () {
		try {
			await this.props.logoutCurrentUser()
			this.props.history.push('/login')
		} catch (error) {
			console.error(`Error while logging out user: ${error.message}`)
		}
	}

	render () {
		if (!this.props.currentUser || this.props.location.path === '/login') {
			return null
		}

		return (
			<div>
				<AppBar position="relative">
					<div className="stock-watcher-header">
						<Link
							to="/"
							style={{ color: 'inherit', textDecoration: 'inherit' }}
						>
							<h3>Stock Watcher</h3>
						</Link>
						<Button
							ref={this.profileButtonRef}
							style={{ color: 'white' }}
							onClick={this.onProfileButtonClick}
						>
							<FontAwesomeIcon
								icon={faUserCircle} size="2x"
								style={{marginRight: "8px"}}
							/>
							{this.props.currentUser.name}
						</Button>
					</div>
				</AppBar>
				<div style={{ margin: '16px 16px 0px' }}>
					<StockSearchBar />
				</div>
				<Popover
					open={this.state.profileContextMenuOpen}
					anchorEl={this.profileButtonRef.current}
					onClose={this.onProfileContextMenuClose}
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'center'
					}}
					transformOrigin={{
						vertical: 'top',
						horizontal: 'center'
					}}
				>
					<MenuList>
						<MenuItem
							onClick={this.logoutUser}
						>
							Logout
						</MenuItem>
					</MenuList>
				</Popover>
			</div>
		)
	}
}

function mapStateToProps ({ currentUser }) {
	return { currentUser }
}

function mapDispatchToProps (dispatch) {
	return bindActionCreators({
		fetchCurrentUser,
		logoutCurrentUser
	}, dispatch)
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Header))

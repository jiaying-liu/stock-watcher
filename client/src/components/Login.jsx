import React, { Component } from 'react'
import { GoogleLogin } from 'react-google-login'

import axios from 'axios'
import { connect } from 'react-redux'
import { fetchCurrentUser } from '../actions/current-user'
import { bindActionCreators } from 'redux'
import { withRouter } from 'react-router-dom'

class Login extends Component {
	async onGoogleResponse (response) {
		try {
			await axios.post(`${process.env.REACT_APP_API_URI}/login`,
				{
					idToken: response.tokenObj.id_token
				}
			)

			this.props.fetchCurrentUser()
		} catch (error) {
			console.error(`Error while getting google response: ${error.message}`)
		}		
	}

	render () {
		if (this.props.currentUser) {
			this.props.history.push('/')
		}

		return (
			<div>
				<h1>Set Your Stock Alerts</h1>
				<GoogleLogin
					clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
					buttonText='Login with Google'
					onSuccess={this.onGoogleResponse.bind(this)}
					onFailure={this.onGoogleResponse.bind(this)}
					cookiePolicy='single_host_origin'
				/>
			</div>
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Login))

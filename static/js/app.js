class Register extends React.Component {
	sendRegisterRequest() {
		let formData = new FormData(document.querySelector('#register-form'));
		fetch('/api/register/', {
			method: 'POST',
			body: formData
		})
		.then(result => result.text())
		.then(
			(result) => {
				if (result == 'ok') {
					this.props.onRegister();
				}
				else {
					alert('Duplicate Username');
				}
			},
			(error) => {
				alert('General registration error');
			}
		)
	}

	render() {
		return (
			<div id="form">
				<form id="register-form">
					<input
						name="username"
						id="username"
						type="text"
						placeholder="username" />
					<input 
						name="password"
						id="password"
						type="password"
						placeholder="password" />
					<input 
						name="email"
						id="email"
						type="email"
						placeholder="email"
					/>
					<br />
					<button
						id="register-button"
						onClick={(evt) => {
							evt.preventDefault();
							this.sendRegisterRequest();
						}}>
						Register
					</button>
				</form>
				<button 
					id="login-btn"
					onClick={(evt) => {
						evt.preventDefault();
						this.props.onLoginPress();
					}}>
					Login Here
				</button>
			</div>
		);
	}
}

class Login extends React.Component {
	sendLoginRequest() {
		let formData = new FormData( document.querySelector('#login-form') );
		fetch('/api/login/', {
			method: 'POST',
			body: formData
		})
		.then(result => result.text())
		.then(
			(result) => {
				if (result == 'ok') {
					fetch('/api/get_user/', {
						method: 'GET'
					})
					.then(result => result.text())
					.then(result => {
						let userDiv = document.getElementById('user');
						userDiv.setAttribute('theID', result);
						this.props.onLogin();
					})
				}
				else {
					alert('Bad username/password combo');
				}
			},
			(error) => {
				alert('General login error');
			}
		)
	}

	render() {
		return (
			<div id="form">
				<form id="login-form">
					<input
						name="username"
						id="username"
						type="text"
						placeholder="username" />
					<input
						name="password"
						id="password"
						type="password"
						placeholder="password" />
					<br />
					<button
						id="login-button"
						onClick={(evt) => {
							evt.preventDefault();
							this.sendLoginRequest();
						}}>
					Login
					</button>
				</form>
				<button 
					id="register-btn"
					onClick={(evt) => {
						evt.preventDefault();
						this.props.onRegisterPress();
					}}>
					Register Here
				</button>
			</div>
		);
	}
}

class Computers extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			computers: [],
			isLoaded: false,
			error: null,
			timeStamp: Date.now()
		};

		this.windowRefresh = this.windowRefresh.bind(this);
	}

	componentDidMount() {
		fetch('/api/statuses/')
		.then(result => result.json())
		.then(
			(result) => {
				this.setState({
					computers: result,
					isLoaded: true,
					timeStamp: Date.now()
				});
			},
			(error) => {
				this.setState({
					error: error,
					isLoaded: true,
					timeStamp: Date.now()
				});
			}
		)
	}

	windowRefresh() {
		console.log("Refreshing");
		fetch('/api/statuses/')
		.then(result => result.json())
		.then(
			(result) => {
				this.setState({
					computers: result,
					isLoaded: true,
					timeStamp: Date.now()
				});
			},
			(error) => {
				this.setState({
					error: error,
					isLoaded: true,
					timeStamp: Date.now()
				});
			}
		)
		setTimeout(this.windowRefresh, 30000);
	}

	logout() {
		fetch('/api/logout/')
		.then(result => result.text())
		.then(
			(result) => {
				if (result == 'ok') {
					this.props.logout();
					alert('You have been logged out.');
				} else {
					alert('results return wasn\'t "ok".')
				}
			},
			(error) => {
				alert('Something horrible happened.');
			}
		)
	}

	reservation(pc_id) {
		fetch('/api/reserve/'+pc_id+'/', {
			method: 'PUT'
		})
		.then(response => response.text())
		.then(
			(response) => {
				if (response == 'ok') {
					this.windowRefresh();
					alert('You have reserved this PC.');
				} else if (response == 'fail') {
					alert('Sorry, this PC has already been reserved.');
				} else {
					alert('server response was something other than "ok".');
					//alert(response);
				}
			},
			(error) => {
				alert('Diff Error');
			}
		)
	}

	release(pc_id) {
		fetch('/api/release/'+pc_id+'/', {
			method: 'PUT'
		})
		.then(response => response.text())
		.then(
			(response) => {
				if (response == 'ok') {
					this.windowRefresh();
					alert('You have released this PC.');
				} else {
					alert('server response was something other than "ok".');
					//alert(response);
				}
			},
			(error) => {
				alert('Diff Error');
			}
		)
	}

	render() {
		console.log('re-rendering computers...');
		if (this.state.error) {
			return (
				<div>Error: Avengers must have been snapped by Thanos.</div>
			);
		}
		else if (!this.state.isLoaded) {
			return (
				<div>Waiting for Avengers to assemble...</div>
			);
		}
		else {
			return (
				<div className="computers">
				<h1>HPC Computers Reservations</h1>
				<button onClick={() => this.logout()}>
				Logout
				</button>
				<ul>
				{this.state.computers.map(pc => {
					let showThing = undefined;
					let userID = document.getElementById('user').getAttribute('theID');
					//alert('PC user id: ' + pc.userID + ' Logged in UserID: ' + userID);
					if (pc.isReserved && pc.userID == userID) {
						//Show release button
						showThing = <button onClick={() => this.release(pc.id)}> Release </button>;
					} else if (pc.isReserved && pc.userID != userID) {
						//Show no button, instead show 'Reserved by {pc.userID}'
						showThing = <p>Reserved by {pc.userID}</p>;
					} else {
						//Show reserve button
						showThing = <button onClick={() => this.reservation(pc.id)}> Reserve </button>;
					}
					return (
						<li key={pc.id} id={pc.id}>
						HPC{pc.id}
						<br/>

						{showThing}
						
						<br/><br/>

						</li>
						
					)
				})}
				</ul>
				</div>
			);
		}
	}
}

class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			view: 'login'
		};
	}

	onRegister() {
		this.setState({
			view: 'login'
		});
	}

	onRegisterPress() {
		this.setState({
			view: 'register'
		});
	}

	onLogin() {
		this.setState({
			view: 'computers',
			timeStamp: Date.now()
		});
	}

	onLoginPress() {
		this.setState({
			view: 'login'
		});
	}

	logout() {
		this.setState({
			view: 'login'
		});
	}

	render() {
		let component = <Login 
			onLogin={() => this.onLogin()} 
			onRegister={() => this.onRegister()}
			onRegisterPress={() => this.onRegisterPress()}
			onLoginPress={() => this.onLoginPress()}
		/>;
		if (this.state.view == 'computers') {
			component = <Computers 
				logout={() => this.logout()}
				/>;
		} else if (this.state.view == 'register') {
			component = <Register
				onLogin={() => this.onLogin()} 
				onRegister={() => this.onRegister()}
				onRegisterPress={() => this.onRegisterPress()}
				onLoginPress={() => this.onLoginPress()}
			/>;
		} else if (this.state.view == 'login') {
			component = <Login 
				onLogin={() => this.onLogin()} 
				onRegister={() => this.onRegister()}
				onRegisterPress={() => this.onRegisterPress()}
				onLoginPress={() => this.onLoginPress()}
			/>;
		}

		return (
			<div className="app">
			{component}
			</div>
		);
	}
}

const container = document.querySelector('#app');
const root = ReactDOM.createRoot(container);
root.render(<App />);

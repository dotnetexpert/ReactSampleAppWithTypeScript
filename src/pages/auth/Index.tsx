import { Link	, useLocation, useNavigate } from 'react-router-dom';
import Image from '../../components/image/Index';
import logo from '../../assets/images/logo.png';
import g_icon from '../../assets/images/g-icon.png';
import insta_icon from '../../assets/images/insta-icon.png';
import f_icon from '../../assets/images/f-icon.png';
import auth_image from '../../assets/images/auth-image.png';
import { useEffect, useState } from 'react';
import Register from '../../components/register/Index';
import Login from '../../components/login/Index';
import Button from '../../components/button/Index';
import useAuth from '../../hooks/Index';
import { App_Urls } from '../../routes/AppUrls';
import ApiService from '../../helpers/api/Index';
import { showToast } from '../../components/toaster/Index';
import { GoogleOAuth } from '../../components/OAuth/Google';
import { InstagramOAuth } from '../../components/OAuth/Instagram';
import { FacebookOAuth } from '../../components/OAuth/Facebook';
import * as Utils from '../../helpers/Utils';
import { AuthResponseModel } from '../../types/models/AuthResponseModel';
import IAPIResponseModel from '../../types/interfaces/IAPIResponseModel';

const AuthPage = () => {
	const IsAuthenticated = useAuth();
	const location = useLocation();
	const navigate = useNavigate();
	const [selectedAuthCode, setSelectedAuthCode] = useState<string | null>('');
	const [selectedOAuth, setSelectedOAuth] = useState<string | null>(() => {
		// Retrieve selectedOAuth from localStorage if available
		return localStorage.getItem('selectedOAuth');
	});

	const [activeTab, setActiveTab] = useState<number>(location && location.state && location.state.tabId ? location.state.tabId : 1);

	const handleTabChange = (tabId: number) => {
		setActiveTab(tabId);
	};
	/**
	 * Effect to parse the authorization code from the URL and update the state.
	 * This runs once when the component mounts.
	 */
	useEffect(() => {
		// Parse URL parameters
		const urlParams = new URLSearchParams(window.location.search);
		// Get the authorization code from the URL
		const code = urlParams.get('code');
		// Update the state with the authorization code
		setSelectedAuthCode(code);
	}, []); // Empty dependency array means this effect runs only once when the component mounts

	/**
	 * Effect to navigate to the profile page if the user is authenticated.
	 * This effect runs whenever the `IsAuthenticated` or `navigate` dependencies change.
	 */
	useEffect(() => {
		// Check if the user is authenticated
		if (IsAuthenticated) {
			// Navigate to the profile page
			navigate(App_Urls.Profile);
		}
	}, [IsAuthenticated, navigate]); // Dependencies: `IsAuthenticated` and `navigate`

	/**
	 * Effect to handle OAuth sign-in based on the selected OAuth provider and authorization code.
	 * This effect runs whenever `selectedAuthCode` or `selectedOAuth` changes.
	 */
	useEffect(() => {
		if (selectedAuthCode && selectedOAuth) {
			// Determine the OAuth provider and handle sign-in accordingly
			switch (selectedOAuth) {
				case 'google':
					// Handle Google sign-in
					handleOAuthSignIn(ApiService.SignInWithGoogle_Post, selectedAuthCode);
					break;
				case 'instagram':
					// Handle Instagram sign-in
					handleOAuthSignIn(ApiService.SignInWithInstagram_Post, selectedAuthCode);
					break;
				case 'facebook':
					// Handle Facebook sign-in
					handleOAuthSignIn(ApiService.SignInWithFacebook_Post, selectedAuthCode);
					break;
			}
		}
	}, [selectedAuthCode, selectedOAuth]); // Dependencies: `selectedAuthCode` and `selectedOAuth`

	/**
	 * Updates the selected OAuth provider and stores it in localStorage.
	 * @param selectedOAuth - The OAuth provider selected (e.g., 'Google', 'Facebook').
	 */
	const handleSelectedOAuth = (selectedOAuth: string) => {
		// Update the state with the selected OAuth provider
		setSelectedOAuth(selectedOAuth);
		// Store the selected OAuth provider in localStorage
		localStorage.setItem('selectedOAuth', selectedOAuth);
	};

	/**
	 * Handles the sign-in process using the specified OAuth provider's sign-in method and authorization code.
	 * @param signInMethod - The sign-in function for the OAuth provider.
	 * @param code - The authorization code received from the OAuth provider.
	 */
	const handleOAuthSignIn = (signInMethod: Function, code: string) => {
		// Call the sign-in method with the authorization code
		signInMethod(code)
			.then((result: IAPIResponseModel<AuthResponseModel>) => {
				// Check if the sign-in was successful
				if (result.isSuccess && result.response) {
					// Show a success toast message
					showToast('Successfully logged in');
					// Remove the selected OAuth provider from localStorage
					localStorage.removeItem('selectedOAuth');
					// Extract tokens and expiration from the response
					const { accessToken, expiration, refreshToken }: AuthResponseModel = result.response;
					// Set the access token and refresh token
					Utils.Set_Access_Token(accessToken);
					Utils.Set_Refresh_Token(refreshToken, expiration);
					// Navigate to the profile page
					navigate(App_Urls.Profile);
				} else {
					// Show an error toast message with the user message or a default message
					showToast(result.error.userMessage || 'Something went wrong', { type: 'error' });
				}
			})
			.catch((error: any) => {
				// Show an error toast message with the exception message
				showToast(error.message, { type: 'error' });
			});
	};

	return (
		<>
			<div className="auth-screens">
				<Image src={auth_image} alt="" />
				<div className="right-main-auth-screen">
					<div className="logo-main">
						<Link to="">
							<Image src={logo} />
						</Link>
					</div>
					<div className="social-logins">
						<label>Social login</label>
						<ul>
							<li onClick={() => handleSelectedOAuth('google')}>
								<Link to="" onClick={GoogleOAuth}>
									<Image src={g_icon} /> <span>google</span>
								</Link>
							</li>
							
							<li onClick={() => handleSelectedOAuth('instagram')}>
								<Link to="" onClick={InstagramOAuth}>
									<Image src={insta_icon} /> <span>Instagram</span>
								</Link>
							</li>
							<li onClick={() => handleSelectedOAuth('facebook')}>
								<Link to="" onClick={FacebookOAuth}>
									<Image src={f_icon} /> <span>facebook</span>
								</Link>
							</li>
						</ul>
					</div>
					<div className="or-seprator">
						<span>OR</span>
					</div>

					<div className="form-main-auth">
						<ul className="nav nav-tabs" id="myTab" role="tablist">
							<li className="nav-item" role="presentation">
								<Button
									type="button"
									label="Sign Up"
									className={`nav-link ${activeTab === 0 ? 'active' : ''}`}
									id="signup-tab"
									onClick={() => handleTabChange(0)}
								/>
							</li>
							<li className="nav-item" role="presentation">
								<Button
									type="button"
									label="Login"
									className={`nav-link ${activeTab === 1 ? 'active' : ''}`}
									id="login-tab"
									onClick={() => handleTabChange(1)}
								/>
							</li>
						</ul>
						<div className="tab-content" id="myTabContent">
							{activeTab === 0 && <Register tabId={activeTab} />}
							{activeTab === 1 && <Login tabId={activeTab} />}
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default AuthPage;

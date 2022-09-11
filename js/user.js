"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;

/******************************************************************************
 * User login/signup/login
 */

/** Handle login form submission. If login ok, sets up the user instance */

async function login(evt) {
  console.debug("login", evt);
  evt.preventDefault();

  // grab the username and password
  const username = $("#login-username").val();
  const password = $("#login-password").val();

  // User.login retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.login(username, password);

  $loginForm.trigger("reset");

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();
}

$loginForm.on("submit", login);

/** Handle signup form submission. */

async function signup(evt) {
  console.debug("signup", evt);
  evt.preventDefault();

  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

  // User.signup retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.signup(username, password, name);

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();

  $signupForm.trigger("reset");
}

$signupForm.on("submit", signup);

/** Handle click of logout button
 *
 * Remove their credentials from localStorage and refresh page
 */

function logout(evt) {
  console.debug("logout", evt);
  localStorage.clear();
  location.reload();
}

$navLogOut.on("click", logout);

/******************************************************************************
 * Storing/recalling previously-logged-in-user with localStorage
 */

/** If there are user credentials in local storage, use those to log in
 * that user. This is meant to be called on page load, just once.
 */

async function checkForRememberedUser() {
  console.debug("checkForRememberedUser");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (!token || !username) return false;

  // try to log in with these credentials (will be null if login failed)
  currentUser = await User.loginViaStoredCredentials(token, username);
}

/** Sync current user information to localStorage.
 *
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */

function saveUserCredentialsInLocalStorage() {
  console.debug("saveUserCredentialsInLocalStorage");
  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
  }
}

/******************************************************************************
 * General UI stuff about users
 */

/** When a user signs up or registers, we want to set up the UI for them:
 *
 * - show the stories list
 * - update nav bar options for logged-in user
 * - generate the user profile part of the page
 */

function updateUIOnUserLogin() {
  console.debug("updateUIOnUserLogin");

  $allStoriesList.show();

  updateNavOnLogin();
}

// add/remove a story from the current user's list of favorites
async function toggleFavorite(evt) {
  // get the story id and the story itself
  const storyId = $(evt.target).closest("li").attr("id");
  const story = storyList.stories.find(sto => sto.storyId === storyId);
  // check if the story is a favorite by seeing if it's in the user's favorite list
  const favorite = currentUser.favorites.find(sto => sto.storyId === storyId);

  // if the story is a favorite then we'll remove it when clicked and set the text to say 'favorite'
  if(favorite) {
    await currentUser.removeFavorite(story);
    $(evt.target).text("favorite");
  } else { // if the story is not a favorite we'll add it and change the text to say 'unfavorite'
    await currentUser.addFavorite(story);
    $(evt.target).text("unfavorite");
  }
}

$allStoriesList.on("click", ".story-favorite-button", toggleFavorite);
$favoritedStoriesList.on("click", ".story-favorite-button", toggleFavorite);

async function deleteStoryClick(evt) {
  // get the story id and the story itself
  const storyId = $(evt.target).closest("li").attr("id");
  $(evt.target).closest("li").remove();

  await storyList.deleteStory(currentUser, storyId);
}

$allStoriesList.on("click", ".story-delete-button", deleteStoryClick);
$favoritedStoriesList.on("click", ".story-delete-button", deleteStoryClick);
"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);
  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
        ${getDeleteButton(story)}
        ${getFavoriteButton(story)}
      </li>
    `);
}

function getDeleteButton(story) {
  if(currentUser.isOwnStory(story))
    return '<small class="story-delete-button">delete</small>'
  else
    return '';
}

function getFavoriteButton(story) {
  if(!currentUser)
    return;

    if(currentUser.isFavorite(story)) {
    return '<small class="story-favorite-button">unfavorite</small>';
  } else {
    return '<small class="story-favorite-button">favorite</small>';
  }
}

/** Gets list of stories from server, generates their HTML, and puts on page. */
function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

function putFavoritesOnPage() {
  console.log("putFavoritesOnPage");
  $favoritedStoriesList.empty();
  console.log(currentUser.favorites);
  if (currentUser.favorites.length === 0) {
    $favoritedStoriesList.append("<h5>No favorites</h5>");
  } else {
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $favoritedStoriesList.append($story);
    }
  }

  $favoritedStoriesList.show();
}

// function for submitting a story using the form
async function submitStory(evt) {
  evt.preventDefault();
  console.debug("submitStory")

  // get the values from the ui
  const title = $("#submit-title").val();
  const author = $("#submit-author").val();
  const url = $("#submit-url").val();

  // add the story using the api
  await storyList.addStory(currentUser, {title, author, url});
  console.log("submitted!");
  // reload the stories on the page
  putStoriesOnPage();
  // empty and hide the form again
  $submitForm.trigger("reset");
  $submitForm.hide();
  $navSubmit.show();
}

$submitForm.on("submit", submitStory)
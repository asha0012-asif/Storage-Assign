const APP = {
    
    init: async () => {
        console.log("APP is running...");
    },

    saveFriend: () => {
        ev.preventDefault();
        console.log("Saving friend to cache.");

        //make sure everything is filled out.
        
        // create the JSON string and save it in the json cache

        // save the image in the image cache

        //when complete call the function to update the list of people
    },

    showFriendsList: () => {
        //show the contents of cache as a list of cards
        console.log("Showing List of Friends.");
    },

    makeCard: (friend) => {
        //create HTML card for a friend in the <ul>
        console.log("Creating HTML Friend Card.");
    }
}

window.addEventListener("DOMContentLoaded", APP.init);


/*
create an object like
{
  id: '1234-2342343-3423423424', //uuid
  name: 'friend',
  dob: '2000-06-01',
  avatar: 'filename same as id',
}
- submit form
- generate UUID
- file -> rename -> response -> cache
- json with filename, name, dob, id
- json -> file -> response -> cache
*/

const APP = {
    myJSONCache: null,
    myImageCache: null,
    
    init: async () => {
        console.log("APP is running...");

        //open image cache and json cache and save references
        APP.myJSONCache = await caches.open("myJSONCache");
        APP.myImageCache = await caches.open("myImageCache");

        //add listener for form submit
        document.getElementById("form").addEventListener("submit", APP.saveFriend);

        //build list of friends

    },

    saveFriend: async (ev) => {
        ev.preventDefault();
        console.log("Saving friend to cache.");

        const form = ev.target;
        console.log(form);

        //make sure everything is filled out.
        const friendName = document.getElementById("name").value;
        if (!friendName) {
            return alert("Please enter in your friend's name.");
        }

        const friendDOB = document.getElementById("dob").value;
        if (!friendDOB) {
            return alert("Please enter in your friend's date of birth.");
        }

        const friendAvatarFile = document.getElementById("avatar").files[0];
        if (!friendAvatarFile) {
            return alert("Please enter in your friend's image.");
        }

        const friendID = crypto.randomUUID();

        const friend = {
            id: friendID,
            name: friendName,
            dob: friendDOB,
            avatar: `${friendID}.${friendAvatarFile.type.split("/")[1]}`
        }
        console.log(friend);

        // create the JSON string and save it in the json cache
        const friendResponse = new Response(friend, {
            status: 200,
            statusText: "Ok",
            headers: {
                "Content-Type": "application/json",
            }
        });
        console.log(friendResponse);

        APP.myJSONCache.put(JSON.stringify(friend), friendResponse);

        // save the image in the image cache
        const friendAvatarResponse = new Response(friendAvatarFile, {
            status: 200, 
            statusText: "Ok",
            headers: {
                "Content-Type": friendAvatarFile.type,
                "Content-Length": friendAvatarFile.size
            }
        });
        console.log(friendAvatarResponse);

        APP.myImageCache.put(friend.avatar, friendAvatarResponse);

        //when complete call the function to update the list of people
        APP.showFriendsList();
    },

    showFriendsList: () => {
        //show the contents of cache as a list of cards
        console.log("Showing List of Friends.");
    },

    makeCard: (friend) => {
        //create HTML card for a friend in the <ul>

    }
}

window.addEventListener("DOMContentLoaded", APP.init);
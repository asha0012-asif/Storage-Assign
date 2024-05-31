// try cache.match????

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
        APP.showFriendsList();
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
            avatar: `/${friendID}.${friendAvatarFile.type.split("/")[1]}`
        }
        const friendJSON = JSON.stringify(friend);
        console.log(friendJSON);

        const friendFile = new File([friendJSON], friend.id, { type: "application/json"});
        console.log(friendFile);

        // create the JSON string and save it in the json cache
        const friendResponse = new Response(friendFile, {
            status: 200,
            statusText: "Ok",
            url: friendFile.url,
            headers: {
                "Content-Type": friendFile.type,
                "Content-Length": friendFile.size
            }
        });
        console.log(friendResponse);

        APP.myJSONCache.put(friend.id, friendResponse);

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

    showFriendsList: async () => {
        //show the contents of cache as a list of cards
        console.log("Showing List of Friends.");

        const keys = await APP.myJSONCache.keys();

        for (let key of keys) {
            // get back the response object (just like using fetch)
            const responseJSON = await APP.myJSONCache.match(key);
            // console.log(responseJSON);

            // convert the response object to json (just like collecting the data)
            const friend = await responseJSON.json();
            // console.log(friend);

            // get back image from cache
            const responseImage = await APP.myImageCache.match(friend.avatar);
            // console.log(responseImage);

            const friendAvatar = await responseImage.blob();
            const friendAvatarURL = URL.createObjectURL(friendAvatar);
            // console.log(friendAvatarURL);;

            APP.makeCard({...friend, url: friendAvatarURL});
        }
    },

    makeCard: (friend) => {
        //create HTML card for a friend in the <ul>
        console.log("Creating HTML Friend Card.");
        console.log(friend);
    }
}

window.addEventListener("DOMContentLoaded", APP.init);
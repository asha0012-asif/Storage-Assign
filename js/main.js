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
        // console.log(form);

        //make sure everything is filled out.
        const friendName = document.getElementById("name").value;
        if (!friendName) {
            alert("Please enter in your friend's name.");
            return;
        }
        
        const friendDOB = document.getElementById("dob").value;
        if (!friendDOB) {
            alert("Please enter in your friend's date of birth.");
            return;
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

        const friendFile = new File([JSON.stringify(friend)], friend.id, { type: "application/json"});
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

        await APP.myJSONCache.put(friend.id, friendResponse);
        
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
        
        await APP.myImageCache.put(friend.avatar, friendAvatarResponse);

        form.reset();

        //when complete call the function to update the list of people
        APP.showFriendsList();
    },

    showFriendsList: async () => {
        //show the contents of cache as a list of cards
        console.log("Showing List of Friends:");

        const keys = await APP.myJSONCache.keys();

        const friendsList = document.getElementById("friends-list");
        friendsList.innerHTML = "";
        
        if (keys.length === 0) {
            friendsList.innerHTML = `<li class="card">So lonely...</li>`;
        } else {
            let df = new DocumentFragment();

            for (let key of keys) {
                console.log("\n\nNew friend");

                // get back the response object (just like using fetch)
                const responseJSON = await APP.myJSONCache.match(key);
                console.log("Response for Data", responseJSON);

                // convert the response object to json (just like collecting the data)
                const friend = await responseJSON.json();
                console.log("JSON Object for Data", friend);

                // get back image from cache
                const responseImage = await APP.myImageCache.match(friend.avatar);
                console.log("Response for Image", responseImage);

                const friendAvatar = await responseImage.blob();
                console.log("Blob for Image", friendAvatar);

                const friendAvatarURL = URL.createObjectURL(friendAvatar);
                console.log(friendAvatarURL);

                const card = APP.makeCard({...friend, url: friendAvatarURL});
                df.append(card);
            }

            friendsList.appendChild(df);

            document.getElementById("friend__count").innerText = keys.length;
        } 

    },

    makeCard: (friend) => {
        //create HTML card for a friend in the <ul>
        console.log("Creating HTML Friend Card.");
        // console.log(friend);

        const dob = new Date(friend.dob);
        const dobString = `${dob.toDateString().split(" ")[1]} ${dob.getDate()+1}, ${dob.getFullYear()}`;
        
        const card = document.createElement("li");
        card.setAttribute("data-ref", friend.id);
        card.className = "card";
        
        const friendImage = document.createElement("img");
        friendImage.className = "avatar";
        friendImage.src = friend.url;
        friendImage.alt = `${friend.name} avatar`;
        
        const div = document.createElement("div");
        div.className = "info"
        
        const friendName = document.createElement("h3");
        friendName.className = "name";
        friendName.textContent = friend.name;
        
        const friendDOB = document.createElement("p");
        friendDOB.className = "dob";
        friendDOB.textContent = dobString;

        div.append(friendName, friendDOB);
        card.append(friendImage, div);

        return card;
    }
}

window.addEventListener("DOMContentLoaded", APP.init);
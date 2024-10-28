export function getCookie(name) {
    let cookieArr = document.cookie.split(";");
    for (let i = 0; i < cookieArr.length; i++) {
        let cookiePair = cookieArr[i].split("=");
        if (name === cookiePair[0].trim()) {
            return decodeURIComponent(cookiePair[1]);
        }
    }
    return null;
}

export function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); // Convert days to milliseconds
        expires = "; expires=" + date.toUTCString(); // Set expiration date
    }
    // Set cookie with SameSite attribute to Strict and HttpOnly set to false
    document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/; SameSite=Lax; HttpOnly=false";
}


// export function confirmLoggedInUser(id: stirng) {
//     const userIdInCookie = getCookie('user_id')
//     if (id !== userIdInCookie) {
//       window.location.href = '/login'
//     }
//   }

export const getCsrfToken = async () => {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_SERVER_URL}/api/csrf/`, {
        method: 'GET',
        credentials: 'include',
    });
    const data = await response.json();
    console.log('csrfToken', data)
    return data.csrfToken;
};

// export const confirmUserCredits = async (credit) => {
//      const getCreditsResponse = await fetch(`${import.meta.env.VITE_BACKEND_SERVER_URL}/api/credits/${userId}/`, {
//             method: 'GET',
//             credentials: 'include',
//         });
//      const getCreditsData = await getCreditsResponse.json();
//      if (getCreditsData[0].credits >= credit) {
//         return true
//      } else {
//         return false
//      }
// };

export const chopUserCredits = async (userId, amountOfCredits) => {
    try {
        const csrftoken = await getCsrfToken();

        // Fetch the current credits of the user
        const getCreditsResponse = await fetch(`${import.meta.env.VITE_BACKEND_SERVER_URL}/api/credits/${userId}/`, {
            method: 'GET',
            credentials: 'include',
        });


        // Ensure the response is in JSON format
        const getCreditsData = await getCreditsResponse.json();
        // console.log('1', )

        if (!getCreditsResponse.ok) {
            // If there's an error with fetching the credits
            return { error: { message: "Failed to fetch credits" } };
        }

        if (getCreditsData.data) {
            // Deduct credits by sending a POST request
            if (getCreditsData.data[0].credits > amountOfCredits) {
                const chopResponse = await fetch(`${import.meta.env.VITE_BACKEND_SERVER_URL}/api/chop-credits/${userId}/`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrftoken,
                    },
                    body: JSON.stringify({ amount: amountOfCredits }), // Ensure the correct format
                });

                // Convert the response to JSON
                const chopResponseData = await chopResponse.json();

                if (!chopResponse.ok || chopResponseData.error) {
                    // Return the error if present
                    return { error: chopResponseData.error || { message: "Error chopping credits" } };
                }

                // Return the data if successful
                return { data: chopResponseData.data };    
            } else {
                return {error: {message: "Whoops you do not have enough credits"}}
            }
        } else {
            return { error: { message: "Something went wrong, please refresh." } };
        }
    } catch (error) {
        console.error(error);
        return { error: { message: "Something went wrong while handling credits" } };
    }
};


import axios from "axios";

/*
baseConfig is a configuration object that contains settings for axios clients.
An Axios client is an instance of the Axios library with specific settings.
It is like a “customized tool” for working with HTTP requests.
*/
const baseConfig = {
  /*
baseURL is a special axios property
that is automatically added to the beginning of all URL paths when executing requests.
*/
  baseURL: "http://127.0.0.1:8000/api/v1/",
};

//  client for public requests
export const publicApiClient = axios.create(baseConfig);

//  client for protected requests
export const privateApiClient = axios.create(baseConfig);

/* The interceptors.request.use() method accepts two functions:
 successful scenario and if something went wrong before sending the request */
privateApiClient.interceptors.request.use(
  // getting access token from local storage and adding it to request
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  //   if error happens before request is sent - pass it along
  (error) => {
    throw error;
  }
);

/* The interceptors.response.use() method accepts two functions:
 successful scenario and when have error responses from server */
privateApiClient.interceptors.response.use(
  // if response is successful - just return it unchanged
  (response) => {
    return response;
  },
  // if server returns error (like 401, 403, 500, etc) - handle it here
  (error) => {
    // if unauthorised (401) - delete tokens from local storage
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
    // pass error along so component can handle it too
    throw error;
  }
);

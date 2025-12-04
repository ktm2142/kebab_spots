import axios from "axios"

const baseConfig = {
    baseURL: "http://127.0.0.1:8000/api/v1/"
}

export const publicApiClient = axios.create(baseConfig)

export const privateApiClient = axios.create(baseConfig)

privateApiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken")
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        throw error
    }
)

privateApiClient.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("accessToken")
            localStorage.removeItem("refreshToken")
            window.location.assign("/login")
        }
        throw error
    }
)
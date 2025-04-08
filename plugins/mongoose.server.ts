import {dbConnect} from "~/server/utils/db"

export default defineNuxtPlugin( async (nuxtApp) => {
    return await dbConnect()
})

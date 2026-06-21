import z from "zod";

export const logoutSchema={
    body:z.object({
        logoutOptions:z.enum(["all","one"])
    })

}
export const uploadProfileSchema={
    body:z.object({
        contentType:z.string(),
        originname:z.string()
    })

}
export default logoutSchema

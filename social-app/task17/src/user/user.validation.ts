import z from "zod";

export const logoutSchema={
    body:z.object({
        logoutOptions:z.enum(["all","one"])
    })

}
export default logoutSchema
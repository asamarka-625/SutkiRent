// import { logOut } from "../components/buttons/logOutButton"

export function errorHandler(error: any) {
    if (error == 403)
    {
        // logOut()
        return 403
    }
    else if (String(error)[0] == "5")
      {
        return 5
      }
      return 0
}

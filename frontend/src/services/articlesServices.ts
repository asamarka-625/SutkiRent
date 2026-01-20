import { fetchAddress } from "../globalSettings.ts"

export const getArticlesData = async () => {
    const response = await fetch(
      fetchAddress + 
      '/articles/'
      // 'http://localhost:8000/api/objects/?cost_min=&cost_max=&type=&amount_rooms=&floor=&category=&region=&city=&space_min=&space_max='
      , {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
          //   'X-Requested-With': 'XMLHttpRequest', //Necessary to work with request.is_ajax()
          //   'X-CSRFToken': 'csrftoken',
          //   'Authorization': ` Bearer ${localStorage.getItem("token")}`,
        }
    })
    return response
}

export async function getArticleById(id: string) {
  const response = await fetch(
    fetchAddress +
    '/articles/' + id + '/'
    // 'http://localhost:8000/api/objects/?cost_min=&cost_max=&type=&amount_rooms=&floor=&category=&region=&city=&space_min=&space_max='
    , {
      method: 'GET',
      headers: {
          "Content-Type": "application/json",
        //   'X-Requested-With': 'XMLHttpRequest', //Necessary to work with request.is_ajax()
        //   'X-CSRFToken': 'csrftoken',
        //   'Authorization': ` Bearer ${localStorage.getItem("token")}`,
      }
  })
  return response
}


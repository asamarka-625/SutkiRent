import { fetchAddress } from "../globalSettings.ts";




export async function getMetrosData() {
  const response = await fetch(
    fetchAddress + '/objects/metro/'
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

export async function getInventoryData() {
  const response = await fetch(
    fetchAddress + '/objects/inventory/'
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

export async function getViewData() {
  const response = await fetch(
    fetchAddress + '/objects/views-from-window-types/'
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

export async function getBathroomData() {
  const response = await fetch(
    fetchAddress + '/objects/bathroom-types/'
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


export async function getAvailData() {
  const response = await fetch(
    fetchAddress + '/objects/accessibility-types/'
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

export async function getServiceData() {
  const response = await fetch(
    fetchAddress + '/objects/service/'
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

export async function getRegionsData() {
  const response = await fetch(
    fetchAddress + '/objects/regions/'
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

export async function getRegionNameById(id: string) {
  const response = await fetch(
    fetchAddress + '/objects/region/' + id
    , {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        //   'X-Requested-With': 'XMLHttpRequest', //Necessary to work with request.is_ajax()
        //   'X-CSRFToken': 'csrftoken',
        //   'Authorization': ` Bearer ${localStorage.getItem("token")}`,
      }
    })
  if (response.ok) {
    const data = await response.json();
    return data.name
  }
  else {
    return undefined
  }

}


export async function getTypeNameById(id: string) {
  const response = await fetch(
    fetchAddress + '/objects/type/' + id
    , {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        //   'X-Requested-With': 'XMLHttpRequest', //Necessary to work with request.is_ajax()
        //   'X-CSRFToken': 'csrftoken',
        //   'Authorization': ` Bearer ${localStorage.getItem("token")}`,
      }
    })
  if (response.ok) {
    const data = await response.json();
    return data.name
  }
  else {
    return undefined
  }

}

export async function getTypeData() {
  const response = await fetch(
    fetchAddress + '/objects/type/'
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

import { fetchAddress } from "../globalSettings.ts";

export const getAttractions = async () => {
  const response = await fetch(
    fetchAddress + '/attractions/',
    {
      method: 'GET',
      headers: { "Content-Type": "application/json" }
    }
  );
  return response;
}

export const getAttractionById = async (id: string) => {
  const response = await fetch(
    fetchAddress + '/attractions/' + id + '/',
    {
      method: 'GET',
      headers: { "Content-Type": "application/json" }
    }
  );
  return response;
}



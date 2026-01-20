import { fetchAddress } from "../globalSettings.ts";

export const getExcursions = async () => {
  const response = await fetch(
    fetchAddress + '/excursions/',
    {
      method: 'GET',
      headers: { "Content-Type": "application/json" }
    }
  );
  return response;
}

export const getExcursionById = async (id: string) => {
  const response = await fetch(
    fetchAddress + '/excursions/' + id + '/',
    {
      method: 'GET',
      headers: { "Content-Type": "application/json" }
    }
  );
  return response;
}





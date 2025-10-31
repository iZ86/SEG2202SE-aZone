export const getAllVenuesAPI = async (token: string, pageSize?: number, page?: number, query?: string): Promise<Response | undefined> => {
  try {
    return await fetch("http://localhost:8080/api/v1/venues?" + (query ? `query=${query}&` : '') + `pageSize=${pageSize}&page=${page}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        mode: "cors"
      });
  } catch (err) {
    console.error(err);
  }
};

export const getVenueByIdAPI = async (token: string, venueId: number): Promise<Response | undefined> => {
  try {
    return await fetch(`http://localhost:8080/api/v1/venues/${venueId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        mode: "cors"
      });
  } catch (err) {
    console.error(err);
  }
};

export const createVenueAPI = async (token: string, venue: string): Promise<Response | undefined> => {
  try {
    return await fetch("http://localhost:8080/api/v1/venues",
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          venue,
        }),
        mode: "cors"
      });
  } catch (err) {
    console.error(err);
  }
};

export const updateVenueByIdAPI = async (token: string, venueId: number, venue: string): Promise<Response | undefined> => {
  try {
    return await fetch(`http://localhost:8080/api/v1/venues/${venueId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          venue,
        }),
        mode: "cors"
      });
  } catch (err) {
    console.error(err);
  }
};

export const deleteVenueByIdAPI = async (token: string, venueId: number): Promise<Response | undefined> => {
  try {
    return await fetch(`http://localhost:8080/api/v1/venues/${venueId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        mode: "cors"
      });
  } catch (err) {
    console.error(err);
  }
};

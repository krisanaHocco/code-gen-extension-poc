import axios from "axios";

export class ExternalApiService {
  constructor() {}

  async get(url: string) {
    const response = await axios
      .get(url)
      .then(function (response) {
        return response.data;
      })
      .catch((err) => {
        console.error("External API error : ", err);
      });
    return response;
  }
}

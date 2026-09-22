import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const IMGW_API_BASE = "https://danepubliczne.imgw.pl/api/data/synop/station";

interface WeatherMeasurement extends Record<string, string | null> {
  id_stacji: string;
  stacja: string;
  data_pomiaru: string;
  godzina_pomiaru: string;
  temperatura: string;
  predkosc_wiatru: string;
  kierunek_wiatru: string;
  wilgotnosc_wzgledna: string;
  suma_opadu: string;
  cisnienie: string | null;
}

function toStationSlug(city: string): string {
  return city
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

const server = new McpServer({
  name: "imgw-weather",
  version: "0.1.0",
});

const FAVORITE_CITIES = ["Katowice", "Zakopane", "Kolobrzeg", "Ustka"];

// Baseline weather data for 2026-09-22 at 16:00 - frozen for comparison
const baselineWeatherData: Record<string, WeatherMeasurement> = {
  Katowice: {
    id_stacji: "12560",
    stacja: "Katowice",
    data_pomiaru: "2026-09-22",
    godzina_pomiaru: "16",
    temperatura: "12.8",
    predkosc_wiatru: "2",
    kierunek_wiatru: "280",
    wilgotnosc_wzgledna: "84.6",
    suma_opadu: "8.2",
    cisnienie: "1022.9",
  },
  Zakopane: {
    id_stacji: "12625",
    stacja: "Zakopane",
    data_pomiaru: "2026-09-22",
    godzina_pomiaru: "16",
    temperatura: "6.6",
    predkosc_wiatru: "1",
    kierunek_wiatru: "360",
    wilgotnosc_wzgledna: "92.0",
    suma_opadu: "17.8",
    cisnienie: null,
  },
  Kolobrzeg: {
    id_stacji: "12100",
    stacja: "Kołobrzeg",
    data_pomiaru: "2026-09-22",
    godzina_pomiaru: "16",
    temperatura: "15.2",
    predkosc_wiatru: "6",
    kierunek_wiatru: "360",
    wilgotnosc_wzgledna: "68.4",
    suma_opadu: "0",
    cisnienie: "1026.6",
  },
  Ustka: {
    id_stacji: "12115",
    stacja: "Ustka",
    data_pomiaru: "2026-09-22",
    godzina_pomiaru: "16",
    temperatura: "14.2",
    predkosc_wiatru: "6",
    kierunek_wiatru: "360",
    wilgotnosc_wzgledna: "81.9",
    suma_opadu: "0.01",
    cisnienie: "1025.7",
  },
};

server.registerTool(
  "get_weather",
  {
    title: "Get IMGW weather",
    description:
      "Get the latest synoptic measurement from the IMGW station for a Polish city.",
    inputSchema: {
      city: z
        .string()
        .min(1, "City is required")
        .describe("Polish city name, for example Jelenia Góra"),
    },
  },
  async ({ city }) => {
    const stationSlug = toStationSlug(city);
    if (!stationSlug) {
      return {
        content: [{ type: "text", text: "City must contain letters or numbers." }],
        isError: true,
      };
    }

    const response = await fetch(`${IMGW_API_BASE}/${stationSlug}`, {
      signal: AbortSignal.timeout(10_000),
      headers: { accept: "application/json" },
    });

    if (!response.ok) {
      return {
        content: [
          {
            type: "text",
            text: `IMGW did not return weather data for "${city}" (HTTP ${response.status}).`,
          },
        ],
        isError: true,
      };
    }

    const measurement = (await response.json()) as WeatherMeasurement;
    return {
      content: [{ type: "text", text: JSON.stringify(measurement, null, 2) }],
      structuredContent: measurement,
    };
  },
);

server.registerPrompt(
  "favorite_cities_weather",
  {
    description: "Get weather for favorite Polish cities: Katowice, Zakopane, Kolobrzeg, and Ustka",
  },
  async () => {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Fetch the current weather for Katowice, Zakopane, Kolobrzeg, and Ustka using the get_weather tool. Present the results in a table showing temperature, humidity, wind speed, and precipitation for each city.

After fetching, read the baseline resource at baseline://favorite-cities-weather/2026-09-22 and compare today's readings against the baseline from 2026-09-22 at 16:00. For each city, note:
- Temperature change (warmer/colder by how many degrees)
- Humidity change (higher/lower by how many percent)
- Wind speed change
- Precipitation change

Provide a summary of weather trends for each city.`,
          },
        },
      ],
    };
  },
);

server.registerResource(
  "baseline_favorite_cities_weather",
  "baseline://favorite-cities-weather/2026-09-22",
  {
    description: "Baseline weather measurements for favorite cities (Katowice, Zakopane, Kolobrzeg, Ustka) from 2026-09-22 at 16:00",
    mimeType: "application/json",
  },
  async () => {
    return {
      contents: [
        {
          uri: "baseline://favorite-cities-weather/2026-09-22",
          mimeType: "application/json",
          text: JSON.stringify(baselineWeatherData, null, 2),
        },
      ],
    };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
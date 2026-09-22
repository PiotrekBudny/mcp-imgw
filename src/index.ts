import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const IMGW_API_BASE = "https://danepubliczne.imgw.pl/api/data/synop/station";

interface WeatherMeasurement extends Record<string, string> {
  id_stacji: string;
  stacja: string;
  data_pomiaru: string;
  godzina_pomiaru: string;
  temperatura: string;
  predkosc_wiatru: string;
  kierunek_wiatru: string;
  wilgotnosc_wzgledna: string;
  suma_opadu: string;
  cisnienie: string;
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
            text: "Fetch the current weather for Katowice, Zakopane, Kolobrzeg, and Ustka using the get_weather tool. Present the results in a table showing temperature, humidity, wind speed, and precipitation for each city.",
          },
        },
      ],
    };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
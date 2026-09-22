# IMGW Weather MCP Server

An MCP server that retrieves current synoptic weather measurements from the
Polish Institute of Meteorology and Water Management (IMGW) public API.

## Requirements

- Node.js 20 or newer
- An MCP-compatible client such as Claude Desktop, Cursor, or VS Code

## Install and run

```bash
npm install
npm run build
npm start
```

The server uses stdio transport, so it should be started by an MCP client
rather than opened directly in a terminal. The upstream endpoint is:

`https://danepubliczne.imgw.pl/api/data/synop/station/{city}`

## Tools

### `get_weather`

Returns the latest measurement for a Polish IMGW station.

Input:

```json
{
  "city": "Jelenia Gora"
}
```

The city is normalized to the IMGW station slug, so `Jelenia Góra`,
`jelenia gora`, and `jeleniagora` all address the same station.

## Prompts

### `favorite_cities_weather`

A predefined prompt that fetches current weather for four favorite Polish cities:
**Katowice**, **Zakopane**, **Kołobrzeg**, and **Ustka**.

When invoked, this prompt instructs the MCP client to:
1. Call `get_weather` for each of the four cities
2. Present the results in a formatted table showing temperature, humidity, wind speed, and precipitation
3. Read the baseline resource (`baseline://favorite-cities-weather/2026-09-22`)
4. Compare current readings against the baseline to show:
   - Temperature change (warmer/colder by how many degrees)
   - Humidity change (higher/lower by how many percent)
   - Wind speed change
   - Precipitation change
5. Provide a summary of weather trends for each city

This is useful for quickly comparing weather across different regions of Poland and understanding how conditions have changed since the baseline date.

## Resources

### `baseline://favorite-cities-weather/2026-09-22`

An MCP resource containing the frozen baseline weather data for the four favorite cities 
measured on 2026-09-22 at 16:00:

- **Katowice**: 12.8°C, 84.6% humidity, 2 m/s wind, 8.2 mm precipitation
- **Zakopane**: 6.6°C, 92.0% humidity, 1 m/s wind, 17.8 mm precipitation
- **Kołobrzeg**: 15.2°C, 68.4% humidity, 6 m/s wind, 0 mm precipitation
- **Ustka**: 14.2°C, 81.9% humidity, 6 m/s wind, 0.01 mm precipitation

This baseline is permanently stored and can be compared against future weather readings to 
provide insights about how conditions have changed.

## VS Code configuration

This repository includes `.vscode/mcp.json`. After building the project, use
the MCP server controls in VS Code to start `imgw-weather` and test the
`get_weather` tool.

For another MCP client, use this command configuration:

```json
{
	"command": "node",
	"args": ["/absolute/path/to/mcp-imgw/dist/index.js"]
}
```

## Development

```bash
npm run dev
npm run typecheck
```

`npm run dev` starts the TypeScript entry point directly with `tsx`.

## Data source

Weather data is provided by IMGW-PIB through its public API. The data is
returned as reported by IMGW; availability and station names depend on the
upstream service.

## References

- [IMGW public API](https://danepubliczne.imgw.pl/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Official TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)

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

This is useful for quickly comparing weather across different regions of Poland (industrial south, mountain region, and Baltic coast).

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

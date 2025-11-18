# Shell App

Main container application for microfrontends (Next.js 14+).

## Installation

```bash
npm install
```

## Configuration

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=http://localhost:3003
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
npm run start
```

## Module Federation

This app loads remote microfrontends:
- `authMfe` - Authentication
- `workspaceMfe` - Workspace management
- `analyticsMfe` - Analytics
- `adminMfe` - Admin panel

## Dependencies

- `@task-management/shared-ui` - Shared UI components

## License

Proprietary


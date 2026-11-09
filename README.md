# dufs-gui

Customized web GUI and assets module for [sigoden/dufs](https://github.com/sigoden/dufs).

## Features
- **Batch Operations**: Multi-item selection via table checkboxes or click/Shift-click, with batch delete and batch download actions.
- **Dual Action Bars**: Top action toolbar above file list + floating bottom dock for batch actions.
- **Refined Modern GUI**: Light and dark theme toggle (with local storage persistence), card table layout, and file-type icons.
- **In-page Filter**: Instant client-side search filtering by filename.
- **Feedback & Confirmation**: Toast notifications for operations and modal confirmation dialogs for single and batch deletes.

## Getting Started

Start the service with Docker Compose:

```bash
docker compose up -d
```

The GUI will be available at `http://localhost:5010`.

To stop the service:

```bash
docker compose down
```

## Directory Structure
- `assets/` - Custom GUI assets (`index.html`, `index.css`, `index.js`, `favicon.ico`).
- `data/` - Shared file storage directory mounted to `/data` in the container.
- `docker-compose.yml` - Docker compose configuration for running dufs with the custom assets mounted.

# dufs-gui

Customized web GUI and frontend assets module for [sigoden/dufs](https://github.com/sigoden/dufs).

## Scope & Capabilities Disclaimer

> [!NOTE]
> **Client-Side Asset Customization Only**: This project exclusively provides custom static frontend assets (`index.html`, `index.css`, `index.js`) served via dufs's native `--assets` CLI flag. It **does not** introduce any additional backend capabilities, custom server endpoints, or protocols beyond what upstream dufs natively supports.
>
> All operations (such as uploads, deletions, archiving, and file editing) are strictly bound to the permissions, flags, and authentication rules enforced by the underlying dufs server instance (e.g., `--allow-delete`, `--allow-upload`, `--allow-archive`, or path-level access controls). The frontend cannot bypass or escalate permissions.

## Features
- **Batch Operations**: Multi-item selection via table checkboxes or click / Shift-click, with batch delete and batch download actions.
- **Dual Action Bars**: Top sticky header action pill + floating bottom dock for batch actions with zero layout shift.
- **List / Grid View Switch**: Segmented switch to toggle between a compact table view and a responsive card grid with lazy-loaded image previews.
- **Refined Modern GUI**: Light and dark theme toggle (with local storage persistence) and clean file-type icons.
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
- `docker-compose.yml` - Docker Compose configuration for running dufs with custom assets mounted.

## Credits & Attribution

- **Core Server & Original Web Assets**: Built for and adapted from [sigoden/dufs](https://github.com/sigoden/dufs) by [@sigoden](https://github.com/sigoden), licensed under Apache-2.0 / MIT.
- This project leverages dufs's built-in `--assets <path>` capability to provide an alternative, modernized client interface without modifying the backend binary.

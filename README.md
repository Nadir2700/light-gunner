# Lightgunner

**Lightgunner** is a proof of concept that turns a smartphone into a lightgun with **no extra apps** required.  
Only a modern mobile browser is needed.


## Preview

![Demo Preview](https://raw.githubusercontent.com/vadimcx/lightgunner/refs/heads/main/msc/imgs/lightgunner1.gif)



## How It Works

- A local **HTTPS server** runs on the host machine.
- The server exposes **two pages**:
  - **Host page** 
  - **Client page** (for the smartphone).
- Host and client communicate over **Wi-Fi** via **WebSockets**.
- The **DeviceOrientation API** maps phone motion to the on-screen crosshair in real time.



## Usage

1. **Clone the repository and cd to the project dir**
   ```bash
   git clone https://github.com/vadimcx/lightgunner
   ```

   ```bash
   cd lightgunner
   ```

2. **Install dependencies** (The example uses [Bun](https://bun.sh), but it should also work with Node or Deno.)
   ```bash
   bun install
   ```

3. **Start Lightgunner**
   ```bash
   bun run src/serverside/server.ts
   ```

4. **Open the URLs** printed in the CLI:
   - On the **host**, open the `/server` page.
   - On the **smartphone**, open the **client** page.  
   *Make sure both devices are on the same network.*

5. **Enable orientation tracking**
   - On first connect, tap **“Enable Orientation”** on the client page.
   - Grant the browser permission to access device orientation data.

6. **Calibrate the crosshair**
   - On the host page, **left-click** to reposition the crosshair and adjust alignment.



## Notes

- Requires a browser that supports the **DeviceOrientation API** (permission prompt and user gesture may be required on iOS/Android).
- Both host and client must be on the **same Wi-Fi network**.
- Designed and tested with **Bun**; other Node.js runtimes should work with minor adjustments.



## Disclaimer

This is a **proof of concept** and not intended for production use.  

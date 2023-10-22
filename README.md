# useColyseus Hooks 🎣 🏟️

This package contains a set of utility hooks to use Colyseus with React.

[Colyseus](https://colyseus.io/) is a framework for writing your own authoritative multiplayer game servers using JavaScript/TypeScript and Node.js, and easily integrating it with your favorite game engine.

This package still needs to be battle-tested for production, but it gives a good glimpse of how Colyseus and React work together and how to handle external states on React.

## Usage

1. Install the package

    ```bash
    pnpm add use-colyseus
    ```
2. Create a `colyseus.ts` file on your React app
    ```ts
    import { colyseus } from "use-colyseus";

    import { GameState } from "shared/schema"; // Your room schema
    
    export const {
      client,
      connectToColyseus,
      disconnectFromColyseus,
      useColyseusRoom,
      useColyseusState,
    } = colyseus<GameState>('ws://localhost:2567');
    ```
3. Import the hooks from your newly created `colyseus.ts` file and start building :)

## Documentation

- ### `colyseus`

  Setup the Colyseus client and type the utility hooks.
  
  #### Parameters:
  - endpoint: `string`
  - schema?: `Schema`
  
  #### Return:
  - `Client`
  - `connectToColyseus`
  - `disconnectFromColyseus`
  - `useColyseusRoom`
  - `useColyseusState`

  #### Example:
  ```ts
  export const {
      client,
      connectToColyseus,
      disconnectFromColyseus,
      useColyseusRoom,
      useColyseusState,
    } = colyseus<GameState>('ws://localhost:2567');
  ```

- ### `connectToColyseus`

  Connect the client to the specified Colyseus server room. Prevents duplicated connections.
  
  #### Parameters:
  - roomName: `string`
  - options?: `unknown`
  
  #### Return:
  `Promise<void>`

  #### Example:
  ```ts
  useEffect(() => {
    (async () => {
      await connectToColyseus("test");
    })();
  
    return () => {
      disconnectFromColyseus();
    };
  }, []);
  ```

- ### `disconnectFromColyseus`

  Disconnect the client from the current connected Colyseus server
  
  #### Parameters:

  #### Return:
  `Promise<void>`
  
  #### Example:
  ```ts
  useEffect(() => {
    (async () => {
      await connectToColyseus("test");
    })();
  
    return () => {
      disconnectFromColyseus();
    };
  }, []);
  ```

- ### `useColyseusRoom`

  Access the Colyseus room object. Shouldn't be used to access the state, `room.state` is not updated. Use `useColyseusState` instead.
  
  #### Parameters:

  #### Return:
  `Room`
  
  #### Example:
  ```ts
  const room = useColyseusRoom();
  if (!room) return null;

  console.log(room.sessionId);
  ```

  - ### `useColyseusState`

  Access the Colyseus room state. Returns the complete state object updated in real-time. Use a selector to prevent re-renderings.
  
  #### Parameters:
  - selector?: `(state: S) => unknown`

  #### Return:
  `Room`
  
  #### Example:
  ```ts
  const clients = useColyseusState((state) => state.clients); // Only re-render if `state.clients` has changed

  // or

  const state = useColyseusState(); // Causes a lot of re-renderings
  ```

## Acknowledgements
- [Endel Dreyer](https://github.com/endel): Creating such a powerful and easy to use network framework.
- [Douglas Delavy](https://github.com/OddoAkbar): Partnership during the development of this package.

----
[Get in touch 👋](https://twitter.com/pedr0fontoura)

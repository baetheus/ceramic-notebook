import { header } from "./styles.css.ts";
import { Log, UserManager } from "npm:oidc-client-ts";

Log.setLogger(console);
const manager = new UserManager({
  authority: "https://id.null.pub",
  client_id: "3fd02a9f-df93-4fb2-8c53-d42442b96b6b",
  redirect_uri: globalThis.location.href,
});

export function App() {
  const user = manager.getUser();
  user.then((u) => {
    if (u !== null) {
      console.log("Got User", u);
    }
  });

  return (
    <div>
      <h1 class={header}>Hello World</h1>;
      <button type="button" onClick={() => manager.signinRedirect()}>
        Login
      </button>
    </div>
  );
}

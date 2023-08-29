import { redirect } from "@remix-run/node";
import { logout } from "~/session.server";

export const action = async ({ request }) => {
  return logout(request);
};

export async function loader() {
  return redirect("/");
}

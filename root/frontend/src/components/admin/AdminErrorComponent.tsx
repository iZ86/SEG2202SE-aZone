import { Error500Panel, Error404Panel } from "@components/ErrorComponent";

const HOMEPAGELINK = "admin/dashboard";

/** To be rendered instead of the original content if there is a 500 error code from the API call. */
export function AdminError500Panel() {
  return (
    <Error500Panel homePageLink={HOMEPAGELINK} />
  );
}

/** To be rendered instead of the original content if there is a 404 error code from the API call. */
export function AdminError404Panel() {
  return (
    <Error404Panel homePageLink={HOMEPAGELINK} />
  );
}

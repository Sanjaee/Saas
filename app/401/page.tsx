import { ErrorPage, ErrorScenes } from "@/components/error-page";

export default function UnauthorizedPage() {
  return <ErrorPage {...ErrorScenes.unauthorized} />;
}

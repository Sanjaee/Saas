import { ErrorPage, ErrorScenes } from "@/components/error-page";

export default function ServerErrorPage() {
  return <ErrorPage {...ErrorScenes.serverError} />;
}

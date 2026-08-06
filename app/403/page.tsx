import { ErrorPage, ErrorScenes } from "@/components/error-page";

export default function ForbiddenPage() {
  return <ErrorPage {...ErrorScenes.forbidden} />;
}

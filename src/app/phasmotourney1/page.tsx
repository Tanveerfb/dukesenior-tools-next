import { redirect } from "next/navigation";

export default function Page() {
  // Legacy route forwarding to new series path
  redirect("/phasmotourney-series/phasmotourney1");
}


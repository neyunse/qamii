import ObsWidgetClient from "./ObsWidgetClient";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";

export default async function WidgetPage({ params }) {
  const unwrappedParams = await params;
  const obsKey = unwrappedParams.obsKey;

  await connectToDatabase();
  const user = await User.findOne({ "integrations.obsKey": obsKey }).select("integrations.obsOverlayAlignment").lean();

  const alignment = user?.integrations?.obsOverlayAlignment || "center";

  // We explicitly render nothing on the server layout and just pass the key
  return (
    <div className="h-screen w-screen bg-transparent overflow-hidden">
      <ObsWidgetClient obsKey={obsKey} alignment={alignment} />
    </div>
  );
}

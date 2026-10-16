import { getSettings } from "./actions/settings";
import HomeClientWrapper from "./components/HomeClientWrapper";

export default async function Home() {
  const settings = await getSettings();

  return <HomeClientWrapper settings={settings} />;
}

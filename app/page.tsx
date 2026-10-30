import { getSettings } from "./actions/settings";
import { getProducts } from "./actions/products";
import HomeClientWrapper from "./components/HomeClientWrapper";

export default async function Home() {
  const [settings, products] = await Promise.all([
    getSettings(),
    getProducts(),
  ]);

  return <HomeClientWrapper settings={settings} products={products} />;
}

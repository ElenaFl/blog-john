import { Banner } from "../../components/ui/Banner/Banner.jsx";
import { Posts } from "../../components/ui/Posts/Posts.jsx";
import { Works } from "../../components/ui/Works/Works.jsx";

export const Home = () => {
  return (
    <main>
      <Banner />
      <Posts />
      <Works />
    </main>
  );
};

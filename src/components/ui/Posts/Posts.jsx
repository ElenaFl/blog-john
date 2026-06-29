import { useState, useEffect } from "react";
import { Card } from "../Card/Card.jsx";
import { useNavigate } from "react-router-dom";

export const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [checkBtnViewAll, setCheckBtnViewAll] = useState(false);
  const [dailyPosts, setDailyPosts] = useState([]);
  
  const navigate = useNavigate();

  function handleBtnViewAll() {
    setCheckBtnViewAll(!checkBtnViewAll);
  }

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("http://localhost:5000/api/posts");
        if (!response.ok) {
          throw new Error("Ошибка загрузки данных с json-server");
        }
        const data = await response.json();
        setPosts(data);

        if (data.length > 0) {
          const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
          const startIndex = (daysSinceEpoch * 2) % data.length;
          const dailyTwoPosts = data.concat(data).slice(startIndex, startIndex + 2);
          setDailyPosts(dailyTwoPosts);
        }
      } catch (error) {
        console.error("Ошибка:", error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const displayedPosts = checkBtnViewAll ? posts : dailyPosts;

  return (
    <section id="posts" className="pb-12 sm:pb-20 bg-[#F4F3EE]">
      <div className="mx-auto px-4 sm:max-w-[858px]">
        <div className="flex justify-between items-center">
          <h3 className="text-lg pt-6 pb-6 sm:text-2xl font-bold tracking-tight text-[var(--text-h)]">
            Recent posts
          </h3>
          {!isLoading && posts.length > 0 && (
            <button
              className="text-[var(--accent)] hover:text-[#00809B] cursor-pointer text-sm font-semibold uppercase tracking-wider transition-colors"
              onClick={handleBtnViewAll}
            >
              {checkBtnViewAll ? "Show less" : "View all"}
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            Загрузка постов...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {displayedPosts.map((post, index) => (
              <div key={post.id || index} className="w-full text-[17px]">
                <Card
                  data={post}
                  onOpenDetails={() => navigate(`/post-details/${post.id}`)}
                  variant="post"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App.jsx";
import { Home } from "./pages/Home/Home.jsx";
import { Blog } from "./pages/Blog/Blog.jsx";
import { WorksPage } from "./pages/WorksPage/WorksPage.jsx";
import { Contact } from "./pages/Contact/Contact.jsx";
import { PostDetails } from "./pages/PostDetails/PostDetails.jsx";
import { WorkDetails } from "./pages/WorkDetails/WorkDetails.jsx";
import { AdminLayout } from "./pages/Admin/AdminLayout.jsx";
import { AdminForm } from "./pages/Admin/AdminForm.jsx";
import { AdminPosts } from "./pages/Admin/AdminPosts.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="blog" element={<Blog />} />
          <Route path="post-details/:id" element={<PostDetails />} />
          <Route path="works" element={<WorksPage />} />
          <Route path="work-details/:id" element={<WorkDetails />} />
          <Route path="contact" element={<Contact />} />
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminPosts />} />
            <Route path="posts" element={<AdminPosts />} />
            <Route path="create" element={<AdminForm />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);

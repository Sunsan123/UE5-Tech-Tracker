import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ModuleDirectoryPage from "./pages/ModuleDirectoryPage";
import ModulePage from "./pages/ModulePage";
import ItemDetailPage from "./pages/ItemDetailPage";
import SearchPage from "./pages/SearchPage";
import FavoritesPage from "./pages/FavoritesPage";
import DailyPage from "./pages/DailyPage";
import LogsPage from "./pages/LogsPage";

const App = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<ModuleDirectoryPage />} />
        <Route path="/module/:moduleSystem" element={<ModulePage />} />
        <Route path="/item/:itemId" element={<ItemDetailPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/daily" element={<DailyPage />} />
        <Route path="/logs" element={<LogsPage />} />
      </Routes>
    </Layout>
  );
};

export default App;

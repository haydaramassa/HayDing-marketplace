import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateProduct from "./pages/CreateProduct";
import MyProducts from "./pages/MyProducts";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Favorites from "./pages/Favorites";
import EditProduct from "./pages/EditProduct";
import ConversationDetails from "./pages/ConversationDetails";
import Account from "./pages/Account";
import PublicUserProfile from "./pages/PublicUserProfile";

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create-product" element={<CreateProduct />} />
          <Route path="/my-products" element={<MyProducts />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:productId" element={<ProductDetails />} />
          <Route path="/edit-product/:productId" element={<EditProduct />} />
          <Route path="/conversations/:conversationId" element={<ConversationDetails />} />
          <Route path="/account" element={<Account />} />
          <Route path="/users/:userId" element={<PublicUserProfile />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
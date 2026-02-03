import { useState } from 'react';
import axios from 'axios';
import "./assets/style.css";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function App() {
  // 表單資料狀態(儲存登入表單輸入)
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  // 登入狀態管理(控制顯示登入或產品頁）
  const [isAuth, setIsAuth] = useState(false);
  // 產品資料狀態
  const [products, setProducts] = useState([]);
  // 目前選中的產品
  const [tempProduct, setTempProduct] = useState();
  // 表單輸入處理
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((preData) => ({
      ...preData,// 保留原有屬性
      [name]:value,// 更新特定屬性
    }))
  };

  const getProducts = async () => {
    try{
      const response = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products`);

      setProducts(response.data.products);
    }catch(error){
      console.log(error.response);
    }
  }

  const onSubmit = async (e) => {
    try{
      e.preventDefault();
      const response = await axios.post(`${API_BASE}/admin/signin`, formData);
      // console.log(response.data)
      const {token, expired} = response.data;
      document.cookie = `gigToken=${token};expires=${new Date(expired)};`; // 設定 Cookie
      axios.defaults.headers.common['Authorization'] = token; // 修改實體建立時所指派的預設配置

      getProducts();
      setIsAuth(true);

    }catch (error) {
      setIsAuth(false);

      console.log(error.response?.data);
    }
  };

  const checkLogin = async () => {
    try {
      const token = document.cookie // 讀取 Cookie
        .split("; ")
        .find((row) => row.startsWith("gigToken="))
        ?.split("=")[1];
      axios.defaults.headers.common['Authorization'] = token; // 修改實體建立時所指派的預設配置

      const response = await axios.post(`${API_BASE}/api/user/check`);
      console.log(response.data);
    }catch (error) {
      console.log(error.response?.data.message);
    }
  }

  return (
    <>
    {!isAuth ? ( // 登入表單畫面
      <div className='container login'>
        <h1>請先登入</h1>
        <form className="form-floating" onSubmit={(e) => onSubmit(e)}>
          <div className="form-floating mb-3">
            <input type="email" className="form-control" name="username" placeholder="name@example.com" 
            value={formData.username}
            onChange={(e) => handleInputChange(e)}
            />
            <label htmlFor="username">Email address</label>
          </div>
          <div className="form-floating">
            <input type="password" className="form-control" name="password" placeholder="Password" 
            value={formData.password}
            onChange={(e) => handleInputChange(e)}
            />
            <label htmlFor="password">Password</label>
          </div>
          <button type="submit" className='btn btn-primary w-100 mt-2'>登入</button>
        </form>
      </div>) : (
      <div className='container'>
        <div className="row mt-2">
          <div className="col-md-6">
            {/* 功能按鈕 */}
            <button
              className="btn btn-danger mb-5"
              type="button"
              onClick={() => checkLogin()}
            >
              確認是否登入
            </button>
            <h2>產品列表</h2>
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">產品名稱</th>
                  <th scope="col">原價</th>
                  <th scope="col">售價</th>
                  <th scope="col">是否啟用</th>
                  <th scope="col">查看細節</th>
                </tr>
              </thead>
              <tbody>
                {
                  products.map(product => (
                  <tr key={product.id}>
                    <th scope="row">{product.title}</th>
                    <td>{product.origin_price}</td>
                    <td>{product.price}</td>
                    <td>{product.is_enabled ? '啟用' : '未啟用'}</td>
                    <td>
                      <button type="button" 
                      className="btn btn-primary" 
                      onClick={() => setTempProduct(product)}
                      >查看</button>
                    </td>
                  </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
          <div className="col-md-6">
            <h2>產品明細</h2>
            {
              tempProduct ? (
                <div className="card">
                  <img 
                  src={tempProduct.imageUrl} 
                  style={{ height: '300px' }} 
                  alt="主圖" />
                  <div className="card-body">
                    <h5 className="card-title">{tempProduct.title}</h5>
                    <p className="card-text">
                      商品描述：{tempProduct.description}
                    </p>
                    <p className="card-text">
                      商品內容：{tempProduct.content}
                    </p>
                    <div className="d-flex">
                      <del className="text-secondary">{tempProduct.origin_price}</del>元/
                      {tempProduct.price}元
                    </div>
                    <h5 className="card-title">更多圖片：</h5>
                    <div className="d-flex flex-warp">
                      {
                        tempProduct.imagesUrl.map((url, index) => (
                          <img key={index}
                          src={url} 
                          style={{ height: "100px", marginRight: "5px"}} 
                          />
                        ))
                      }
                    </div>
                  </div>
                </div>
              ) : (
              <p>請選擇產品</p>
            )}
          </div>
        </div>
      </div>
    )
    }
    </>
    
  );
}

export default App;

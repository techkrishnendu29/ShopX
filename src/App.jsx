import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  FaHeart,
  FaMoon,
  FaShoppingBag,
  FaSun,
  FaTrash,
} from 'react-icons/fa'
import {
  Link,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom'
import heroImage from './assets/hero.png'
import { products } from './data'

export const ShopContext = createContext(null)

const readStorage = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}

export function ShopProvider({ children }) {
  const [cart, setCart] = useState(() => readStorage('shopx-cart', {}))
  const [wishlist, setWishlist] = useState(() =>
    readStorage('shopx-wishlist', []),
  )
  const [dark, setDark] = useState(() => readStorage('shopx-dark', false))
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('featured')

  useEffect(() => {
    localStorage.setItem('shopx-cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    localStorage.setItem('shopx-wishlist', JSON.stringify(wishlist))
  }, [wishlist])

  useEffect(() => {
    localStorage.setItem('shopx-dark', JSON.stringify(dark))
    document.body.classList.toggle('dark', dark)
  }, [dark])

  const addToCart = (product) => {
    setCart((current) => ({
      ...current,
      [product.id]: {
        ...product,
        quantity: (current[product.id]?.quantity || 0) + 1,
      },
    }))
  }

  const decrease = (id) => {
    setCart((current) => {
      const item = current[id]
      if (!item) return current

      if (item.quantity <= 1) {
        const next = { ...current }
        delete next[id]
        return next
      }

      return {
        ...current,
        [id]: { ...item, quantity: item.quantity - 1 },
      }
    })
  }

  const remove = (id) => {
    setCart((current) => {
      const next = { ...current }
      delete next[id]
      return next
    })
  }

  const toggleWishlist = (id) => {
    setWishlist((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    )
  }

  const filteredProducts = useMemo(() => {
    const result = products.filter((product) => {
      const text = `${product.title} ${product.category}`.toLowerCase()
      const matchesSearch = text.includes(search.toLowerCase())
      const matchesCategory =
        category === 'all' || product.category === category

      return matchesSearch && matchesCategory
    })

    return [...result].sort((a, b) => {
      if (sort === 'low') return a.price - b.price
      if (sort === 'high') return b.price - a.price
      if (sort === 'rating') return b.rating - a.rating
      return a.id - b.id
    })
  }, [search, category, sort])

  const cartItems = Object.values(cart)
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  )
  const shipping = subtotal === 0 || subtotal >= 150 ? 0 : 12
  const total = subtotal + shipping

  return (
    <ShopContext.Provider
      value={{
        cartItems,
        cartCount,
        subtotal,
        shipping,
        total,
        wishlist,
        filteredProducts,
        search,
        setSearch,
        category,
        setCategory,
        sort,
        setSort,
        dark,
        setDark,
        addToCart,
        decrease,
        remove,
        toggleWishlist,
        clearCart: () => setCart({}),
      }}
    >
      {children}
    </ShopContext.Provider>
  )
}

const Navbar = () => {
  const {
    cartCount,
    wishlist,
    search,
    setSearch,
    dark,
    setDark,
  } = useContext(ShopContext)

  return (
    <header className="navbar">
      <Link className="logo" to="/">
        Shop<span>X</span>
      </Link>

      <nav>
        <Link to="/">Home</Link>
        <a href="/#shop">Shop</a>
        <a href="/#about">About</a>
        <a href="/#contact">Contact</a>
      </nav>

      <div className="nav_tools">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search"
          aria-label="Search products"
        />

        <button onClick={() => setDark((value) => !value)}>
          {dark ? <FaSun /> : <FaMoon />}
        </button>

        <Link className="nav_icon" to="/#wishlist">
          <FaHeart />
          {wishlist.length > 0 && <small>{wishlist.length}</small>}
        </Link>

        <Link className="nav_icon" to="/cart">
          <FaShoppingBag />
          {cartCount > 0 && <small>{cartCount}</small>}
        </Link>
      </div>
    </header>
  )
}

const Home = () => {
  const {
    filteredProducts,
    category,
    setCategory,
    sort,
    setSort,
    addToCart,
    wishlist,
    toggleWishlist,
  } = useContext(ShopContext)

  return (
    <main>
      <section className="hero">
        <div>
          <p className="eyebrow">New season essentials</p>
          <h1>
            Style that feels <em>like you.</em>
          </h1>
          <p>
            Discover timeless pieces, modern silhouettes, and everyday
            essentials made for your lifestyle.
          </p>
          <a className="button" href="#shop">
            Explore collection
          </a>
        </div>

        <img src={heroImage} alt="Featured fashion collection" />
      </section>

      <section className="benefits">
        <span>🚚 Free shipping over $150</span>
        <span>🔒 Secure checkout</span>
        <span>↩ Easy 30-day returns</span>
        <span>💬 Customer support</span>
      </section>

      <section className="products" id="shop">
        <div className="section_title">
          <div>
            <p className="eyebrow">Curated collection</p>
            <h2>Featured Products</h2>
          </div>

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="featured">Featured</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
            <option value="rating">Highest rated</option>
          </select>
        </div>

        <div className="filters">
          {['all', 'ladies', 'men'].map((item) => (
            <button
              key={item}
              className={category === item ? 'selected' : ''}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="grid">
          {filteredProducts.map((product) => {
            const favorite = wishlist.includes(product.id)

            return (
              <article className="card" key={product.id}>
                <div className="card_image">
                  <Link to={`/product/${product.id}`}>
                    <img src={product.image} alt={product.title} />
                  </Link>

                  <button
                    onClick={() => toggleWishlist(product.id)}
                    aria-label="Toggle wishlist"
                  >
                    <FaHeart className={favorite ? 'heart_active' : ''} />
                  </button>
                </div>

                <div className="card_content">
                  <small>{product.category}</small>

                  <Link to={`/product/${product.id}`}>
                    <h3>{product.title}</h3>
                  </Link>

                  <div className="rating">
                    ★ {product.rating} ({product.reviews})
                  </div>

                  <div className="card_footer">
                    <strong>${product.price.toFixed(2)}</strong>
                    <button onClick={() => addToCart(product)}>
                      Add to cart
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}

const ProductDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useContext(ShopContext)
  const product = products.find((item) => item.id === Number(id))

  if (!product) return <NotFound />

  return (
    <main className="details">
      <button className="back_button" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="details_grid">
        <img src={product.image} alt={product.title} />

        <div>
          <p className="eyebrow">{product.category}</p>
          <h1>{product.title}</h1>
          <div className="rating">
            ★ {product.rating} ({product.reviews} reviews)
          </div>
          <h2 className="price">${product.price.toFixed(2)}</h2>
          <p className="description">{product.description}</p>

          <label>
            Size
            <select>
              {product.sizes.map((size) => (
                <option key={size}>{size}</option>
              ))}
            </select>
          </label>

          <label>
            Color
            <select>
              {product.colors.map((color) => (
                <option key={color}>{color}</option>
              ))}
            </select>
          </label>

          <button className="button" onClick={() => addToCart(product)}>
            Add to cart
          </button>
        </div>
      </div>
    </main>
  )
}

const Cart = () => {
  const {
    cartItems,
    subtotal,
    shipping,
    total,
    decrease,
    addToCart,
    remove,
    clearCart,
  } = useContext(ShopContext)

  if (!cartItems.length) {
    return (
      <main className="empty">
        <h1>Your cart is empty</h1>
        <Link className="button" to="/">
          Continue shopping
        </Link>
      </main>
    )
  }

  return (
    <main className="cart_page">
      <h1>Shopping Cart</h1>

      <div className="cart_layout">
        <section className="cart_list">
          {cartItems.map((item) => (
            <article className="cart_row" key={item.id}>
              <img src={item.image} alt={item.title} />

              <div>
                <h3>{item.title}</h3>
                <p>${item.price.toFixed(2)}</p>
                <button onClick={() => remove(item.id)}>
                  <FaTrash /> Remove
                </button>
              </div>

              <div className="quantity">
                <button onClick={() => decrease(item.id)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => addToCart(item)}>+</button>
              </div>

              <strong>
                ${(item.price * item.quantity).toFixed(2)}
              </strong>
            </article>
          ))}

          <button className="clear_button" onClick={clearCart}>
            Clear cart
          </button>
        </section>

        <aside className="summary">
          <h2>Order Summary</h2>

          <p>
            Subtotal <strong>${subtotal.toFixed(2)}</strong>
          </p>

          <p>
            Shipping <strong>{shipping ? `$${shipping}` : 'Free'}</strong>
          </p>

          <hr />

          <p>
            Total <strong>${total.toFixed(2)}</strong>
          </p>

          <Link className="button full_button" to="/checkout">
            Checkout
          </Link>
        </aside>
      </div>
    </main>
  )
}

const Checkout = () => {
  const { total, clearCart, cartItems } = useContext(ShopContext)
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    postal: '',
  })

  const updateField = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  const submit = (event) => {
    event.preventDefault()

    if (!cartItems.length) {
      navigate('/')
      return
    }

    if (Object.values(form).some((value) => !value.trim())) {
      window.alert('Please complete all fields.')
      return
    }

    const order = {
      number: `SX-${Date.now().toString().slice(-8)}`,
      total,
      customer: form,
    }

    localStorage.setItem('shopx-order', JSON.stringify(order))
    clearCart()
    navigate('/success')
  }

  return (
    <main className="checkout_page">
      <h1>Checkout</h1>

      <form onSubmit={submit}>
        {Object.keys(form).map((field) => (
          <label key={field}>
            {field.charAt(0).toUpperCase() + field.slice(1)}

            <input
              name={field}
              value={form[field]}
              onChange={updateField}
              type={field === 'email' ? 'email' : 'text'}
              required
            />
          </label>
        ))}

        <button className="button" type="submit">
          Place order
        </button>
      </form>
    </main>
  )
}

const Success = () => {
  const order = readStorage('shopx-order', null)

  return (
    <main className="success">
      <div className="success_icon">✓</div>
      <p className="eyebrow">Thank you</p>
      <h1>Order confirmed</h1>

      {order && <p>Your order number is {order.number}.</p>}

      <Link className="button" to="/">
        Continue shopping
      </Link>
    </main>
  )
}

const Footer = () => (
  <footer id="contact">
    <h2>
      Shop<span>X</span>
    </h2>
    <p>Modern essentials for every version of you.</p>
    <small>© {new Date().getFullYear()} ShopX. All rights reserved.</small>
  </footer>
)

const NotFound = () => (
  <main className="empty">
    <h1>404</h1>
    <p>Page not found.</p>
    <Link className="button" to="/">
      Return home
    </Link>
  </main>
)

export default function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/success" element={<Success />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </>
  )
}
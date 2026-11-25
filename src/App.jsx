import React, { useEffect, useMemo, useState } from 'react';
import { categories, compareProducts, currencyInfo, navItems, products as defaultProducts } from './data';
import { formatINR } from './currency';
import { getStoredCart, saveStoredCart } from './cart';
import { getCurrentUser, logoutUser, seedDemoAccountIfNeeded, isAdminUser } from './auth';
import { getAdminProducts, getAdminDealOffers, ADMIN_DATA_CHANGED_EVENT } from './adminData';
import {
  applyOffersToProducts,
  getHotDealProducts,
  isOfferCurrentlyActive,
  isProductFeaturedInHotDeals,
} from './dealsUtils';
import { parseCurrentRoute, persistRoute } from './router';
import { subscribeToRealtimeSync, synchronizeCartWithLatestProducts } from './realtimeSync';
import AdminDashboard from './AdminDashboard';
import ProductDetailPage from './ProductDetailPage';
import ComparisonPage from './ComparisonPage';
import StoreLocatorPage from './StoreLocatorPage';
import SearchResultsPage from './SearchResultsPage';
import SearchBar from './SearchBar';
import CartPage from './CartPage';
import CheckoutPage from './CheckoutPage';
import OrderConfirmationPage from './OrderConfirmationPage';
import OrdersHistoryPage from './OrdersHistoryPage';
import AuthPage from './AuthPage';
import UserProfilePage from './UserProfilePage';
import SetupBuilderPage from './SetupBuilderPage';
import { searchProducts } from './searchUtils';
import { getSavedPreferredStore, savePreferredStore } from './storesData';
import { getSavedPincode } from './pincodeData';
import { handleProductImageError } from './imageUtils';
import './App.css';

const scrollToDeals = () => document.getElementById('deals')?.scrollIntoView({ behavior: 'smooth' });

function SunIcon({ className = '', size = 18 }) {
  return (
    <svg
      className={`theme-svg-icon sun-svg-icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4.5" />
      <line x1="12" y1="1.5" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22.5" />
      <line x1="4.57" y1="4.57" x2="6.34" y2="6.34" />
      <line x1="17.66" y1="17.66" x2="19.43" y2="19.43" />
      <line x1="1.5" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="22.5" y2="12" />
      <line x1="4.57" y1="19.43" x2="6.34" y2="17.66" />
      <line x1="17.66" y1="6.34" x2="19.43" y2="4.57" />
    </svg>
  );
}

function MoonIcon({ className = '', size = 18 }) {
  return (
    <svg
      className={`theme-svg-icon moon-svg-icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function BrandMark({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M8.5 8h7M8.5 12h5.5M8.5 16h7M8.5 8v8" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function StorePinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function UserOutlineIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function HeartOutlineIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function CartOutlineIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}

function SetupSlidersIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  );
}

function Header({
  cartCount,
  wishlistCount,
  search,
  setSearch,
  products,
  onSearchSubmit,
  onViewProduct,
  onSelectCategory,
  onMenu,
  onCart,
  onWishlist,
  onHome,
  onStores,
  preferredStore,
  user,
  onOpenAuth,
  onOpenProfile,
  onOpenOrders,
  onOpenAdmin,
  onLogout,
}) {
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  return (
    <header className="topbar">
      <button className="mobile-menu" aria-label="Open menu" onClick={onMenu}>
        <MenuIcon />
      </button>
      <a
        className="logo"
        href="#top"
        aria-label="ElectroHaven home"
        onClick={(e) => {
          e.preventDefault();
          onHome();
        }}
      >
        <span className="logo-mark">
          <BrandMark size={17} />
        </span>
        <span>
          Electro<span>Haven</span>
        </span>
      </a>
      <SearchBar
        search={search}
        setSearch={setSearch}
        products={products}
        onSearchSubmit={onSearchSubmit}
        onViewProduct={onViewProduct}
        onSelectCategory={onSelectCategory}
      />
      <div className="header-actions">
        <button
          className="header-store-btn"
          onClick={onStores}
          title="Store Locator"
          aria-label="Open Store Locator"
        >
          <span className="store-pin-icon">
            <StorePinIcon />
          </span>
          <span className="header-store-text">
            <small>My Store</small>
            <b>{preferredStore ? preferredStore.locality : 'Ahmedabad'}</b>
          </span>
        </button>

        {/* Dynamic Account Dropdown */}
        <div className="account-dropdown-wrap">
          <button
            className="account"
            aria-label="Account"
            onClick={() => {
              if (user) {
                setAccountMenuOpen(!accountMenuOpen);
              } else {
                onOpenAuth('login');
              }
            }}
          >
            <span className="avatar">
              {user ? user.avatar || user.name.slice(0, 2).toUpperCase() : <UserOutlineIcon />}
            </span>
            <span>
              {user ? `Hi, ${user.name.split(' ')[0]}` : 'Sign In'}
              <br />
              <b>{user ? 'Account & Orders ▾' : 'My Account'}</b>
            </span>
          </button>

          {accountMenuOpen && user && (
            <div className="account-menu-dropdown">
              <div className="account-menu-user">
                <strong>{user.name}</strong>
                <small>{user.email}</small>
              </div>
              <div className="account-menu-divider" />
              {isAdminUser(user) && (
                <button
                  type="button"
                  className="account-menu-item account-menu-admin"
                  onClick={() => {
                    onOpenAdmin();
                    setAccountMenuOpen(false);
                  }}
                >
                  ⚡ <strong>Admin Dashboard</strong>
                </button>
              )}
              <button
                type="button"
                className="account-menu-item"
                onClick={() => {
                  onOpenProfile();
                  setAccountMenuOpen(false);
                }}
              >
                👤 My Profile &amp; Addresses
              </button>
              <button
                type="button"
                className="account-menu-item"
                onClick={() => {
                  onOpenOrders();
                  setAccountMenuOpen(false);
                }}
              >
                📦 My Orders &amp; Receipts
              </button>
              <button
                type="button"
                className="account-menu-item"
                onClick={() => {
                  onWishlist();
                  setAccountMenuOpen(false);
                }}
              >
                ♡ My Saved Wishlist ({wishlistCount})
              </button>
              <button
                type="button"
                className="account-menu-item"
                onClick={() => {
                  onCart();
                  setAccountMenuOpen(false);
                }}
              >
                🛒 My Cart ({cartCount})
              </button>
              <div className="account-menu-divider" />
              <button
                type="button"
                className="account-menu-item account-menu-logout"
                onClick={() => {
                  onLogout();
                  setAccountMenuOpen(false);
                }}
              >
                🚪 Sign Out
              </button>
            </div>
          )}
        </div>

        <button
          className="icon-button wishlist-header-button"
          aria-label={`Open wishlist, ${wishlistCount} items`}
          onClick={onWishlist}
        >
          <HeartOutlineIcon />
          {wishlistCount > 0 && <span className="wishlist-count">{wishlistCount}</span>}
        </button>
        <button
          className="cart-button"
          aria-label={`Open cart, ${cartCount} items`}
          onClick={onCart}
        >
          <CartOutlineIcon />
          <i>{cartCount}</i>
        </button>
      </div>
    </header>
  );
}

function Sidebar({
  active,
  setActive,
  open,
  onClose,
  compareCount,
  cartCount,
  wishlistCount,
  theme,
  onToggleTheme,
  user,
  onOpenAuth,
  onOpenSupport,
  onLogout,
}) {
  const handleNavClick = (target) => {
    setActive(target);
    if (onClose) onClose();
  };

  return (
    <>
      <div
        className={`sidebar-backdrop ${open ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`sidebar ${open ? 'open' : ''}`} aria-label="Main Navigation">
        <div className="sidebar-header-row">
          <div className="sidebar-label">EXPLORE</div>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            ✕
          </button>
        </div>
        <nav>
          {navItems.map(([icon, label]) => (
            <button
              className={active === label ? 'active' : ''}
              key={label}
              onClick={() => handleNavClick(label)}
            >
              <span>{icon}</span>
              {label}
              {label === 'Deals' ? (
                <em>HOT</em>
              ) : label === 'Build Setup' ? (
                <em className="sidebar-ai-pill">AI</em>
              ) : label === 'Comparison' && compareCount > 0 ? (
                <em>{compareCount}</em>
              ) : label === 'Wishlist' && wishlistCount > 0 ? (
                <em>{wishlistCount}</em>
              ) : label === 'Cart' && cartCount > 0 ? (
                <em>{cartCount}</em>
              ) : null}
            </button>
          ))}
        </nav>

        {/* Admin Central Link (Authorized Administrators Only) */}
        {isAdminUser(user) && (
          <div className="sidebar-admin-box">
            <button
              type="button"
              className={`sidebar-admin-btn ${active === 'Admin' ? 'active' : ''}`}
              onClick={() => handleNavClick('Admin')}
            >
              <span>⚙️</span>
              Admin Dashboard
              <em className="sidebar-admin-pill">ADMIN</em>
            </button>
          </div>
        )}

        {/* Sidebar User Status Card */}
        <div className="sidebar-account-box">
          {user ? (
            <div className="sidebar-user-card">
              <div className="sidebar-user-info">
                <span className="sidebar-user-avatar">
                  {user.avatar || user.name.slice(0, 2).toUpperCase()}
                </span>
                <div className="sidebar-user-meta">
                  <strong>{user.name}</strong>
                  <small>{user.email}</small>
                </div>
              </div>
              <div className="sidebar-user-actions">
                <button type="button" className="text-button" onClick={() => handleNavClick('Profile')}>
                  Profile
                </button>
                <span>·</span>
                <button type="button" className="text-button" onClick={() => handleNavClick('Orders')}>
                  Orders
                </button>
                <span>·</span>
                <button
                  type="button"
                  className="text-button sidebar-logout-btn"
                  onClick={() => {
                    onLogout();
                    if (onClose) onClose();
                  }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="sidebar-signin-btn"
              onClick={() => {
                onOpenAuth('login');
                if (onClose) onClose();
              }}
            >
              <span>👤</span> Sign In / Register
            </button>
          )}
        </div>

        <div className="sidebar-theme-panel">
          <div className="sidebar-theme-head">
            <span className="sidebar-label">THEME</span>
            <span className="sidebar-theme-pill">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
          </div>
          <div className="theme-segmented-control" role="group" aria-label="Theme mode selector">
            <button
              type="button"
              className={`theme-segment-btn ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => theme !== 'dark' && onToggleTheme()}
              aria-pressed={theme === 'dark'}
            >
              <MoonIcon />
              <span>Dark</span>
            </button>
            <button
              type="button"
              className={`theme-segment-btn ${theme === 'light' ? 'active' : ''}`}
              onClick={() => theme !== 'light' && onToggleTheme()}
              aria-pressed={theme === 'light'}
            >
              <SunIcon />
              <span>Light</span>
            </button>
          </div>
        </div>

        <div className="sidebar-card">
          <span className="sidebar-advice-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
            </svg>
          </span>
          <strong>Need tech advice?</strong>
          <small>Our Ahmedabad specialists are ready to assist you.</small>
          <button
            type="button"
            onClick={() => {
              if (onOpenSupport) onOpenSupport();
              if (onClose) onClose();
            }}
          >
            Contact specialists →
          </button>
        </div>

        <div className="sidebar-footer">
          <p>ElectroHaven Storefront</p>
          <span>v2.4.0 · Pan-India</span>
        </div>
      </aside>
    </>
  );
}

function SupportModal({ isOpen, onClose }) {
  const [callbackRequested, setCallbackRequested] = useState(false);
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackTopic, setCallbackTopic] = useState('Product Recommendation');

  if (!isOpen) return null;

  const handleRequestCallback = (e) => {
    e.preventDefault();
    if (!callbackPhone || callbackPhone.length < 10) return;
    setCallbackRequested(true);
    setTimeout(() => {
      setCallbackRequested(false);
      setCallbackPhone('');
      onClose();
    }, 2800);
  };

  return (
    <div
      className="support-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="support-dialog-title"
    >
      <div className="support-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="support-modal-header">
          <div className="support-modal-title-wrap">
            <span className="support-modal-icon">⚡</span>
            <div>
              <h2 id="support-dialog-title">ElectroHaven Specialist Desk</h2>
              <p>Direct assistance from our Ahmedabad consumer tech specialists</p>
            </div>
          </div>
          <button
            type="button"
            className="support-modal-close"
            onClick={onClose}
            aria-label="Close support dialog"
          >
            ✕
          </button>
        </div>

        <div className="support-modal-body">
          <div className="support-contact-grid">
            <div className="support-channel-card">
              <span className="channel-icon">📞</span>
              <strong>Phone Consultation</strong>
              <p>+91 (079) 4000-8899</p>
              <small>Store Hours: Mon–Sun, 10:30 AM – 9:30 PM</small>
            </div>
            <div className="support-channel-card">
              <span className="channel-icon">💬</span>
              <strong>WhatsApp Support</strong>
              <p>+91 98765 43210</p>
              <small>Direct query assistance during store hours</small>
            </div>
            <div className="support-channel-card">
              <span className="channel-icon">✉</span>
              <strong>Email Specialist Desk</strong>
              <p>support@electrohaven.in</p>
              <small>Response within 2–4 business hours</small>
            </div>
            <div className="support-channel-card">
              <span className="channel-icon">🏬</span>
              <strong>In-Store Tech Consultation</strong>
              <p>5 Ahmedabad Flagship Stores</p>
              <small>Vastrapur, CG Road, SG Highway, Prahlad Nagar, Bopal</small>
            </div>
          </div>

          <div className="support-callback-section">
            <h3>Request an Expert Callback</h3>
            <p>Leave your number and a specialist from our Ahmedabad store will reach out to you.</p>

            {callbackRequested ? (
              <div className="support-success-msg" role="status">
                ✓ Callback request received! An Ahmedabad specialist will call you shortly.
              </div>
            ) : (
              <form className="support-callback-form" onSubmit={handleRequestCallback}>
                <div className="support-form-row">
                  <div className="auth-field" style={{ flex: 1 }}>
                    <label htmlFor="support-phone">Mobile Number</label>
                    <div className="auth-input-wrap">
                      <span className="auth-input-prefix">+91</span>
                      <input
                        id="support-phone"
                        type="tel"
                        maxLength={10}
                        placeholder="9876543210"
                        value={callbackPhone}
                        onChange={(e) => setCallbackPhone(e.target.value.replace(/\D/g, ''))}
                        required
                      />
                    </div>
                  </div>
                  <div className="auth-field" style={{ flex: 1 }}>
                    <label htmlFor="support-topic">Topic of Guidance</label>
                    <select
                      id="support-topic"
                      value={callbackTopic}
                      onChange={(e) => setCallbackTopic(e.target.value)}
                    >
                      <option value="Product Recommendation">Product Recommendation</option>
                      <option value="Store Pickup / Availability">Store Pickup / Availability</option>
                      <option value="AI Setup Builder Assistance">AI Setup Builder Assistance</option>
                      <option value="Warranty & Repair Service">Warranty &amp; Repair Service</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="primary support-submit-btn">
                  Request Free Callback <b>→</b>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero({ onBuildSetup }) {
  return (
    <section className="hero">
      <div className="hero-copy">
        <span className="eyebrow">OFFICIAL MULTI-BRAND STORE · PAN-INDIA</span>
        <h1>
          Future-Ready Tech.<br />
          <span>Authentic Flagships.</span>
        </h1>
        <p>
          Discover genuine consumer electronics from Apple, Samsung, Sony, HP, Dell, and Lenovo with express Pan-India shipping and same-day local store pickup.
        </p>
        <div className="hero-buttons">
          <button className="primary" onClick={scrollToDeals}>
            Explore Hot Deals <b>→</b>
          </button>
          {onBuildSetup && (
            <button
              type="button"
              className="hero-builder-trigger-btn"
              onClick={onBuildSetup}
            >
              <SetupSlidersIcon size={15} /> Build Your Setup (AI)
            </button>
          )}
          <button
            className="secondary"
            onClick={() =>
              document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            Browse Products <b>→</b>
          </button>
        </div>
        <div className="hero-note">
          <span>✓ Genuine Brand Warranty</span>
          <span>✓ Free Express Delivery</span>
          <span>✓ 5 Ahmedabad Pickup Stores</span>
        </div>
      </div>

      <div className="hero-visual" aria-hidden="true">
        <div className="hero-showcase">
          <div className="hero-showcase-main">
            <div className="hero-showcase-media">
              <img
                src="/products/apple-macbook-pro-14.jpg"
                alt="Apple MacBook Pro 14 M3 Pro"
                onError={handleProductImageError}
              />
            </div>
            <div className="hero-showcase-meta">
              <span className="hero-showcase-tag">Computing</span>
              <strong>MacBook Pro 14&quot; M3 Pro</strong>
            </div>
          </div>

          <div className="hero-showcase-side">
            <div className="hero-showcase-mini">
              <div className="hero-showcase-mini-media">
                <img
                  src="/products/apple-iphone-16-pro.jpg"
                  alt="Apple iPhone 16 Pro"
                  onError={handleProductImageError}
                />
              </div>
              <div className="hero-showcase-mini-meta">
                <span>Smartphones</span>
                <strong>iPhone 16 Pro</strong>
              </div>
            </div>

            <div className="hero-showcase-mini">
              <div className="hero-showcase-mini-media">
                <img
                  src="/products/sony-wh-1000xm5.jpg"
                  alt="Sony WH-1000XM5 Headphones"
                  onError={handleProductImageError}
                />
              </div>
              <div className="hero-showcase-mini-meta">
                <span>Acoustics</span>
                <strong>Sony WH-1000XM5</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-hub-strip">
          <span className="hero-hub-dot" />
          <span>Ahmedabad Flagship Hub</span>
          <b>In-Stock · Ready for Pickup</b>
        </div>
      </div>
    </section>
  );
}

function CategorySection({ selected, setSelected, products = [] }) {
  return (
    <section className="section">
      <div className="section-head">
        <div>
          <p className="kicker">EXPLORE BY CATEGORY</p>
          <h2>Featured Categories</h2>
        </div>
        <button className="text-button" onClick={() => setSelected('all')}>
          View all <b>→</b>
        </button>
      </div>
      <div className="category-grid">
        {categories.map(([icon, label, slug]) => (
          <button
            className={`category-card ${selected === slug ? 'selected' : ''}`}
            onClick={() => setSelected(slug)}
            key={slug}
          >
            <span className="category-icon">{icon}</span>
            <strong>{label}</strong>
            <small>
              {products.filter((p) => p.category === slug).length} items <b>→</b>
            </small>
          </button>
        ))}
      </div>
    </section>
  );
}

function Benefits() {
  return (
    <div className="benefits">
      <div>
        <span className="benefit-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="1" y="3" width="15" height="13" rx="2" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
        </span>
        <p>
          <b>Fast Delivery</b>
          <small>Free delivery above ₹4,747</small>
        </p>
      </div>
      <div>
        <span className="benefit-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </span>
        <p>
          <b>100% Authentic</b>
          <small>Direct from official brands</small>
        </p>
      </div>
      <div>
        <span className="benefit-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </span>
        <p>
          <b>Easy 7-Day Returns</b>
          <small>Hassle-free replacement policy</small>
        </p>
      </div>
      <div>
        <span className="benefit-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 9l2-5h14l2 5" />
            <path d="M3 9v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9" />
            <path d="M9 21V13h6v8" />
          </svg>
        </span>
        <p>
          <b>5 Local Stores</b>
          <small>Express pickup in Ahmedabad</small>
        </p>
      </div>
    </div>
  );
}

function ProductCard({
  product,
  addToCart,
  wishlist,
  toggleWishlist,
  comparing,
  compareLimitReached,
  toggleCompare,
  onViewProduct,
}) {
  return (
    <article className="product-card">
      <div className="product-image">
        {product.discount && <span className="discount">{product.discount}</span>}
        <button
          className={`heart ${wishlist ? 'liked' : ''}`}
          onClick={() => toggleWishlist(product.id)}
          aria-label={wishlist ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </button>
        <img
          src={product.image}
          alt={product.name}
          onClick={() => onViewProduct && onViewProduct(product)}
          style={{ cursor: 'pointer' }}
          onError={handleProductImageError}
        />
      </div>
      <div className="product-info">
        <h3
          onClick={() => onViewProduct && onViewProduct(product)}
          style={{ cursor: 'pointer' }}
          title={product.name}
        >
          {product.name}
        </h3>
        <p>{product.description}</p>
        <div className="rating">
          <strong>★ {product.rating || '4.8'}</strong>
          <span>({product.reviews || '120+'})</span>
        </div>
        <div className="price-row">
          <div>
            <b>{formatINR(product.price)}</b>
            {product.oldPrice > product.price && <del>{formatINR(product.oldPrice)}</del>}
          </div>
          <button
            className="add-button"
            onClick={() => addToCart(product)}
            aria-label={`Add ${product.name} to cart`}
          >
            Add <span>+</span>
          </button>
        </div>
        <button
          className="compare-button"
          disabled={compareLimitReached}
          onClick={() => toggleCompare(product.id)}
        >
          {comparing ? '✓ In comparison' : compareLimitReached ? 'Max 4 in compare' : '+ Compare'}
        </button>
      </div>
    </article>
  );
}

function ProductSection({
  filter,
  search,
  addToCart,
  wishlist,
  toggleWishlist,
  compareIds,
  toggleCompare,
  onViewProduct,
  onNavigate,
  products = [],
}) {
  const filtered = products.filter((p) => {
    const matchesCategory = filter === 'all' || p.category === filter;
    const matchesSearch = !search || searchProducts([p], search).length > 0;
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="section" id="catalog-section">
      <div className="section-head">
        <div>
          <p className="kicker">CURATED SELECTION</p>
          <h2>Popular Electronics</h2>
        </div>
        <button className="text-button" onClick={() => onNavigate('Phones')}>
          Explore phones <b>→</b>
        </button>
      </div>
      <div className="product-grid">
        {filtered.slice(0, 8).map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            addToCart={addToCart}
            wishlist={wishlist.includes(product.id)}
            toggleWishlist={toggleWishlist}
            comparing={compareIds.includes(product.id)}
            compareLimitReached={compareIds.length >= 4 && !compareIds.includes(product.id)}
            toggleCompare={toggleCompare}
            onViewProduct={onViewProduct}
          />
        ))}
      </div>
    </section>
  );
}

function HotDealsSection({
  deals = [],
  search = '',
  addToCart,
  wishlist,
  toggleWishlist,
  compareIds,
  toggleCompare,
  onViewProduct,
  onViewAllDeals,
}) {
  const visibleDeals = useMemo(() => {
    const queryFiltered = !search
      ? deals
      : deals.filter((p) => searchProducts([p], search).length > 0);
    // Prioritize active Flash Sale / Price Crash events first, then high-discount deals
    return [...queryFiltered]
      .sort((a, b) => (b.activeOffer ? 1 : 0) - (a.activeOffer ? 1 : 0))
      .slice(0, 8);
  }, [deals, search]);

  return (
    <section className="section" id="deals">
      <div className="section-head">
        <div>
          <p className="kicker">LIMITED TIME OFFERS</p>
          <h2>Hot Deals</h2>
        </div>
        <button className="text-button" onClick={onViewAllDeals}>
          View all ({deals.length}) <b>→</b>
        </button>
      </div>
      {visibleDeals.length > 0 ? (
        <div className="product-grid">
          {visibleDeals.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              addToCart={addToCart}
              wishlist={wishlist.includes(product.id)}
              toggleWishlist={toggleWishlist}
              comparing={compareIds.includes(product.id)}
              compareLimitReached={compareIds.length >= 4 && !compareIds.includes(product.id)}
              toggleCompare={toggleCompare}
              onViewProduct={onViewProduct}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          No active Hot Deals right now. Check back soon or explore our catalog below.
        </div>
      )}
    </section>
  );
}

const catalogPages = {
  Phones: { title: 'Flagship Smartphones', kicker: 'NEXT-GEN MOBILITY', category: 'phones' },
  Laptops: { title: 'High-Performance Laptops', kicker: 'PORTABLE COMPUTING', category: 'laptops' },
  Audio: { title: 'Audiophile & Wireless Audio', kicker: 'ACOUSTIC ENGINEERING', category: 'headphones' },
  Cameras: { title: 'Cameras & Vlogging Gear', kicker: 'VISUAL CREATIVITY', category: 'cameras' },
  Gaming: { title: 'Gaming Gear & Consoles', kicker: 'COMPETITIVE HARDWARE', category: 'gaming' },
  Wearables: { title: 'Smartwatches & Trackers', kicker: 'CONNECTED LIFESTYLE', category: 'wearables' },
  'Smart Home': { title: 'Smart Home & Wi-Fi Systems', kicker: 'CONNECTED LIVING', category: 'smart home' },
  Deals: { title: 'ElectroHaven Hot Deals', kicker: 'LIMITED TIME OFFERS', dealsOnly: true },
};

function CatalogPage({
  page,
  search,
  addToCart,
  wishlist,
  toggleWishlist,
  compareIds,
  toggleCompare,
  onViewProduct,
  products = [],
}) {
  const config = catalogPages[page] || { title: page, kicker: 'CATALOGUE', category: 'all' };
  const pageProducts = products.filter((p) => {
    const matchesCat = !config.category || config.category === 'all' || p.category === config.category;
    const matchesDeals = !config.dealsOnly || isProductFeaturedInHotDeals(p);
    const matchesSearch = !search || searchProducts([p], search).length > 0;
    return matchesCat && matchesDeals && matchesSearch;
  });

  return (
    <section className="section catalog-page">
      <div className="section-head">
        <div>
          <p className="kicker">{config.kicker}</p>
          <h1>{config.title}</h1>
          <p className="catalog-description">
            {config.dealsOnly
              ? `Showing ${pageProducts.length} active high-discount (20%+), Flash Sale, and Price Crash deals.`
              : `Showing ${pageProducts.length} authentic models available for immediate delivery.`}
          </p>
        </div>
      </div>
      {pageProducts.length > 0 ? (
        <div className="product-grid">
          {pageProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              addToCart={addToCart}
              wishlist={wishlist.includes(product.id)}
              toggleWishlist={toggleWishlist}
              comparing={compareIds.includes(product.id)}
              compareLimitReached={compareIds.length >= 4 && !compareIds.includes(product.id)}
              toggleCompare={toggleCompare}
              onViewProduct={onViewProduct}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          No active deals match your current filter. Check back later for new offers!
        </div>
      )}
    </section>
  );
}

function WishlistPage({
  search,
  wishlist,
  addToCart,
  toggleWishlist,
  compareIds,
  toggleCompare,
  onContinueShopping,
  onViewProduct,
  products = [],
}) {
  const savedProducts = products.filter(
    (product) =>
      wishlist.includes(product.id) &&
      (!search.trim() || searchProducts([product], search).length > 0)
  );

  return (
    <section className="section wishlist-page">
      <div className="section-head wishlist-heading">
        <div>
          <p className="kicker">YOUR SAVED GEAR</p>
          <h1>
            Wishlist <span>({wishlist.length} {wishlist.length === 1 ? 'item' : 'items'})</span>
          </h1>
          <p className="catalog-description">
            Keep the products you love close by and add them to your cart whenever you’re ready.
          </p>
        </div>
      </div>
      {savedProducts.length ? (
        <div className="product-grid">
          {savedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              addToCart={addToCart}
              wishlist={wishlist.includes(product.id)}
              toggleWishlist={toggleWishlist}
              comparing={compareIds.includes(product.id)}
              compareLimitReached={compareIds.length >= 4 && !compareIds.includes(product.id)}
              toggleCompare={toggleCompare}
              onViewProduct={onViewProduct}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state wishlist-empty-state">
          <span className="wishlist-empty-icon">♡</span>
          <h2>
            {wishlist.length
              ? 'No saved products match your search'
              : 'Your wishlist is waiting for favourites'}
          </h2>
          <p>
            {wishlist.length
              ? 'Try another search to find a saved product.'
              : 'Tap the heart on any product to save it here for later.'}
          </p>
          {!wishlist.length && (
            <button className="primary" type="button" onClick={onContinueShopping}>
              Explore products <b>→</b>
            </button>
          )}
        </div>
      )}
    </section>
  );
}

function Brands() {
  const [selected, setSelected] = useState('Apple');
  return (
    <section className="section brands-section">
      <div className="section-head">
        <div>
          <p className="kicker">THE BEST IN TECH</p>
          <h2>Popular Brands</h2>
        </div>
        <button className="text-button">
          Explore brands <b>→</b>
        </button>
      </div>
      <div className="brand-grid">
        {['Apple', 'Samsung', 'Sony', 'Dell', 'Lenovo', 'HP'].map((brand, index) => (
          <button
            className={`brand-card ${selected === brand ? 'selected' : ''}`}
            onClick={() => setSelected(brand)}
            key={brand}
          >
            <span className={`brand-symbol symbol-${index}`}>
              {['A', 'S', 'S', 'D', 'L', 'H'][index]}
            </span>
            <strong>{brand}</strong>
            <small>Official store</small>
          </button>
        ))}
      </div>
    </section>
  );
}

function Compare({ page = false, selectedProducts = [], onRemove, onClear, onViewProduct }) {
  if (page) {
    const rows = [
      ['Category', (product) => product.category],
      ['Product type', (product) => product.type],
      ['Description', (product) => product.description],
      ['Price', (product) => formatINR(product.price)],
      ['Original price', (product) => formatINR(product.oldPrice)],
      ['Discount', (product) => product.discount],
      ['Rating', (product) => `★ ${product.rating} / 5`],
      ['Reviews', (product) => product.reviews],
    ];

    return (
      <section className="section compare-section comparison-page">
        <div className="section-head">
          <div>
            <p className="kicker">SIDE-BY-SIDE PRODUCT DETAILS</p>
            <h2>Product Comparison</h2>
            <p className="catalog-description">
              Select up to three products from any category to compare them.
            </p>
          </div>
          {selectedProducts.length > 0 && (
            <button className="text-button" onClick={onClear}>
              Clear all
            </button>
          )}
        </div>
        {selectedProducts.length > 0 ? (
          <div className="compare-wrap">
            <table>
              <thead>
                <tr>
                  <th>Specifications</th>
                  {selectedProducts.map((product) => (
                    <th key={product.id}>
                      <div className="compare-product">
                        <strong
                          onClick={() => onViewProduct && onViewProduct(product)}
                          style={{ cursor: 'pointer' }}
                          title="View product details"
                        >
                          {product.name}
                        </strong>
                        <span>{formatINR(product.price)}</span>
                        <button
                          className="outline-button"
                          onClick={() => onRemove(product.id)}
                          aria-label={`Remove ${product.name} from comparison`}
                        >
                          Remove
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(([label, getValue]) => (
                  <tr key={label}>
                    <th>{label}</th>
                    {selectedProducts.map((product) => (
                      <td key={product.id}>{getValue(product)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            No products selected. Browse a category and choose “Add to comparison” on up to three product cards.
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="section compare-section">
      <div className="section-head">
        <div>
          <p className="kicker">SIDE-BY-SIDE SPECS</p>
          <h2>Flagship Laptop Comparison</h2>
        </div>
        <button className="text-button">
          Compare models <b>→</b>
        </button>
      </div>
      <div className="compare-wrap">
        <table>
          <thead>
            <tr>
              <th>Model</th>
              {compareProducts.map((product) => (
                <th key={product.name}>
                  <div className="compare-product">
                    <span className="mini-laptop">▣</span>
                    <strong>{product.name}</strong>
                    <span>{formatINR(product.price)}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['Display', 'display'],
              ['Processor', 'processor'],
              ['RAM', 'ram'],
              ['Storage', 'storage'],
              ['Rating', 'rating'],
            ].map(([label, key]) => (
              <tr key={label}>
                <th>{label}</th>
                {compareProducts.map((product) => (
                  <td key={product.name}>
                    {key === 'rating' ? <span className="stars">★ </span> : null}
                    {product[key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Promos() {
  return (
    <section className="promo-grid">
      <article className="promo trade">
        <div>
          <p className="kicker">TRADE-IN PROGRAM</p>
          <h2>
            Get up to {formatINR(47470)}
            <br />
            for your old device
          </h2>
          <p>Trade in your existing tech effortlessly with instant online appraisal.</p>
          <button className="secondary">
            Get your estimate <b>→</b>
          </button>
        </div>
        <div className="promo-motif" aria-hidden="true">
          <svg width="88" height="88" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="6" y="2" width="12" height="20" rx="2.5" />
            <line x1="10" y1="18" x2="14" y2="18" />
          </svg>
        </div>
      </article>
      <article className="promo premium">
        <div>
          <p className="kicker">ELECTROHAVEN MEMBERSHIP</p>
          <h2>
            Express shipping &amp;
            <br />
            priority drops
          </h2>
          <p>Unlock early access to flagship launches, extended warranty perks, and curated deals.</p>
          <button className="secondary">
            Become a member <b>→</b>
          </button>
        </div>
        <div className="promo-motif" aria-hidden="true">
          <svg width="88" height="88" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2Z" />
          </svg>
        </div>
      </article>
    </section>
  );
}

function Footer({ onNavigate }) {
  return (
    <footer>
      <div className="footer-main">
        <div className="footer-brand">
          <a
            className="logo"
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('Home');
            }}
          >
            <span className="logo-mark">
              <BrandMark size={17} />
            </span>
            <span>
              Electro<span>Haven</span>
            </span>
          </a>
          <p>
            Authorised multi-brand destination for curated personal tech, audio, and workspace hardware.
          </p>
          <div className="socials">
            <button type="button" aria-label="Instagram">IG</button>
            <button type="button" aria-label="X">𝕏</button>
            <button type="button" aria-label="LinkedIn">in</button>
            <button type="button" aria-label="YouTube">YT</button>
          </div>
        </div>
        {[
          ['Shop', 'Phones', 'Laptops', 'Audio', 'Cameras', 'Gaming'],
          ['Support', 'Help Center', 'Shipping', 'Returns', 'Contact'],
          ['Company', 'About', 'Careers', 'Privacy', 'Admin Portal'],
        ].map(([title, ...links]) => (
          <div className="footer-col" key={title}>
            <strong>{title}</strong>
            {links.map((link) => (
              <a
                href="#top"
                key={link}
                onClick={(e) => {
                  if (['Phones', 'Laptops', 'Audio', 'Cameras', 'Gaming'].includes(link)) {
                    e.preventDefault();
                    onNavigate(link);
                  } else if (link === 'Admin Portal') {
                    e.preventDefault();
                    onNavigate('Admin');
                  }
                }}
              >
                {link}
              </a>
            ))}
          </div>
        ))}
      </div>
      <p className="currency-note">
        Official electronics storefront in India. All product photography, specifications, and brand trademarks are authentic representations of respective manufacturers.
      </p>
      <div className="footer-bottom">
        <span>© 2026 ElectroHaven Electronics. All rights reserved.</span>
        <span>Pan-India Express Shipping · Authorised Brand Warranty</span>
      </div>
    </footer>
  );
}

export default function App() {
  const initialRoute = useMemo(() => parseCurrentRoute(), []);
  const initialUser = useMemo(() => getCurrentUser(), []);
  const isProtectedRoute = (page) => page === 'Checkout' || page === 'Orders' || page === 'Profile';

  // Authentication State
  const [user, setUser] = useState(() => initialUser);
  const [authReturnTo, setAuthReturnTo] = useState(() => {
    if (isProtectedRoute(initialRoute.page) && !initialUser) {
      return initialRoute.page;
    }
    try {
      const saved = sessionStorage.getItem('electrohaven_auth_return_to');
      return saved && saved !== 'Auth' && saved !== 'Home' ? saved : 'Profile';
    } catch {
      return 'Profile';
    }
  });
  const [authInitialMode, setAuthInitialMode] = useState('login');

  const [activeNav, setActiveNav] = useState(() => {
    if (isProtectedRoute(initialRoute.page) && !initialUser) {
      return 'Auth';
    }
    if (initialRoute.page === 'Auth' && initialUser) {
      return 'Profile';
    }
    return initialRoute.page;
  });
  const [category, setCategory] = useState(() => initialRoute.category || 'all');
  const [search, setSearch] = useState(() => initialRoute.query || '');
  const [submittedSearch, setSubmittedSearch] = useState(() => initialRoute.query || '');
  const [viewedProductId, setViewedProductId] = useState(() => initialRoute.productId || null);

  // Dynamic products & offers connected to Admin Central
  const [products, setProducts] = useState(() => getAdminProducts());
  const [dealOffers, setDealOffers] = useState(() => getAdminDealOffers());
  const [offerClockTick, setOfferClockTick] = useState(0);

  const effectiveProducts = useMemo(
    () => applyOffersToProducts(products, dealOffers, new Date()),
    [products, dealOffers, offerClockTick]
  );

  const hotDealsProducts = useMemo(
    () => getHotDealProducts(effectiveProducts),
    [effectiveProducts]
  );

  // Cart & Checkout State (persisted via localStorage)
  const [cart, setCart] = useState(() => getStoredCart());
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [lastRemovedProduct, setLastRemovedProduct] = useState(null);
  const [lastCompletedOrder, setLastCompletedOrder] = useState(null);
  const [checkoutFulfillmentType, setCheckoutFulfillmentType] = useState('delivery');
  const [checkoutPickupStore, setCheckoutPickupStore] = useState(null);

  // Other State
  const [wishlist, setWishlist] = useState([]);
  const [compareIds, setCompareIds] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [previousPage, setPreviousPage] = useState('Home');
  const [preferredStore, setPreferredStore] = useState(() => getSavedPreferredStore());
  const [deliveryPincode, setDeliveryPincode] = useState(() => getSavedPincode());

  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('electrohaven_theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  // Seed demo customer and master admin accounts on startup
  useEffect(() => {
    seedDemoAccountIfNeeded();
  }, []);

  // Periodically check active timed offers so expired offers clear automatically
  useEffect(() => {
    const hasExpiringOffers = dealOffers.some(
      (o) => o && o.status !== 'inactive' && o.validUntil && isOfferCurrentlyActive(o)
    );
    if (!hasExpiringOffers) return undefined;
    const timer = setInterval(() => setOfferClockTick((t) => t + 1), 30000);
    return () => clearInterval(timer);
  }, [dealOffers]);

  // Multi-Channel Real-Time Pub/Sub Synchronization (BroadcastChannel, StorageEvent & WebSockets)
  useEffect(() => {
    const unsubscribe = subscribeToRealtimeSync((message) => {
      if (message.entity === 'products' || message.entity === 'offers' || message.entity === 'coupons') {
        const latestProducts = getAdminProducts();
        const latestOffers = getAdminDealOffers();
        setProducts(latestProducts);
        setDealOffers(latestOffers);
        setOfferClockTick((t) => t + 1);

        const resolvedLatest = applyOffersToProducts(latestProducts, latestOffers);
        // Instantly synchronize cart items with new prices, titles, images, and discounts!
        setCart((currentCart) => {
          const synced = synchronizeCartWithLatestProducts(currentCart, resolvedLatest);
          saveStoredCart(synced);
          return synced;
        });
      }

      if (message.entity === 'stores') {
        setPreferredStore(getSavedPreferredStore());
      }
    });

    return () => unsubscribe();
  }, []);

  // Lock background scroll when mobile sidebar is open
  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add('sidebar-open-locked');
    } else {
      document.body.classList.remove('sidebar-open-locked');
    }
    return () => {
      document.body.classList.remove('sidebar-open-locked');
    };
  }, [menuOpen]);

  // Save cart changes to localStorage
  useEffect(() => {
    saveStoredCart(cart);
  }, [cart]);

  // Synchronize theme with data-theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try {
      localStorage.setItem('electrohaven_theme', next);
    } catch {}
    document.documentElement.setAttribute('data-theme', next);
  };

  const handleSetPreferredStore = (store) => {
    setPreferredStore(store);
    savePreferredStore(store);
  };

  const handleSearchSubmit = (query) => {
    const clean = (query || '').trim();
    if (!clean) return;
    setSubmittedSearch(clean);
    setSearch(clean);
    navigate('Search', { query: clean });
  };

  const handleClearSearch = () => {
    setSearch('');
    setSubmittedSearch('');
    if (activeNav === 'Search') {
      navigate('Home');
    }
  };

  const cartCount = useMemo(() => cart.reduce((total, item) => total + item.quantity, 0), [cart]);
  const comparedProducts = useMemo(
    () => effectiveProducts.filter((product) => compareIds.includes(product.id)),
    [effectiveProducts, compareIds]
  );

  // Synchronize dynamic routing with URL path, hashchange and history popstate
  useEffect(() => {
    if (isProtectedRoute(initialRoute.page) && !initialUser) {
      persistRoute({ page: 'Auth' }, true);
    } else if (initialRoute.page === 'Auth' && initialUser) {
      persistRoute({ page: 'Profile' }, true);
    } else {
      persistRoute(initialRoute, true);
    }

    const handleLocationChange = () => {
      const route = parseCurrentRoute();
      const activeUser = getCurrentUser();

      if ((route.page === 'Checkout' || route.page === 'Orders' || route.page === 'Profile') && !activeUser) {
        try {
          sessionStorage.setItem('electrohaven_auth_return_to', route.page);
        } catch {}
        setAuthReturnTo(route.page);
        setAuthInitialMode('login');
        setActiveNav('Auth');
        setViewedProductId(null);
        return;
      }

      if (route.page === 'Auth' && activeUser) {
        setActiveNav('Profile');
        setViewedProductId(null);
        persistRoute({ page: 'Profile' }, true);
        return;
      }

      if (route.page === 'Product' && route.productId) {
        setViewedProductId(route.productId);
        setActiveNav('Product');
      } else if (route.page === 'Search') {
        if (route.query) {
          setSubmittedSearch(route.query);
          setSearch(route.query);
        }
        setActiveNav('Search');
        setViewedProductId(null);
      } else if (route.page === 'Home') {
        if (route.category) {
          setCategory(route.category);
        }
        setActiveNav('Home');
        setViewedProductId(null);
      } else {
        setActiveNav(route.page);
        setViewedProductId(null);
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Cart operations
  const addToCart = (product) => {
    setCart((current) => {
      const exists = current.some((item) => item.id === product.id);
      if (exists) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
  };

  const addMultipleToCart = (productsList) => {
    if (!Array.isArray(productsList) || productsList.length === 0) return;
    setCart((current) => {
      let updated = [...current];
      productsList.forEach((prod) => {
        const existingIndex = updated.findIndex((item) => item.id === prod.id);
        if (existingIndex >= 0) {
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + 1,
          };
        } else {
          updated.push({ ...prod, quantity: 1 });
        }
      });
      return updated;
    });
  };

  const updateCartQuantity = (id, quantity) => {
    if (quantity < 1) {
      const removedProduct = cart.find((item) => item.id === id);
      if (removedProduct) setLastRemovedProduct(removedProduct);
      setCart((current) => current.filter((item) => item.id !== id));
      return;
    }

    setCart((current) =>
      current.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (id) => {
    const removedProduct = cart.find((item) => item.id === id);
    if (removedProduct) setLastRemovedProduct(removedProduct);
    setCart((current) => current.filter((item) => item.id !== id));
  };

  const toggleWishlist = (id) =>
    setWishlist((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );

  const toggleCompare = (id) =>
    setCompareIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : current.length < 4
        ? [...current, id]
        : current
    );

  // Protected & general navigation router
  const navigate = (item, options = {}) => {
    // Admin route
    if (item === 'Admin') {
      setActiveNav('Admin');
      setMenuOpen(false);
      setViewedProductId(null);
      persistRoute({ page: 'Admin' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Protected routes check: Checkout, Orders, Profile
    const effectiveUser =
      options.authenticatedUser !== undefined ? options.authenticatedUser : (user || getCurrentUser());
    if ((item === 'Checkout' || item === 'Orders' || item === 'Profile') && !effectiveUser) {
      try {
        sessionStorage.setItem('electrohaven_auth_return_to', item);
      } catch {}
      setAuthReturnTo(item);
      setAuthInitialMode('login');
      setActiveNav('Auth');
      setMenuOpen(false);
      persistRoute({ page: 'Auth' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Search route
    if (item === 'Search') {
      const q = options.query !== undefined ? options.query : (submittedSearch || search || '');
      setActiveNav('Search');
      setMenuOpen(false);
      setViewedProductId(null);
      persistRoute({ page: 'Search', query: q });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Home or category routes
    if (item === 'Home') {
      const cat = options.category !== undefined ? options.category : (options.resetCategory ? 'all' : category);
      if (options.resetCategory) {
        setCategory('all');
      } else if (options.category !== undefined) {
        setCategory(options.category);
      }
      setActiveNav('Home');
      setMenuOpen(false);
      setViewedProductId(null);
      persistRoute({ page: 'Home', category: cat });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setActiveNav(item);
    setMenuOpen(false);
    if (item !== 'Product') {
      setViewedProductId(null);
    }
    persistRoute({ page: item }, Boolean(options.replace));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAuthPage = (mode = 'login', returnTarget = 'Profile') => {
    const resolvedTarget =
      returnTarget && returnTarget !== 'Auth' && returnTarget !== 'Home'
        ? returnTarget
        : 'Profile';
    try {
      sessionStorage.setItem('electrohaven_auth_return_to', resolvedTarget);
    } catch {}
    setAuthInitialMode(mode);
    setAuthReturnTo(resolvedTarget);
    setActiveNav('Auth');
    setMenuOpen(false);
    persistRoute({ page: 'Auth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = (authedUser, returnTarget) => {
    setUser(authedUser);
    const resolvedTarget =
      returnTarget && returnTarget !== 'Auth' && returnTarget !== 'Home'
        ? returnTarget
        : 'Profile';
    try {
      sessionStorage.removeItem('electrohaven_auth_return_to');
    } catch {}
    navigate(resolvedTarget, { authenticatedUser: authedUser, replace: true });
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    if (activeNav === 'Checkout' || activeNav === 'Orders' || activeNav === 'Profile') {
      navigate('Home');
    }
  };

  const handleProceedToCheckout = (couponCode) => {
    setAppliedCoupon(couponCode || '');
    setCheckoutFulfillmentType('delivery');
    if (!user) {
      openAuthPage('login', 'Checkout');
      return;
    }
    navigate('Checkout');
  };

  const handleStorePickupFromPDP = (product, store, qty = 1) => {
    setCart((current) => {
      const exists = current.find((i) => i.id === product.id);
      if (exists) {
        return current.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [...current, { ...product, quantity: qty }];
    });

    setCheckoutFulfillmentType('store_pickup');
    setCheckoutPickupStore(store);

    if (user) {
      navigate('Checkout');
    } else {
      openAuthPage('login', 'Checkout');
    }
  };

  const handleOrderSuccess = (order) => {
    setLastCompletedOrder(order);
    setCart([]);
    navigate('OrderConfirmation');
  };

  const handleReorderItems = (orderItems) => {
    if (!orderItems || orderItems.length === 0) return;
    setCart((current) => {
      let nextCart = [...current];
      orderItems.forEach((orderItem) => {
        const existing = nextCart.find((i) => i.id === orderItem.id);
        if (existing) {
          nextCart = nextCart.map((i) =>
            i.id === orderItem.id ? { ...i, quantity: i.quantity + orderItem.quantity } : i
          );
        } else {
          const fullProduct = products.find((p) => p.id === orderItem.id) || orderItem;
          nextCart.push({ ...fullProduct, quantity: orderItem.quantity });
        }
      });
      return nextCart;
    });
    navigate('Cart');
  };

  const viewProduct = (product) => {
    if (activeNav !== 'Product') {
      setPreviousPage(activeNav);
    }
    setViewedProductId(product.id);
    setActiveNav('Product');
    setMenuOpen(false);
    persistRoute({ page: 'Product', productId: product.id });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromProduct = () => {
    const targetPage = previousPage === 'Product' ? 'Home' : previousPage;
    navigate(targetPage);
  };

  const handleNavigateCategory = (cat) => {
    const pageEntry = Object.entries(catalogPages).find(([pageName, info]) => info.category === cat);
    if (pageEntry) {
      navigate(pageEntry[0]);
    } else {
      setCategory(cat);
      navigate('Home', { category: cat });
    }
  };

  const viewedProduct = effectiveProducts.find((product) => product.id === viewedProductId);

  // Dedicated Full-Width Admin Dashboard View
  if (activeNav === 'Admin') {
    return (
      <div className="app admin-fullscreen" data-theme={theme}>
        <AdminDashboard
          currentUser={user}
          onLoginSuccess={(authedUser) => {
            setUser(authedUser);
          }}
          onExitToStore={() => navigate('Home')}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      </div>
    );
  }

  return (
    <div className="app" data-theme={theme}>
      <Header
        cartCount={cartCount}
        wishlistCount={wishlist.length}
        search={search}
        setSearch={setSearch}
        products={effectiveProducts}
        onSearchSubmit={handleSearchSubmit}
        onViewProduct={viewProduct}
        onSelectCategory={handleNavigateCategory}
        onMenu={() => setMenuOpen(!menuOpen)}
        onCart={() => navigate('Cart')}
        onWishlist={() => navigate('Wishlist')}
        onHome={() => {
          handleClearSearch();
          navigate('Home');
        }}
        onStores={() => navigate('Stores')}
        preferredStore={preferredStore}
        user={user}
        onOpenAuth={(mode) => openAuthPage(mode, 'Profile')}
        onOpenProfile={() => navigate('Profile')}
        onOpenOrders={() => navigate('Orders')}
        onOpenAdmin={() => navigate('Admin')}
        onLogout={handleLogout}
      />

      <Sidebar
        active={activeNav}
        setActive={navigate}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        compareCount={compareIds.length}
        cartCount={cartCount}
        wishlistCount={wishlist.length}
        theme={theme}
        onToggleTheme={toggleTheme}
        user={user}
        onOpenAuth={(mode) => openAuthPage(mode, 'Profile')}
        onOpenSupport={() => setSupportModalOpen(true)}
        onLogout={handleLogout}
      />

      <SupportModal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
      />

      <main>
        {activeNav === 'Auth' ? (
          <AuthPage
            initialMode={authInitialMode}
            returnTo={authReturnTo}
            onAuthSuccess={handleAuthSuccess}
            onCancel={() => navigate('Home')}
          />
        ) : activeNav === 'Profile' ? (
          <UserProfilePage
            user={user}
            onLogout={handleLogout}
            onNavigateOrders={() => navigate('Orders')}
            onNavigateWishlist={() => navigate('Wishlist')}
            onNavigateCart={() => navigate('Cart')}
            onContinueShopping={() => navigate('Home')}
            onPromptLogin={(target) => openAuthPage('login', target)}
          />
        ) : activeNav === 'Checkout' ? (
          <CheckoutPage
            cart={cart}
            user={user}
            appliedCoupon={appliedCoupon}
            onOrderSuccess={handleOrderSuccess}
            onBackToCart={() => navigate('Cart')}
            onPromptLogin={(target) => openAuthPage('login', target)}
            initialFulfillmentType={checkoutFulfillmentType}
            initialPickupStore={checkoutPickupStore}
            preferredStore={preferredStore}
            onSetPreferredStore={handleSetPreferredStore}
          />
        ) : activeNav === 'OrderConfirmation' ? (
          <OrderConfirmationPage
            order={lastCompletedOrder}
            onContinueShopping={() => navigate('Home')}
            onNavigateOrders={() => navigate('Orders')}
          />
        ) : activeNav === 'Orders' ? (
          <OrdersHistoryPage
            user={user}
            onContinueShopping={() => navigate('Home')}
            onReorderItems={handleReorderItems}
            onViewOrderDetails={(order) => {
              setLastCompletedOrder(order);
              navigate('OrderConfirmation');
            }}
            onPromptLogin={(target) => openAuthPage('login', target)}
          />
        ) : activeNav === 'Search' ? (
          <SearchResultsPage
            query={submittedSearch || search}
            allProducts={effectiveProducts}
            addToCart={addToCart}
            wishlist={wishlist}
            toggleWishlist={toggleWishlist}
            compareIds={compareIds}
            toggleCompare={toggleCompare}
            onViewProduct={viewProduct}
            onSearch={handleSearchSubmit}
            onClearSearch={handleClearSearch}
            onContinueShopping={() => navigate('Home')}
            ProductCardComponent={ProductCard}
          />
        ) : activeNav === 'Stores' ? (
          <StoreLocatorPage
            preferredStore={preferredStore}
            onSetPreferredStore={handleSetPreferredStore}
            onContinueShopping={() => navigate('Home')}
          />
        ) : activeNav === 'Wishlist' ? (
          <WishlistPage
            search={search}
            wishlist={wishlist}
            addToCart={addToCart}
            toggleWishlist={toggleWishlist}
            compareIds={compareIds}
            toggleCompare={toggleCompare}
            onContinueShopping={() => navigate('Home')}
            onViewProduct={viewProduct}
            products={effectiveProducts}
          />
        ) : activeNav === 'Cart' ? (
          <CartPage
            cart={cart}
            lastRemovedProduct={lastRemovedProduct}
            onQuantityChange={updateCartQuantity}
            onRemoveItem={removeFromCart}
            onViewProduct={viewProduct}
            onContinueShopping={() => navigate('Home')}
            onProceedToCheckout={handleProceedToCheckout}
            user={user}
            onPromptLogin={(target) => openAuthPage('login', target)}
          />
        ) : activeNav === 'Product' && viewedProduct ? (
          <ProductDetailPage
            product={viewedProduct}
            onBack={handleBackFromProduct}
            onAddToCart={addToCart}
            onBuyNow={(prod) => {
              addToCart(prod);
              if (user) {
                navigate('Checkout');
              } else {
                openAuthPage('login', 'Checkout');
              }
            }}
            onStorePickup={handleStorePickupFromPDP}
            wishlist={wishlist}
            toggleWishlist={toggleWishlist}
            compareIds={compareIds}
            toggleCompare={toggleCompare}
            onNavigateCategory={handleNavigateCategory}
            onNavigateHome={() => navigate('Home')}
            preferredStore={preferredStore}
            onSetPreferredStore={handleSetPreferredStore}
            deliveryPincode={deliveryPincode}
            onPincodeChange={setDeliveryPincode}
          />
        ) : activeNav === 'Build Setup' || activeNav === 'SetupBuilder' ? (
          <SetupBuilderPage
            allProducts={effectiveProducts}
            onAddToCart={addToCart}
            onAddMultipleToCart={addMultipleToCart}
            onViewProduct={viewProduct}
            onCompare={(productIds) => {
              setCompareIds(productIds);
              navigate('Comparison');
            }}
            onNavigate={navigate}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
          />
        ) : activeNav === 'Comparison' ? (
          <ComparisonPage
            selectedProducts={comparedProducts}
            allProducts={effectiveProducts}
            onRemove={toggleCompare}
            onAddProduct={(id) => {
              if (!compareIds.includes(id) && compareIds.length < 4) {
                setCompareIds((current) => [...current, id]);
              }
            }}
            onClear={() => setCompareIds([])}
            onAddToCart={addToCart}
            onViewProduct={viewProduct}
            onContinueShopping={() => navigate('Home')}
          />
        ) : activeNav === 'Home' ? (
          <>
            <Hero onBuildSetup={() => navigate('Build Setup')} />
            <CategorySection selected={category} setSelected={setCategory} products={effectiveProducts} />
            <Benefits />
            <HotDealsSection
              deals={hotDealsProducts}
              search={search}
              addToCart={addToCart}
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
              compareIds={compareIds}
              toggleCompare={toggleCompare}
              onViewProduct={viewProduct}
              onViewAllDeals={() => navigate('Deals')}
            />
            <ProductSection
              filter={category}
              search={search}
              addToCart={addToCart}
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
              compareIds={compareIds}
              toggleCompare={toggleCompare}
              onViewProduct={viewProduct}
              onNavigate={navigate}
              products={effectiveProducts}
            />
            <Brands />
            <Compare onViewProduct={viewProduct} />
            <Promos />
          </>
        ) : (
          <CatalogPage
            page={activeNav}
            search={search}
            addToCart={addToCart}
            wishlist={wishlist}
            toggleWishlist={toggleWishlist}
            compareIds={compareIds}
            toggleCompare={toggleCompare}
            onViewProduct={viewProduct}
            products={effectiveProducts}
          />
        )}
      </main>
      <Footer onNavigate={navigate} />
    </div>
  );
}

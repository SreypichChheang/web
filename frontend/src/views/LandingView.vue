<template>
  <div class="landing">
    <!-- Header -->
    <header class="landing-header">
      <div class="header-inner">
        <div class="logo">
          <div class="logo-icon">🏦</div>
          <div>
            <div class="logo-name">NexaBank</div>
            <div class="logo-tagline">Digital Banking Platform</div>
          </div>
        </div>
        <nav class="header-nav">
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#how">How It Works</a>
          <a href="#reviews">Reviews</a>
          <a href="#contact">Contact</a>
        </nav>
        <button class="btn btn-primary" @click="$router.push('/login')">Login</button>
        <button class="mobile-menu-btn" @click="mobileMenu = !mobileMenu">☰</button>
      </div>
      <!-- Mobile nav -->
      <nav v-if="mobileMenu" class="mobile-nav">
        <a href="#about" @click="mobileMenu=false">About</a>
        <a href="#services" @click="mobileMenu=false">Services</a>
        <a href="#how" @click="mobileMenu=false">How It Works</a>
        <a href="#contact" @click="mobileMenu=false">Contact</a>
        <button class="btn btn-primary" @click="$router.push('/login')">Login</button>
      </nav>
    </header>

    <!-- Hero -->
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-content">
          <h1 class="hero-title">Banking for<br><span>the Digital Age</span></h1>
          <p class="hero-desc">Rent, manage and grow your finances — from savings to investments, all in one place</p>
          <div class="hero-actions">
            <button class="btn btn-white btn-lg" @click="$router.push('/login')">
              🚀 Get Started
            </button>
            <button class="btn btn-outline-white btn-lg" @click="scrollTo('#about')">
              Learn More
            </button>
          </div>
        </div>
        <div class="hero-visual">
          <div class="hero-card-stack">
            <div class="floating-card card-1">
              <div class="fc-label">Total Balance</div>
              <div class="fc-value">$24,170.75</div>
              <div class="fc-sub">+2.4% this month</div>
            </div>
            <div class="floating-card card-2">
              <div class="fc-label">Savings</div>
              <div class="fc-value">$15,420</div>
            </div>
            <div class="floating-card card-3">
              <div class="fc-icon">✅</div>
              <div class="fc-text">Transfer Completed</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- About -->
    <section id="about" class="about-section">
      <div class="container">
        <div class="about-grid">
          <div class="about-text">
            <h2>About NexaBank</h2>
            <p>We are an expert digital banking platform that helps you manage your finances effortlessly. We offer a full range of services — from account management to legal and financial consulting.</p>
            <div class="partner-logos">
              <span v-for="p in partners" :key="p" class="partner-logo">{{ p }}</span>
            </div>
          </div>
          <div class="stats-grid">
            <div class="stat-item" v-for="s in stats" :key="s.label">
              <div class="stat-value">{{ s.value }}</div>
              <div class="stat-label">{{ s.label }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Services catalog -->
    <section id="services" class="services-section">
      <div class="container">
        <div class="services-header">
          <div>
            <h2>Our Services</h2>
            <p>Broad range of banking solutions for your needs</p>
          </div>
          <div class="services-nav">
            <button class="nav-arrow" @click="prevService">‹</button>
            <button class="nav-arrow" @click="nextService">›</button>
          </div>
        </div>
        <div class="services-cards">
          <div
            v-for="(s, i) in visibleServices"
            :key="s.title"
            class="service-card"
            :style="{ animationDelay: `${i * 0.1}s` }"
          >
            <div class="service-img">{{ s.emoji }}</div>
            <div class="service-info">
              <h3>{{ s.title }}</h3>
              <p class="service-count">{{ s.count }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section id="how" class="how-section">
      <div class="container">
        <div class="how-grid">
          <div class="how-left">
            <div class="how-img-wrap">
              <div class="how-building">🏢</div>
              <div class="consult-badge">Free<br>Consultation</div>
            </div>
          </div>
          <div class="how-right">
            <h2>How It Works</h2>
            <p>We've made the process as simple and transparent as possible</p>
            <div class="steps">
              <div v-for="(step, i) in steps" :key="step.title" class="step">
                <div class="step-num">{{ i + 1 }}</div>
                <div class="step-body">
                  <div class="step-icon">{{ step.icon }}</div>
                  <div>
                    <h4>{{ step.title }}</h4>
                    <p>{{ step.desc }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Reviews -->
    <section id="reviews" class="reviews-section">
      <div class="container">
        <h2>What Our Clients Say</h2>
        <div class="reviews-grid">
          <div v-for="r in reviews" :key="r.name" class="review-card">
            <p class="review-text">"{{ r.text }}"</p>
            <div class="review-author">
              <div class="author-avatar">{{ r.name[0] }}</div>
              <div>
                <div class="author-name">{{ r.name }}</div>
                <div class="author-role">{{ r.role }}</div>
              </div>
              <div class="stars">⭐⭐⭐⭐⭐</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-box">
          <div class="cta-text">
            <h2>Let's Start Your Banking Journey!</h2>
            <p>Open your account today and experience modern banking</p>
          </div>
          <button class="btn btn-white btn-lg" @click="$router.push('/login')">
            Open Account →
          </button>
        </div>
      </div>
    </section>

    <!-- Contact -->
    <section id="contact" class="contact-section">
      <div class="container">
        <div class="contact-grid">
          <div class="contact-info">
            <div class="logo">
              <div class="logo-icon">🏦</div>
              <div class="logo-name">NexaBank</div>
            </div>
            <div class="contact-details">
              <div>📞 +1 (800) 555-0199</div>
              <div>📧 support@nexabank.com</div>
              <div>📍 123 Finance Street, New York, NY 10001</div>
              <div>🕐 Mon-Fri: 9:00 - 18:00</div>
            </div>
          </div>
          <div class="contact-links">
            <div class="link-col">
              <h4>Navigation</h4>
              <a href="#about">About Us</a>
              <a href="#services">Services</a>
              <a href="#how">How It Works</a>
            </div>
            <div class="link-col">
              <h4>Services</h4>
              <a href="#">Savings Account</a>
              <a href="#">Current Account</a>
              <a href="#">Cards</a>
              <a href="#">Loans</a>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© 2024 NexaBank. All rights reserved.</span>
          <span>Privacy Policy | Terms of Service</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const mobileMenu = ref(false)
const serviceOffset = ref(0)

const stats = [
  { value: '10+', label: 'Years of Service' },
  { value: '1000+', label: 'Happy Clients' },
  { value: '4000+', label: 'Accounts Opened' },
  { value: '95%', label: 'Satisfaction Rate' },
]

const partners = ['◆ SecureBank', '⊞ FinTrust', '⚡ PayFlow', '⊡ MoneyVault', '★ WealthCo']

const allServices = [
  { title: 'Savings Accounts', count: '3 account types', emoji: '💰' },
  { title: 'Current Accounts', count: '2 variants', emoji: '🏦' },
  { title: 'Debit Cards', count: 'Visa & Mastercard', emoji: '💳' },
  { title: 'Credit Cards', count: 'Up to $50,000 limit', emoji: '🪙' },
  { title: 'Loans', count: 'From 4.5% annual', emoji: '📋' },
  { title: 'Investments', count: 'Portfolio management', emoji: '📈' },
]

const visibleServices = computed(() => allServices.slice(serviceOffset.value, serviceOffset.value + 3))
function nextService() { if (serviceOffset.value < allServices.length - 3) serviceOffset.value++ }
function prevService() { if (serviceOffset.value > 0) serviceOffset.value-- }

const steps = [
  { icon: '💬', title: 'Consultation & Needs Analysis', desc: 'At this stage we determine what banking services you need' },
  { icon: '🔍', title: 'Account Selection', desc: 'We suggest only the best accounts matching your budget and goals' },
  { icon: '📋', title: 'Document Verification', desc: 'We conduct a thorough check of all documents and legal status' },
  { icon: '✅', title: 'Account Opening', desc: 'Complete registration and start using your account immediately' },
  { icon: '🤝', title: 'Ongoing Support', desc: 'We provide support at every stage of your banking journey' },
]

const reviews = [
  { text: 'NexaBank completely transformed how I manage my finances. Professional team, fast service, and transparent terms!', name: 'Catherine M.', role: 'Business Owner' },
  { text: 'Excellent digital banking platform! Found the perfect savings account for my needs. Highly recommend to everyone!', name: 'Robert S.', role: 'Entrepreneur' },
  { text: 'The transfer features are amazing. Large transactions handled quickly with full security. 5 stars!', name: 'Anna K.', role: 'Financial Manager' },
]

function scrollTo(selector: string) {
  document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
.landing { min-height: 100vh; overflow-x: hidden; }

/* Header */
.landing-header {
  background: white;
  border-bottom: 1px solid var(--border);
  position: sticky; top: 0; z-index: 100;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.header-inner {
  max-width: 1200px; margin: 0 auto;
  padding: 0 24px;
  display: flex; align-items: center; gap: 32px;
  height: 72px;
}
.logo { display: flex; align-items: center; gap: 12px; }
.logo-icon { font-size: 28px; }
.logo-name { font-size: 20px; font-weight: 800; color: var(--primary); }
.logo-tagline { font-size: 11px; color: var(--text-light); }
.header-nav { display: flex; gap: 28px; margin-left: auto; }
.header-nav a { font-size: 14px; font-weight: 500; color: var(--text-medium); transition: color 0.2s; }
.header-nav a:hover { color: var(--primary); }
.mobile-menu-btn { display: none; background: none; font-size: 22px; color: var(--text-dark); }
.mobile-nav {
  background: white; border-top: 1px solid var(--border);
  padding: 16px 24px;
  display: flex; flex-direction: column; gap: 12px;
}
.mobile-nav a { font-size: 15px; font-weight: 500; padding: 8px 0; }

/* Hero */
.hero {
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
  color: white; padding: 80px 0 60px;
  position: relative; overflow: hidden;
}
.hero::before {
  content: ''; position: absolute; top: -50%; right: -10%;
  width: 600px; height: 600px;
  background: rgba(255,255,255,0.05);
  border-radius: 50%;
}
.hero-inner {
  max-width: 1200px; margin: 0 auto; padding: 0 24px;
  display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;
}
.hero-title { font-size: 52px; font-weight: 800; line-height: 1.15; margin-bottom: 20px; }
.hero-title span { color: #A8D8F0; }
.hero-desc { font-size: 18px; opacity: 0.9; margin-bottom: 36px; line-height: 1.6; }
.hero-actions { display: flex; gap: 16px; flex-wrap: wrap; }
.btn-white { background: white; color: var(--primary); }
.btn-white:hover { background: #f0f9ff; transform: translateY(-2px); box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
.btn-outline-white { background: transparent; color: white; border: 2px solid rgba(255,255,255,0.6); }
.btn-outline-white:hover { background: rgba(255,255,255,0.1); }

/* Hero visual */
.hero-visual { position: relative; height: 320px; }
.hero-card-stack { position: relative; width: 100%; height: 100%; }
.floating-card {
  position: absolute;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.25);
  border-radius: 16px;
  padding: 20px 24px;
  color: white;
}
.card-1 { width: 260px; top: 20px; right: 0; }
.card-2 { width: 180px; top: 130px; right: 180px; }
.card-3 { width: 220px; bottom: 20px; right: 40px; display: flex; align-items: center; gap: 10px; }
.fc-label { font-size: 12px; opacity: 0.8; margin-bottom: 6px; }
.fc-value { font-size: 26px; font-weight: 800; }
.fc-sub { font-size: 12px; opacity: 0.8; margin-top: 4px; color: #A8F0C6; }
.fc-icon { font-size: 20px; }
.fc-text { font-size: 14px; font-weight: 500; }

/* About */
.about-section { padding: 80px 0; background: white; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
.about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: start; }
.about-text h2 { font-size: 36px; font-weight: 800; margin-bottom: 16px; }
.about-text p { color: var(--text-medium); line-height: 1.8; }
.partner-logos { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 32px; }
.partner-logo {
  padding: 8px 16px;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-medium);
}
.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.stat-item {
  background: var(--bg-light);
  border-radius: var(--radius);
  padding: 28px;
  text-align: center;
}
.stat-value { font-size: 40px; font-weight: 800; color: var(--primary); }
.stat-label { font-size: 14px; color: var(--text-medium); margin-top: 4px; }

/* Services */
.services-section { padding: 80px 0; background: var(--bg-light); }
.services-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 36px; }
.services-header h2 { font-size: 36px; font-weight: 800; }
.services-header p { color: var(--text-medium); margin-top: 4px; }
.services-nav { display: flex; gap: 12px; }
.nav-arrow {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: white;
  border: 1.5px solid var(--border);
  font-size: 20px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}
.nav-arrow:hover { background: var(--primary); color: white; border-color: var(--primary); }
.services-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.service-card {
  background: white;
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: transform 0.2s;
  cursor: pointer;
}
.service-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
.service-img {
  height: 160px;
  background: linear-gradient(135deg, var(--primary-light), var(--primary));
  display: flex; align-items: center; justify-content: center;
  font-size: 60px;
}
.service-info { padding: 20px; }
.service-info h3 { font-size: 16px; font-weight: 700; margin-bottom: 6px; }
.service-count { font-size: 13px; color: var(--text-light); }

/* How It Works */
.how-section { padding: 80px 0; background: white; }
.how-grid { display: grid; grid-template-columns: 1fr 1.4fr; gap: 60px; align-items: center; }
.how-img-wrap {
  position: relative;
  background: linear-gradient(135deg, var(--bg-light), var(--primary-light));
  border-radius: var(--radius-lg);
  height: 400px;
  display: flex; align-items: center; justify-content: center;
}
.how-building { font-size: 100px; }
.consult-badge {
  position: absolute; bottom: 40px; right: -20px;
  background: var(--primary);
  color: white;
  width: 100px; height: 100px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  text-align: center;
  font-size: 13px; font-weight: 700; line-height: 1.3;
  box-shadow: 0 4px 20px rgba(91,141,184,0.4);
}
.how-right h2 { font-size: 36px; font-weight: 800; margin-bottom: 12px; }
.how-right > p { color: var(--text-medium); margin-bottom: 32px; }
.steps { display: flex; flex-direction: column; gap: 20px; }
.step { display: flex; gap: 16px; align-items: flex-start; }
.step-num {
  min-width: 32px; height: 32px;
  background: var(--primary);
  color: white;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700;
  flex-shrink: 0;
}
.step-body { display: flex; gap: 12px; align-items: flex-start; }
.step-icon { font-size: 20px; flex-shrink: 0; margin-top: 2px; }
.step-body h4 { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
.step-body p { font-size: 13px; color: var(--text-medium); }

/* Reviews */
.reviews-section { padding: 80px 0; background: var(--bg-light); }
.reviews-section h2 { font-size: 36px; font-weight: 800; margin-bottom: 36px; text-align: center; }
.reviews-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.review-card {
  background: white;
  border-radius: var(--radius);
  padding: 28px;
  box-shadow: var(--shadow);
}
.review-text { font-size: 14px; color: var(--text-medium); line-height: 1.7; margin-bottom: 20px; font-style: italic; }
.review-author { display: flex; align-items: center; gap: 12px; }
.author-avatar {
  width: 40px; height: 40px;
  background: var(--primary);
  color: white;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: 700;
  flex-shrink: 0;
}
.author-name { font-size: 14px; font-weight: 600; }
.author-role { font-size: 12px; color: var(--text-light); }
.stars { margin-left: auto; font-size: 12px; }

/* CTA */
.cta-section { padding: 60px 0; background: var(--primary); }
.cta-box {
  display: flex; justify-content: space-between; align-items: center;
  gap: 32px; flex-wrap: wrap;
}
.cta-text h2 { font-size: 30px; font-weight: 800; color: white; margin-bottom: 8px; }
.cta-text p { color: rgba(255,255,255,0.8); }

/* Contact/Footer */
.contact-section { padding: 60px 0 0; background: #1D2127; color: white; }
.contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; padding-bottom: 40px; }
.contact-info .logo-name { color: white; }
.contact-details { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; font-size: 14px; color: #9CA3AF; }
.contact-links { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
.link-col h4 { font-size: 14px; font-weight: 700; margin-bottom: 16px; color: white; }
.link-col a { display: block; font-size: 14px; color: #9CA3AF; margin-bottom: 8px; transition: color 0.2s; }
.link-col a:hover { color: var(--primary-light); }
.footer-bottom {
  border-top: 1px solid #374151;
  padding: 20px 0;
  display: flex; justify-content: space-between;
  font-size: 13px; color: #6B7280;
}

/* Responsive */
@media (max-width: 768px) {
  .header-nav { display: none; }
  .mobile-menu-btn { display: block; margin-left: auto; }
  .hero-inner { grid-template-columns: 1fr; }
  .hero-visual { display: none; }
  .hero-title { font-size: 36px; }
  .about-grid, .how-grid, .contact-grid { grid-template-columns: 1fr; }
  .services-cards, .reviews-grid { grid-template-columns: 1fr; }
  .stats-grid { grid-template-columns: 1fr 1fr; }
  .cta-box { flex-direction: column; text-align: center; }
  .footer-bottom { flex-direction: column; gap: 8px; text-align: center; }
}
</style>

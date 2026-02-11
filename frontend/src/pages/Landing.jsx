/**
 * LeadScore Landing Page - Fixed with inline styles
 */

import { useState } from "react";
import { Link } from "react-router-dom";

function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Common styles
  const styles = {
    page: {
      fontFamily:
        "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      backgroundColor: "#ffffff",
      color: "#111827",
      minHeight: "100vh",
    },
    nav: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      backgroundColor: "rgba(255,255,255,0.95)",
      backdropFilter: "blur(10px)",
      borderBottom: "1px solid #f3f4f6",
      height: "80px",
      display: "flex",
      alignItems: "center",
    },
    navContainer: {
      maxWidth: "1280px",
      margin: "0 auto",
      padding: "0 32px",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    logo: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      textDecoration: "none",
    },
    logoBox: {
      width: "40px",
      height: "40px",
      backgroundColor: "#000",
      borderRadius: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontWeight: 700,
      fontSize: "18px",
    },
    logoText: {
      fontSize: "22px",
      fontWeight: 700,
      color: "#111827",
      letterSpacing: "-0.02em",
    },
    navLinks: {
      display: "flex",
      alignItems: "center",
      gap: "40px",
    },
    navLink: {
      fontSize: "15px",
      fontWeight: 500,
      color: "#6b7280",
      textDecoration: "none",
    },
    authButtons: {
      display: "flex",
      alignItems: "center",
      gap: "20px",
    },
    signInBtn: {
      fontSize: "15px",
      fontWeight: 500,
      color: "#374151",
      textDecoration: "none",
    },
    getStartedBtn: {
      fontSize: "15px",
      fontWeight: 600,
      backgroundColor: "#000",
      color: "#fff",
      padding: "12px 24px",
      borderRadius: "10px",
      textDecoration: "none",
      border: "none",
      cursor: "pointer",
    },
    hero: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "120px 32px 80px",
      backgroundColor: "#fafafa",
    },
    heroContent: {
      maxWidth: "900px",
      textAlign: "center",
    },
    badge: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "10px 20px",
      backgroundColor: "#eff6ff",
      border: "1px solid #dbeafe",
      borderRadius: "50px",
      marginBottom: "48px",
    },
    badgeDot: {
      width: "8px",
      height: "8px",
      backgroundColor: "#3b82f6",
      borderRadius: "50%",
    },
    badgeText: {
      fontSize: "14px",
      fontWeight: 500,
      color: "#1d4ed8",
    },
    headline: {
      fontSize: "clamp(56px, 12vw, 100px)",
      fontWeight: 800,
      lineHeight: 0.95,
      letterSpacing: "-0.04em",
      color: "#111827",
      marginBottom: "32px",
    },
    headlineGray: {
      color: "#9ca3af",
    },
    subheadline: {
      fontSize: "clamp(18px, 2.5vw, 24px)",
      fontWeight: 400,
      lineHeight: 1.6,
      color: "#6b7280",
      maxWidth: "700px",
      margin: "0 auto 48px",
    },
    ctaContainer: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "16px",
      marginBottom: "64px",
    },
    primaryBtn: {
      fontSize: "18px",
      fontWeight: 600,
      backgroundColor: "#000",
      color: "#fff",
      padding: "18px 40px",
      borderRadius: "12px",
      textDecoration: "none",
      border: "none",
      cursor: "pointer",
    },
    secondaryBtn: {
      fontSize: "18px",
      fontWeight: 600,
      backgroundColor: "#fff",
      color: "#374151",
      padding: "18px 40px",
      borderRadius: "12px",
      border: "2px solid #e5e7eb",
      cursor: "pointer",
    },
    stats: {
      display: "flex",
      justifyContent: "center",
      gap: "80px",
      flexWrap: "wrap",
      marginBottom: "64px",
    },
    statItem: {
      textAlign: "center",
    },
    statValue: {
      fontSize: "40px",
      fontWeight: 800,
      color: "#111827",
      letterSpacing: "-0.02em",
    },
    statLabel: {
      fontSize: "14px",
      fontWeight: 500,
      color: "#9ca3af",
      marginTop: "4px",
    },
    trust: {
      paddingTop: "48px",
      borderTop: "1px solid #e5e7eb",
    },
    trustLabel: {
      fontSize: "12px",
      fontWeight: 500,
      color: "#9ca3af",
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      marginBottom: "24px",
    },
    trustLogos: {
      display: "flex",
      justifyContent: "center",
      gap: "48px",
      flexWrap: "wrap",
      opacity: 0.5,
    },
    trustLogo: {
      fontSize: "18px",
      fontWeight: 700,
      color: "#6b7280",
    },
    section: {
      padding: "120px 32px",
      backgroundColor: "#fff",
    },
    sectionAlt: {
      padding: "120px 32px",
      backgroundColor: "#fafafa",
    },
    sectionTitle: {
      fontSize: "clamp(32px, 5vw, 48px)",
      fontWeight: 800,
      letterSpacing: "-0.02em",
      color: "#111827",
      textAlign: "center",
      marginBottom: "16px",
    },
    sectionSubtitle: {
      fontSize: "20px",
      fontWeight: 400,
      color: "#6b7280",
      textAlign: "center",
      marginBottom: "64px",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: "24px",
      maxWidth: "1100px",
      margin: "0 auto",
    },
    card: {
      padding: "32px",
      backgroundColor: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: "16px",
    },
    cardIcon: {
      width: "56px",
      height: "56px",
      backgroundColor: "#f3f4f6",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "20px",
      fontSize: "24px",
    },
    cardTitle: {
      fontSize: "20px",
      fontWeight: 700,
      color: "#111827",
      marginBottom: "8px",
    },
    cardDesc: {
      fontSize: "16px",
      fontWeight: 400,
      color: "#6b7280",
      lineHeight: 1.6,
    },
    pricingGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
      gap: "24px",
      maxWidth: "960px",
      margin: "0 auto",
    },
    pricingCard: {
      padding: "40px",
      backgroundColor: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: "20px",
      display: "flex",
      flexDirection: "column",
    },
    pricingCardFeatured: {
      padding: "40px",
      backgroundColor: "#000",
      color: "#fff",
      borderRadius: "20px",
      display: "flex",
      flexDirection: "column",
      transform: "scale(1.02)",
    },
    pricingTitle: {
      fontSize: "22px",
      fontWeight: 700,
      marginBottom: "8px",
    },
    pricingDesc: {
      fontSize: "14px",
      opacity: 0.7,
      marginBottom: "24px",
    },
    pricingAmount: {
      fontSize: "48px",
      fontWeight: 800,
      marginBottom: "32px",
    },
    pricingPeriod: {
      fontSize: "16px",
      fontWeight: 400,
      opacity: 0.6,
    },
    pricingFeatures: {
      listStyle: "none",
      padding: 0,
      margin: "0 0 32px 0",
      flex: 1,
    },
    pricingFeature: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      fontSize: "15px",
      marginBottom: "16px",
    },
    pricingBtn: {
      fontSize: "16px",
      fontWeight: 600,
      padding: "16px 24px",
      borderRadius: "10px",
      textAlign: "center",
      textDecoration: "none",
      border: "none",
      cursor: "pointer",
    },
    ctaSection: {
      padding: "120px 32px",
      backgroundColor: "#000",
      color: "#fff",
      textAlign: "center",
    },
    ctaTitle: {
      fontSize: "clamp(36px, 6vw, 56px)",
      fontWeight: 800,
      letterSpacing: "-0.02em",
      marginBottom: "24px",
    },
    ctaText: {
      fontSize: "20px",
      opacity: 0.7,
      marginBottom: "48px",
      maxWidth: "500px",
      margin: "0 auto 48px",
    },
    footer: {
      padding: "80px 32px",
      backgroundColor: "#fafafa",
      borderTop: "1px solid #e5e7eb",
    },
    footerContent: {
      maxWidth: "1100px",
      margin: "0 auto",
    },
    footerGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
      gap: "40px",
      marginBottom: "48px",
    },
    footerTitle: {
      fontSize: "14px",
      fontWeight: 600,
      color: "#111827",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      marginBottom: "16px",
    },
    footerLinks: {
      listStyle: "none",
      padding: 0,
      margin: 0,
    },
    footerLink: {
      fontSize: "14px",
      color: "#6b7280",
      textDecoration: "none",
      display: "block",
      marginBottom: "12px",
    },
    footerBottom: {
      paddingTop: "32px",
      borderTop: "1px solid #e5e7eb",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "16px",
    },
    copyright: {
      fontSize: "13px",
      color: "#9ca3af",
    },
  };

  return (
    <div style={styles.page}>
      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navContainer}>
          <Link to="/" style={styles.logo}>
            <div style={styles.logoBox}>L</div>
            <span style={styles.logoText}>LeadScore</span>
          </Link>

          <div
            style={{
              ...styles.navLinks,
              display: window.innerWidth < 768 ? "none" : "flex",
            }}
          >
            <a href="#features" style={styles.navLink}>
              Features
            </a>
            <a href="#pricing" style={styles.navLink}>
              Pricing
            </a>
            <a href="#docs" style={styles.navLink}>
              Docs
            </a>
          </div>

          <div
            style={{
              ...styles.authButtons,
              display: window.innerWidth < 768 ? "none" : "flex",
            }}
          >
            <Link to="/login" style={styles.signInBtn}>
              Sign in
            </Link>
            <Link to="/login" style={styles.getStartedBtn}>
              Get Started →
            </Link>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: window.innerWidth >= 768 ? "none" : "block",
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
            }}
          >
            ☰
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.badge}>
            <span style={styles.badgeDot}></span>
            <span style={styles.badgeText}>Now in public beta</span>
          </div>

          <h1 style={styles.headline}>
            Prioritize Leads.
            <br />
            <span style={styles.headlineGray}>Close Deals.</span>
          </h1>

          <p style={styles.subheadline}>
            The intelligent lead scoring platform that helps sales teams focus
            on high-value prospects. Built for speed, designed for scale.
          </p>

          <div style={styles.ctaContainer}>
            <Link to="/login" style={styles.primaryBtn}>
              Start Free Trial
            </Link>
            <button style={styles.secondaryBtn}>Watch Demo</button>
          </div>

          <div style={styles.stats}>
            {[
              { value: "50K+", label: "Leads Scored" },
              { value: "2.5x", label: "More Efficient" },
              { value: "99.9%", label: "Uptime" },
            ].map((stat, i) => (
              <div key={i} style={styles.statItem}>
                <div style={styles.statValue}>{stat.value}</div>
                <div style={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div style={styles.trust}>
            <div style={styles.trustLabel}>Trusted by leading companies</div>
            <div style={styles.trustLogos}>
              {["Stripe", "Notion", "Linear", "Vercel", "Figma"].map(
                (company, i) => (
                  <span key={i} style={styles.trustLogo}>
                    {company}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={styles.section}>
        <h2 style={styles.sectionTitle}>Everything you need to win</h2>
        <p style={styles.sectionSubtitle}>
          Powerful features that help your team focus on what matters most.
        </p>

        <div style={styles.grid}>
          {[
            {
              icon: "🔗",
              title: "Smart Integrations",
              desc: "Connect with your CRM, analytics, and marketing tools seamlessly.",
            },
            {
              icon: "🧠",
              title: "AI Scoring",
              desc: "Machine learning algorithms that get smarter with every lead.",
            },
            {
              icon: "⚡",
              title: "Real-time Updates",
              desc: "Scores update instantly as new engagement data comes in.",
            },
            {
              icon: "🔒",
              title: "Enterprise Security",
              desc: "SOC2 Type II certified with end-to-end encryption.",
            },
            {
              icon: "⚙️",
              title: "Custom Rules",
              desc: "Build complex scoring logic with our visual rule builder.",
            },
            {
              icon: "📊",
              title: "Deep Analytics",
              desc: "Understand what drives conversions with detailed insights.",
            },
          ].map((feature, i) => (
            <div key={i} style={styles.card}>
              <div style={styles.cardIcon}>{feature.icon}</div>
              <div style={styles.cardTitle}>{feature.title}</div>
              <div style={styles.cardDesc}>{feature.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={styles.sectionAlt}>
        <h2 style={styles.sectionTitle}>Simple, transparent pricing</h2>
        <p style={styles.sectionSubtitle}>
          Start free, upgrade when you're ready.
        </p>

        <div style={styles.pricingGrid}>
          {/* Starter */}
          <div style={styles.pricingCard}>
            <div style={styles.pricingTitle}>Starter</div>
            <div style={styles.pricingDesc}>For individuals</div>
            <div style={styles.pricingAmount}>
              $0<span style={styles.pricingPeriod}>/mo</span>
            </div>
            <ul style={styles.pricingFeatures}>
              {["1,000 leads/month", "Basic scoring", "Email support"].map(
                (item, i) => (
                  <li key={i} style={styles.pricingFeature}>
                    ✓ {item}
                  </li>
                ),
              )}
            </ul>
            <Link
              to="/login"
              style={{
                ...styles.pricingBtn,
                backgroundColor: "#fff",
                color: "#111",
                border: "2px solid #e5e7eb",
              }}
            >
              Get Started
            </Link>
          </div>

          {/* Pro */}
          <div style={styles.pricingCardFeatured}>
            <div style={{ ...styles.pricingTitle, color: "#fff" }}>Pro</div>
            <div
              style={{ ...styles.pricingDesc, color: "rgba(255,255,255,0.6)" }}
            >
              For growing teams
            </div>
            <div style={{ ...styles.pricingAmount, color: "#fff" }}>
              $49
              <span
                style={{
                  ...styles.pricingPeriod,
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                /mo
              </span>
            </div>
            <ul style={styles.pricingFeatures}>
              {[
                "10,000 leads/month",
                "Advanced AI scoring",
                "Priority support",
                "API access",
              ].map((item, i) => (
                <li
                  key={i}
                  style={{
                    ...styles.pricingFeature,
                    color: "rgba(255,255,255,0.8)",
                  }}
                >
                  ✓ {item}
                </li>
              ))}
            </ul>
            <Link
              to="/login"
              style={{
                ...styles.pricingBtn,
                backgroundColor: "#fff",
                color: "#000",
              }}
            >
              Start Free Trial
            </Link>
          </div>

          {/* Enterprise */}
          <div style={styles.pricingCard}>
            <div style={styles.pricingTitle}>Enterprise</div>
            <div style={styles.pricingDesc}>For large orgs</div>
            <div style={styles.pricingAmount}>Custom</div>
            <ul style={styles.pricingFeatures}>
              {[
                "Unlimited leads",
                "Custom integrations",
                "Dedicated support",
              ].map((item, i) => (
                <li key={i} style={styles.pricingFeature}>
                  ✓ {item}
                </li>
              ))}
            </ul>
            <button
              style={{
                ...styles.pricingBtn,
                backgroundColor: "#fff",
                color: "#111",
                border: "2px solid #e5e7eb",
              }}
            >
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <h2 style={styles.ctaTitle}>Ready to close more deals?</h2>
        <p style={styles.ctaText}>
          Join thousands of sales teams using LeadScore to prioritize their
          pipeline.
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <Link
            to="/login"
            style={{
              ...styles.pricingBtn,
              backgroundColor: "#fff",
              color: "#000",
            }}
          >
            Start Free Trial
          </Link>
          <button
            style={{
              ...styles.pricingBtn,
              backgroundColor: "transparent",
              color: "#fff",
              border: "2px solid rgba(255,255,255,0.3)",
            }}
          >
            Talk to Sales
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer id="docs" style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerGrid}>
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    ...styles.logoBox,
                    width: "32px",
                    height: "32px",
                    fontSize: "14px",
                  }}
                >
                  L
                </div>
                <span style={{ fontSize: "18px", fontWeight: 700 }}>
                  LeadScore
                </span>
              </div>
              <p
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  maxWidth: "200px",
                }}
              >
                The intelligent lead scoring platform for modern sales teams.
              </p>
            </div>
            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "Integrations"],
              },
              { title: "Resources", links: ["Docs", "API", "Blog"] },
              { title: "Company", links: ["About", "Careers", "Contact"] },
            ].map((col, i) => (
              <div key={i}>
                <div style={styles.footerTitle}>{col.title}</div>
                <ul style={styles.footerLinks}>
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" style={styles.footerLink}>
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={styles.footerBottom}>
            <span style={styles.copyright}>
              © 2024 LeadScore Inc. All rights reserved.
            </span>
            <div style={{ display: "flex", gap: "24px" }}>
              <a href="#" style={styles.footerLink}>
                Privacy
              </a>
              <a href="#" style={styles.footerLink}>
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;

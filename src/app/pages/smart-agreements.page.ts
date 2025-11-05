import { Component } from '@angular/core';
import { RouteMeta } from '@analogjs/router';
import { CommonModule } from '@angular/common';

// Route metadata for SEO
export const routeMeta: RouteMeta = {
  title: 'Digital Agreement Solutions - Smart Fleet Management',
  meta: [
    {
      name: 'description',
      content: 'Transform your fleet operations with digital agreements and electronic signatures. Streamline contracts, reduce paperwork, and enhance customer experience.'
    },
    {
      name: 'keywords',
      content: 'digital agreements, electronic signatures, fleet management, rental agreements, paperless contracts'
    }
  ]
};

@Component({
  selector: 'app-sign-agreement-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <div class="hero-text">
          <h1>Smart Digital Agreements</h1>
          <p class="hero-subtitle">
            Transform your fleet operations with intelligent digital contracts and seamless electronic signatures
          </p>
          <div class="hero-stats">
            <div class="stat">
              <span class="stat-number">95%</span>
              <span class="stat-label">Faster Processing</span>
            </div>
            <div class="stat">
              <span class="stat-number">100%</span>
              <span class="stat-label">Paperless</span>
            </div>
            <div class="stat">
              <span class="stat-number">24/7</span>
              <span class="stat-label">Availability</span>
            </div>
          </div>
          <div class="hero-actions">
            <button class="btn-primary">Get Started</button>
            <button class="btn-secondary">Watch Demo</button>
          </div>
        </div>
        <div class="hero-visual">
          <div class="signature-demo">
            <div class="document-preview">
              <div class="doc-header">
                <div class="doc-icon">📄</div>
                <span>Rental Agreement</span>
              </div>
              <div class="doc-content">
                <div class="signature-field">
                  <div class="signature-line"></div>
                  <span class="signature-label">Digital Signature</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="container">
        <h2>Why Choose Digital Agreements?</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <h3>Lightning Fast</h3>
            <p>Complete agreements in minutes, not hours. Instant processing and real-time updates keep your fleet moving.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🔒</div>
            <h3>Secure & Compliant</h3>
            <p>Bank-level encryption and legal compliance ensure your agreements are protected and legally binding.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3>Mobile Ready</h3>
            <p>Sign anywhere, anytime. Perfect for field operations and remote fleet management.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>Smart Analytics</h3>
            <p>Track agreement status, completion rates, and customer insights with powerful analytics.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🔄</div>
            <h3>Automated Workflows</h3>
            <p>Streamline your process with automated reminders, follow-ups, and document management.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">💰</div>
            <h3>Cost Effective</h3>
            <p>Reduce printing, storage, and administrative costs while improving operational efficiency.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Process Section -->
    <section class="process">
      <div class="container">
        <h2>How It Works</h2>
        <div class="process-steps">
          <div class="step">
            <div class="step-number">1</div>
            <h3>Create Agreement</h3>
            <p>Generate smart agreements with pre-filled customer and vehicle information</p>
          </div>
          <div class="step-arrow">→</div>
          <div class="step">
            <div class="step-number">2</div>
            <h3>Send Securely</h3>
            <p>Deliver agreements via secure link with password protection</p>
          </div>
          <div class="step-arrow">→</div>
          <div class="step">
            <div class="step-number">3</div>
            <h3>Sign Digitally</h3>
            <p>Customers sign with legally binding electronic signatures</p>
          </div>
          <div class="step-arrow">→</div>
          <div class="step">
            <div class="step-number">4</div>
            <h3>Complete Instantly</h3>
            <p>Automatic processing and document storage for immediate access</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="container">
        <div class="cta-content">
          <h2>Ready to Go Digital?</h2>
          <p>Join thousands of fleet owners who have transformed their operations with smart digital agreements.</p>
          <div class="cta-actions">
            <button class="btn-primary large">Start Free Trial</button>
            <button class="btn-outline large">Contact Sales</button>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .hero {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 4rem 2rem;
      min-height: 80vh;
      display: flex;
      align-items: center;
    }

    .hero-content {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
    }

    .hero-text h1 {
      font-size: 3.5rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      line-height: 1.2;
    }

    .hero-subtitle {
      font-size: 1.25rem;
      margin-bottom: 2rem;
      opacity: 0.9;
      line-height: 1.6;
    }

    .hero-stats {
      display: flex;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .stat {
      text-align: center;
    }

    .stat-number {
      display: block;
      font-size: 2rem;
      font-weight: 700;
      color: #ffd700;
    }

    .stat-label {
      font-size: 0.9rem;
      opacity: 0.8;
    }

    .hero-actions {
      display: flex;
      gap: 1rem;
    }

    .btn-primary, .btn-secondary, .btn-outline {
      padding: 1rem 2rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-block;
    }

    .btn-primary {
      background: #ff6b6b;
      color: white;
    }

    .btn-primary:hover {
      background: #ff5252;
      transform: translateY(-2px);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.3);
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .btn-outline {
      background: transparent;
      color: #667eea;
      border: 2px solid #667eea;
    }

    .btn-outline:hover {
      background: #667eea;
      color: white;
    }

    .btn-primary.large, .btn-outline.large {
      padding: 1.25rem 2.5rem;
      font-size: 1.1rem;
    }

    .hero-visual {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .signature-demo {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      transform: rotate(5deg);
    }

    .document-preview {
      width: 300px;
      color: #333;
    }

    .doc-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      font-weight: 600;
    }

    .doc-icon {
      font-size: 1.5rem;
    }

    .signature-field {
      border: 2px dashed #ddd;
      padding: 2rem;
      border-radius: 8px;
      text-align: center;
    }

    .signature-line {
      height: 2px;
      background: #667eea;
      margin-bottom: 0.5rem;
      border-radius: 2px;
    }

    .signature-label {
      color: #666;
      font-size: 0.9rem;
    }

    .features {
      padding: 6rem 2rem;
      background: #f8f9fa;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .features h2, .process h2, .cta h2 {
      text-align: center;
      font-size: 2.5rem;
      margin-bottom: 3rem;
      color: #333;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .feature-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      text-align: center;
      transition: transform 0.3s ease;
    }

    .feature-card:hover {
      transform: translateY(-5px);
    }

    .feature-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .feature-card h3 {
      font-size: 1.25rem;
      margin-bottom: 1rem;
      color: #333;
    }

    .feature-card p {
      color: #666;
      line-height: 1.6;
    }

    .process {
      padding: 6rem 2rem;
      background: white;
    }

    .process-steps {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2rem;
      flex-wrap: wrap;
    }

    .step {
      text-align: center;
      max-width: 200px;
    }

    .step-number {
      width: 60px;
      height: 60px;
      background: #667eea;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0 auto 1rem;
    }

    .step h3 {
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
      color: #333;
    }

    .step p {
      color: #666;
      font-size: 0.9rem;
      line-height: 1.5;
    }

    .step-arrow {
      font-size: 2rem;
      color: #667eea;
      font-weight: bold;
    }

    .cta {
      padding: 6rem 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .cta-content {
      text-align: center;
    }

    .cta h2 {
      color: white;
      margin-bottom: 1rem;
    }

    .cta p {
      font-size: 1.1rem;
      margin-bottom: 2rem;
      opacity: 0.9;
    }

    .cta-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .hero-content {
        grid-template-columns: 1fr;
        text-align: center;
      }

      .hero-text h1 {
        font-size: 2.5rem;
      }

      .hero-stats {
        justify-content: center;
      }

      .process-steps {
        flex-direction: column;
      }

      .step-arrow {
        transform: rotate(90deg);
      }

      .features-grid {
        grid-template-columns: 1fr;
      }

      .cta-actions {
        flex-direction: column;
        align-items: center;
      }
    }

    @media (max-width: 480px) {
      .hero {
        padding: 2rem 1rem;
      }

      .features, .process, .cta {
        padding: 3rem 1rem;
      }

      .hero-text h1 {
        font-size: 2rem;
      }

      .hero-actions {
        flex-direction: column;
      }
    }
  `]
})
export default class SignAgreementPage {}
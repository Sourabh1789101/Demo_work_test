import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Layout,
  BarChart3,
  Lock,
  Smartphone,
  Sparkles,
  ArrowRight,
  Check,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

export function LandingPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const features = [
    {
      icon: Layout,
      title: 'Drag & Drop Builder',
      description: 'Intuitive interface to create forms without any coding knowledge',
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Generation',
      description: 'Generate complete forms from natural language descriptions',
    },
    {
      icon: BarChart3,
      title: 'Analytics & Insights',
      description: 'Track submissions, response rates, and form performance',
    },
    {
      icon: Lock,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with data encryption and backups',
    },
    {
      icon: Smartphone,
      title: 'Mobile Responsive',
      description: 'Forms that look perfect on every device and screen size',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized performance with instant form rendering and submissions',
    },
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: '$29',
      period: 'per month',
      description: 'Perfect for individuals and small projects',
      features: [
        'Up to 5 forms',
        'Basic templates',
        'Up to 100 submissions/month',
        '50 AI generations/month',
        'Email support',
        'Basic analytics',
      ],
      cta: 'Get Started',
      featured: false,
    },
    {
      name: 'Professional',
      price: '$99',
      period: 'per month',
      description: 'For growing teams and businesses',
      features: [
        'Unlimited forms',
        'All templates',
        'Unlimited submissions',
        '200 AI generations/month',
        'Priority email & chat support',
        'Advanced analytics',
        'Custom branding',
        'Team collaboration',
      ],
      cta: 'Start Free Trial',
      featured: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact for pricing',
      description: 'For large organizations with specific needs',
      features: [
        'Unlimited everything',
        'Unlimited AI generations',
        'Dedicated support',
        'Custom integrations',
        'SSO & advanced security',
        'SLA guarantee',
        'Training included',
        'API access',
      ],
      cta: 'Contact Sales',
      featured: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/95 backdrop-blur-md z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <a href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                FormBuilder
              </a>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition">
                Features
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition">
                Pricing
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition">
                Docs
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition">
                About
              </a>
            </div>

            {/* Auth Buttons Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 text-gray-700 font-medium hover:text-gray-900 transition"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:shadow-lg transition transform hover:scale-105"
              >
                Sign Up
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="md:hidden pb-4 space-y-3 border-t border-gray-200 pt-4">
              <a href="#features" className="block text-gray-600 hover:text-gray-900 py-2">
                Features
              </a>
              <a href="#pricing" className="block text-gray-600 hover:text-gray-900 py-2">
                Pricing
              </a>
              <a href="#" className="block text-gray-600 hover:text-gray-900 py-2">
                Docs
              </a>
              <a href="#" className="block text-gray-600 hover:text-gray-900 py-2">
                About
              </a>
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => {
                    navigate('/login');
                    setMenuOpen(false);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    navigate('/signup');
                    setMenuOpen(false);
                  }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:shadow-lg transition"
                >
                  Sign Up
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full">
                  <Sparkles size={18} className="text-blue-600 mr-2" />
                  <span className="text-sm font-semibold text-blue-600">AI-Powered Form Builder</span>
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Create Forms with
                  <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    AI & Drag-Drop
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Build beautiful, responsive forms in minutes. Generate entire forms with AI, customize with our intuitive drag-and-drop builder, and get insights from every submission.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => navigate('/signup')}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-xl transition transform hover:scale-105 flex items-center justify-center group"
                >
                  Get Started Free
                  <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition" />
                </button>
                <button
                  onClick={() => navigate('/demo')}
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition flex items-center justify-center"
                >
                  Try Demo
                </button>
              </div>

              {/* Social Proof */}
              <div className="flex flex-col sm:flex-row gap-6 pt-8 text-sm text-gray-600">
                <div>
                  <div className="font-bold text-gray-900">10,000+</div>
                  <p>Forms Created</p>
                </div>
                <div>
                  <div className="font-bold text-gray-900">500K+</div>
                  <p>Submissions Processed</p>
                </div>
                <div>
                  <div className="font-bold text-gray-900">99.9%</div>
                  <p>Uptime</p>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="hidden lg:block">
              <div className="relative">
                {/* Gradient Background Shape */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-3xl blur-3xl"></div>

                {/* Card Mockup */}
                <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                  <div className="space-y-4">
                    <div className="h-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full w-2/3"></div>
                    <div className="space-y-3">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                    </div>
                    <div className="pt-6 space-y-3">
                      <div className="h-12 bg-gray-100 rounded-lg"></div>
                      <div className="h-12 bg-gray-100 rounded-lg"></div>
                    </div>
                    <div className="pt-6">
                      <div className="h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to create professional forms and collect valuable data
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group p-8 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition bg-white"
                >
                  <div className="mb-4 inline-flex p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition">
                    <Icon size={28} className="text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the perfect plan for your needs. Always flexible to scale.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`rounded-2xl transition transform ${
                  plan.featured
                    ? 'md:scale-105 bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-2xl'
                    : 'bg-white border border-gray-200 hover:shadow-lg'
                }`}
              >
                <div className="p-8">
                  {plan.featured && (
                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <h3 className={`text-2xl font-bold mb-2 ${!plan.featured && 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`mb-6 ${plan.featured ? 'text-blue-100' : 'text-gray-600'}`}>
                    {plan.description}
                  </p>

                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-5xl font-bold">{plan.price}</span>
                      <span className={`ml-2 ${plan.featured ? 'text-blue-100' : 'text-gray-600'}`}>
                        {plan.period}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/signup')}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition transform hover:scale-105 mb-8 ${
                      plan.featured
                        ? 'bg-white text-blue-600 hover:shadow-lg'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg'
                    }`}
                  >
                    {plan.cta}
                  </button>

                  {/* Features List */}
                  <div className="space-y-4">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start">
                        <Check
                          size={20}
                          className={`mr-3 flex-shrink-0 ${
                            plan.featured ? 'text-blue-100' : 'text-green-500'
                          }`}
                        />
                        <span className={`${plan.featured ? 'text-blue-50' : 'text-gray-700'}`}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Billing Toggle Note */}
          <div className="text-center mt-12">
            <p className="text-gray-600">
              All plans include a 14-day free trial. No credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to create amazing forms?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are building beautiful forms and collecting valuable data every day.
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="px-10 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:shadow-xl transition transform hover:scale-105"
          >
            Get Started Free Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">FormBuilder</h3>
              <p className="text-sm text-gray-400">
                Building the future of form creation with AI and intuitive design.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Templates</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              © 2026 FormBuilder. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition">Twitter</a>
              <a href="#" className="text-gray-400 hover:text-white transition">LinkedIn</a>
              <a href="#" className="text-gray-400 hover:text-white transition">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

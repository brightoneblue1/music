import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: 'music' | 'marketing' | 'web' | 'general';
}

const faqs: FAQItem[] = [
  {
    question: 'How do I download beats from your library?',
    answer: 'To download beats, simply browse our music library, click on the beat you want, and click the "Download" button. You\'ll be asked to provide your email and subscribe to our YouTube channel or Spotify. This helps us keep creating quality content while keeping you updated on new releases.',
    category: 'music',
  },
  {
    question: 'Can I use your beats for commercial projects?',
    answer: 'Yes! Our beats can be used for commercial projects. Different licensing options are available depending on your needs. Please contact us directly to discuss licensing terms and pricing for commercial use.',
    category: 'music',
  },
  {
    question: 'Do you create custom beats?',
    answer: 'Absolutely! We specialize in custom beat production tailored to your specific style and requirements. Share your vision with us, including preferred genre, BPM, mood, and any reference tracks, and we\'ll create something unique for you.',
    category: 'music',
  },
  {
    question: 'What digital marketing services do you offer?',
    answer: 'We offer comprehensive digital marketing services including social media management, content creation (photography and video), ad campaign management (Google Ads, Facebook, Instagram), influencer marketing, and brand strategy development.',
    category: 'marketing',
  },
  {
    question: 'How long does it take to see results from marketing campaigns?',
    answer: 'Results vary depending on the type of campaign and your goals. Social media growth typically shows initial results in 2-4 weeks, while SEO and organic growth strategies may take 3-6 months. Paid advertising campaigns can generate results within days. We provide regular reports to track progress.',
    category: 'marketing',
  },
  {
    question: 'What\'s included in your website design service?',
    answer: 'Our website design service includes custom design, responsive development for all devices, SEO optimization, performance optimization, content management system integration, and basic training. We also offer ongoing maintenance packages to keep your site updated and secure.',
    category: 'web',
  },
  {
    question: 'Do you offer website maintenance after launch?',
    answer: 'Yes! We offer monthly maintenance packages that include security updates, performance optimization, content updates, backup services, and technical support. This ensures your website stays secure, fast, and up-to-date.',
    category: 'web',
  },
  {
    question: 'How do I schedule a consultation?',
    answer: 'You can schedule a consultation by visiting our Services section and clicking "Book Now" on any service. Fill out the form with your preferred date and time, and we\'ll send you a confirmation email. Consultations are free and help us understand your project needs.',
    category: 'general',
  },
  {
    question: 'What are your payment terms?',
    answer: 'For music purchases, payment is typically upfront. For service packages, we usually require a 50% deposit to begin work, with the remaining balance due upon completion. We accept various payment methods including bank transfer, PayPal, and major credit cards.',
    category: 'general',
  },
  {
    question: 'Can I unsubscribe from your mailing list?',
    answer: 'Of course! We respect your inbox. Every email we send includes an unsubscribe link at the bottom. Click it, and you\'ll be immediately removed from our mailing list. You can also contact us directly to manage your subscription preferences.',
    category: 'general',
  },
  {
    question: 'Do you work with international clients?',
    answer: 'Yes! We work with clients worldwide. All our services can be delivered remotely, and we\'re experienced in managing projects across different time zones. Communication is primarily through email, video calls, and project management tools.',
    category: 'general',
  },
  {
    question: 'What makes shhmaart different from other producers/agencies?',
    answer: 'We combine musical expertise with digital marketing prowess, offering a unique 360° approach to creative projects. Whether you need a beat, a brand campaign, or a website, we bring the same level of passion and professionalism. Plus, our experience as content creators means we understand what works in today\'s digital landscape.',
    category: 'general',
  },
];

const categories = [
  { value: 'all', label: 'All Questions' },
  { value: 'music', label: 'Music & Beats' },
  { value: 'marketing', label: 'Digital Marketing' },
  { value: 'web', label: 'Web Services' },
  { value: 'general', label: 'General' },
];

export function FAQSection() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filteredFAQs = activeFilter === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === activeFilter);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-5xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-300">
            Everything you need to know about our services
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setActiveFilter(category.value)}
              className={`px-6 py-2 rounded-full font-semibold text-sm transition-all ${
                activeFilter === category.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFAQs.map((faq, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-lg border border-purple-500/20 rounded-xl overflow-hidden hover:bg-white/10 transition-all"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white pr-8">{faq.question}</h3>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                    faq.category === 'music' ? 'bg-purple-600/20 text-purple-400' :
                    faq.category === 'marketing' ? 'bg-pink-600/20 text-pink-400' :
                    faq.category === 'web' ? 'bg-blue-600/20 text-blue-400' :
                    'bg-gray-600/20 text-gray-400'
                  }`}>
                    {faq.category.charAt(0).toUpperCase() + faq.category.slice(1)}
                  </span>
                </div>
                <div className="flex-shrink-0">
                  {openIndex === index ? (
                    <ChevronUp className="w-6 h-6 text-purple-400" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-5 pt-0">
                  <div className="border-t border-purple-500/20 pt-4">
                    <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still Have Questions */}
        <div className="mt-16 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/20 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-3">Still have questions?</h3>
          <p className="text-gray-300 mb-6">
            Can't find the answer you're looking for? Feel free to reach out to our team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://www.youtube.com/@shhmaart"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all"
            >
              Contact Us on YouTube
            </a>
            <button className="inline-flex items-center justify-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold border border-white/20 transition-all">
              Send Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

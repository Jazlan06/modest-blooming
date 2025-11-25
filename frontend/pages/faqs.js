import { useState, useMemo } from "react";
import { FaChevronDown, FaSearch } from "react-icons/fa";
import Navbar from "@/components/Navbar";
import Head from "next/head";
const FAQPage = () => {
    const [openIndex, setOpenIndex] = useState(null);
    const [search, setSearch] = useState("");

    const faqData = [
        {
            category: "Orders & Account",
            faqs: [
                { question: "How to create an account?", answer: "Click <a href='/login' class='text-[#F4C2C2] underline'>here</a> to register." },
                { question: "How do I verify my email?", answer: "After registering, click the verification link sent to your email." },
                { question: "Can I cancel my order?", answer: "Orders can be canceled before dispatch by contacting support." },
                { question: "How to track my order?", answer: "Tracking details are sent via email/WhatsApp after dispatch." },
            ],
        },
        {
            category: "Products & Customization",
            faqs: [
                { question: "What products do you offer?", answer: "Hijabs, scarves, and stylish accessories for modest fashion." },
                { question: "Can I place a custom order?", answer: "Yes! Contact us via WhatsApp or website for custom requests." },
                { question: "Do you offer customization?", answer: "Select 'Custom Order' to discuss your preferences." },
            ],
        },
        {
            category: "Payments & Delivery",
            faqs: [
                { question: "What payment methods do you accept?", answer: "UPI only. We do not offer COD." },
                { question: "Delivery duration?", answer: "Delivery times depend on location, usually 3–7 days." },
                { question: "Do you ship outside Mumbai?", answer: "Yes, across India. Delivery charges vary by location." },
            ],
        },
        {
            category: "Returns & Policies",
            faqs: [
                { question: "Return policy?", answer: "We currently do not accept returns." },
                { question: "Dispatch video for faulty items?", answer: "Yes, we record items while dispatching to ensure accountability." },
                { question: "What if item is damaged?", answer: "Report immediately. We'll resolve or replace it." },
            ],
        },
        {
            category: "Updates & Extras",
            faqs: [
                { question: "Stay updated?", answer: "Follow us on <a href='https://instagram.com/modestblooming' class='text-[#F4C2C2] underline'>Instagram</a> and Facebook." },
                { question: "Gift wrapping?", answer: "Yes! Add gift wrapping during checkout." },
            ],
        },
    ];

    const filteredData = useMemo(() => {
        if (!search.trim()) return faqData;
        const q = search.toLowerCase();
        return faqData
            .map((cat) => ({
                ...cat,
                faqs: cat.faqs.filter(
                    (faq) =>
                        faq.question.toLowerCase().includes(q) ||
                        faq.answer.toLowerCase().includes(q)
                ),
            }))
            .filter((cat) => cat.faqs.length > 0);
    }, [search]);

    return (
        <>
            <Head>
                {/* Basic SEO */}
                <title>FAQs | Modest Blooming - Orders, Shipping & Products</title>
                <meta
                    name="description"
                    content="Find answers to common questions about Modest Blooming: orders, account, shipping, returns, payments, and product customization."
                />
                <link rel="canonical" href="https://www.modestblooming.com/faqs" />

                {/* Open Graph / Facebook */}
                <meta property="og:title" content="FAQs | Modest Blooming - Orders, Shipping & Products" />
                <meta
                    property="og:description"
                    content="Find answers to common questions about Modest Blooming: orders, account, shipping, returns, payments, and product customization."
                />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://www.modestblooming.com/faqs" />
                <meta property="og:image" content="https://www.modestblooming.com/faqs.jpg" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="FAQs | Modest Blooming - Orders, Shipping & Products" />
                <meta
                    name="twitter:description"
                    content="Find answers to common questions about Modest Blooming: orders, account, shipping, returns, payments, and product customization."
                />
                <meta name="twitter:image" content="https://www.modestblooming.com/faqs.jpg" />

                {/* Robots */}
                <meta name="robots" content="index, follow" />
            </Head>
            <Navbar />

            <div className="relative min-h-screen mt-[4rem] md:mt-[7rem] py-20 px-4 sm:px-6 lg:px-20 overflow-hidden bg-gradient-to-b from-white via-[#fff8f8] to-[#fdeef0]">
                {/* Ambient blobs */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute top-[-12rem] left-[-8rem] w-[25rem] h-[25rem] bg-[#F4C2C2]/35 blur-[140px] rounded-full"></div>
                    <div className="absolute bottom-[-10rem] right-[-6rem] w-[30rem] h-[30rem] bg-[#F4C2C2]/20 blur-[120px] rounded-full"></div>
                </div>

                <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-14 relative z-10">
                    {/* Hero Section */}
                    <div className="lg:hidden flex flex-col sm:flex-row items-center justify-between w-full mb-14">
                        <div className="flex-1 flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-white/70 backdrop-blur-lg rounded-3xl p-6 shadow-lg border border-[#F4C2C2]/20">
                            <div className="flex-1 text-center sm:text-left">
                                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
                                    Frequently Asked Questions
                                </h1>
                                <p className="text-gray-700 text-base sm:text-lg max-w-md mx-auto sm:mx-0">
                                    Everything you need to know about{" "}
                                    <span className="text-[#F4C2C2] font-semibold">
                                        Modest Blooming
                                    </span>
                                    .
                                </p>
                            </div>
                            <img
                                src="/faqs.jpg"
                                alt="FAQ Illustration"
                                className="w-28 sm:w-36 md:w-44 rounded-2xl shadow-lg object-cover transition-transform duration-500 hover:scale-105"
                            />
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div className="lg:col-span-7 animate-fadeIn">
                        {/* Desktop Heading */}
                        <div className="hidden lg:block mb-10">
                            <h1 className="text-5xl font-extrabold text-gray-900 mb-3">
                                Frequently Asked Questions
                            </h1>
                            <p className="text-gray-600 text-lg max-w-xl">
                                Everything you need to know about{" "}
                                <span className="text-[#F4C2C2] font-semibold">
                                    Modest Blooming
                                </span>{" "}
                                — from orders to policies.
                            </p>
                        </div>

                        {/* Search Input */}
                        <div className="relative mb-12 group">
                            <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#F4C2C2]" />
                            <input
                                type="text"
                                placeholder="Search keywords... orders, delivery, returns"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-5 py-4 rounded-full bg-white/90 border border-gray-200 text-gray-800 placeholder-gray-400 shadow-sm hover:shadow-lg focus:ring-4 focus:ring-[#F4C2C2]/40 focus:border-[#F4C2C2] focus:scale-[1.01] transition-all duration-300"
                            />
                        </div>

                        {/* FAQ Cards with staggered fade */}
                        <div className="space-y-12">
                            {filteredData.length === 0 ? (
                                <p className="text-gray-500 text-center mt-10">No results found.</p>
                            ) : (
                                filteredData.map((category, catIndex) => {
                                    const titleDelay = `${catIndex * 400}ms`; // delay for category title
                                    return (
                                        <div key={catIndex}>
                                            {/* Category Title with fade-in delay */}
                                            <div
                                                className="flex items-center gap-3 mb-6 opacity-0 animate-fadeIn"
                                                style={{ animationDelay: titleDelay }}
                                            >
                                                <span className="inline-block w-2 h-2 bg-[#F4C2C2] rounded-full shadow-sm"></span>
                                                <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">
                                                    {category.category}
                                                </h2>
                                            </div>

                                            {/* FAQ Cards */}
                                            <div className="space-y-5 border-l-2 border-[#F4C2C2]/25 pl-4 md:pl-6">
                                                {category.faqs.map((faq, faqIndex) => {
                                                    const id = `${catIndex}-${faqIndex}`;
                                                    const isOpen = openIndex === id;
                                                    const cardDelay = `${catIndex * 400 + faqIndex * 120}ms`; // stagger after title
                                                    return (
                                                        <div
                                                            key={id}
                                                            style={{ animationDelay: cardDelay }}
                                                            className={`faq-card opacity-0 translate-y-3 group bg-white/80 backdrop-blur-xl rounded-2xl border transition-all duration-500 overflow-hidden ${isOpen
                                                                ? "border-[#F4C2C2]/40 shadow-lg scale-[1.01]"
                                                                : "border-transparent hover:border-[#F4C2C2]/30 hover:shadow-md"
                                                                }`}
                                                        >
                                                            <button
                                                                onClick={() => setOpenIndex(isOpen ? null : id)}
                                                                className="w-full px-6 py-5 flex justify-between items-center text-left"
                                                            >
                                                                <span className="text-gray-900 font-medium text-lg group-hover:text-[#F4C2C2] transition-colors duration-300">
                                                                    {faq.question}
                                                                </span>
                                                                <FaChevronDown
                                                                    className={`text-gray-400 transform transition-transform duration-500 ${isOpen ? "rotate-180 text-[#F4C2C2]" : ""
                                                                        }`}
                                                                />
                                                            </button>

                                                            <div
                                                                className={`px-6 text-gray-700 text-base leading-relaxed transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${isOpen
                                                                    ? "max-h-96 pb-5 opacity-100 translate-y-0"
                                                                    : "max-h-0 pb-0 opacity-0 -translate-y-2"
                                                                    }`}
                                                                dangerouslySetInnerHTML={{ __html: faq.answer }}
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                    </div>

                    {/* Right-side image */}
                    <div className="hidden lg:flex lg:col-span-5 justify-center items-start animate-fadeIn">
                        <div className="relative rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-700 hover:shadow-[#F4C2C2]/40">
                            <img
                                src="/faqs.jpg"
                                alt="FAQ Illustration"
                                className="w-96 rounded-[2rem] object-cover transition-transform duration-700 hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#F4C2C2]/30 to-transparent"></div>
                        </div>
                    </div>
                </div>

                {/* Animations */}
                <style jsx>{`
          @keyframes fadeIn {
            0% {
              opacity: 0;
              transform: translateY(20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes slideUp {
            0% {
              opacity: 0;
              transform: translateY(30px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes cardFade {
            0% {
              opacity: 0;
              transform: translateY(8px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fadeIn {
            animation: fadeIn 1s ease-out forwards;
          }
          .animate-slideUp {
            animation: slideUp 0.8s ease-out forwards;
          }
          .faq-card {
            animation: cardFade 0.6s ease-out forwards;
          }
        `}</style>
            </div>
        </>
    );
};

export default FAQPage;
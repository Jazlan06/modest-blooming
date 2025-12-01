import {
    FaMapMarkerAlt,
    FaPhoneAlt,
    FaEnvelope,
    FaInstagram,
    FaFacebookF,
    FaTwitter,
    FaWhatsapp
} from "react-icons/fa";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Head from "next/head";
const ContactPage = () => {
    return (
        <>
            <Head>
                {/* Basic SEO */}
                <title>Contact Modest Blooming | Hijabs, Abayas & Accessories</title>
                <meta
                    name="description"
                    content="Get in touch with Modest Blooming for inquiries, feedback, or collaborations. Connect via WhatsApp, email, phone, or visit our store in Mumbai."
                />
                <link rel="canonical" href="https://www.modestblooming.com/contact" />

                {/* Open Graph / Facebook */}
                <meta property="og:title" content="Contact Modest Blooming | Hijabs, Abayas & Accessories" />
                <meta
                    property="og:description"
                    content="Get in touch with Modest Blooming for inquiries, feedback, or collaborations. Connect via WhatsApp, email, phone, or visit our store in Mumbai."
                />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://www.modestblooming.com/contact" />
                <meta property="og:image" content="https://www.modestblooming.com/contact-hero.jpg" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Contact Modest Blooming | Hijabs, Abayas & Accessories" />
                <meta
                    name="twitter:description"
                    content="Get in touch with Modest Blooming for inquiries, feedback, or collaborations. Connect via WhatsApp, email, phone, or visit our store in Mumbai."
                />
                <meta name="twitter:image" content="https://www.modestblooming.com/contact-hero.jpg" />

                {/* Robots */}
                <meta name="robots" content="index, follow" />
            </Head>
            <Navbar />

            <div className="relative min-h-screen mt-[4rem] md:mt-[7rem] bg-gradient-to-b from-white via-[#fff8f8] to-[#fdeef0] overflow-hidden font-['Poppins']">

                {/* Background Gradient Blobs */}
                <div className="absolute inset-0">
                    <div className="absolute top-[-15rem] left-[-10rem] w-[30rem] h-[30rem] bg-[#F4C2C2]/40 blur-[180px] rounded-full animate-blob"></div>
                    <div className="absolute bottom-[-15rem] right-[-12rem] w-[35rem] h-[35rem] bg-[#F4C2C2]/20 blur-[160px] rounded-full animate-blob animation-delay-2000"></div>
                </div>

                {/* Hero Section */}
                <section className="max-w-7xl mx-auto py-24 px-6 lg:px-20 flex flex-col lg:flex-row items-center gap-16">
                    <div className="lg:w-1/2 space-y-6 animate-fadeIn">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 drop-shadow-sm leading-tight">
                            Connect <span className="text-[#F4C2C2]">With Us</span>
                        </h1>
                        <p className="text-gray-700 text-lg md:text-xl leading-relaxed">
                            Have questions, feedback, or want to collaborate? We love hearing from you. Reach out and we’ll respond promptly.
                        </p>
                        <p className="text-gray-700 text-lg md:text-xl leading-relaxed">
                            Your voice matters — whether it’s about our hijabs, abayas, or accessories, we’re here to listen.
                        </p>
                        <a
                            href="https://wa.me/917021936869?text=Hi%2C%20I%27d%20like%20to%20know%20more%20about%20your%20products!"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 bg-[#25D366] text-white text-lg px-6 py-3 rounded-full shadow-lg hover:shadow-[#25D366]/40 hover:scale-105 transition-all duration-300"
                        >
                            <FaWhatsapp className="text-2xl" /> Chat on WhatsApp
                        </a>
                    </div>
                    <div className="lg:w-1/2 relative rounded-3xl overflow-hidden shadow-2xl animate-fadeIn hover:shadow-3xl transition-shadow duration-500">
                        <img
                            src="/contact-hero.jpg"
                            alt="Contact Modest Blooming"
                            className="w-full rounded-3xl object-cover transition-transform duration-700 hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#F4C2C2]/20 to-transparent"></div>
                    </div>
                </section>

                {/* Divider */}
                <div className="border-t border-gray-200 mx-auto w-[80%] my-8"></div>

                {/* 🌿 Get in Touch Section (Refined Layout) */}
                <section className="max-w-6xl mx-auto py-20 px-6 lg:px-20 animate-slideUp">
                    <h2 className="text-4xl font-extrabold text-gray-900 text-center mb-16">
                        Get in Touch
                    </h2>

                    <div className="flex flex-col md:flex-row justify-between items-center gap-12 text-gray-800">

                        {/* Address */}
                        <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-5 group">
                            <div className="bg-[#F4C2C2]/10 p-6 rounded-full group-hover:bg-[#F4C2C2]/20 transition-all duration-300">
                                <FaMapMarkerAlt className="text-[#F4C2C2] text-4xl" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-semibold mb-2">Address</h3>
                                <a
                                    href="https://www.google.com/maps?q=18.96599221817703,72.84447577556512"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-700 hover:text-[#F4C2C2] transition-colors duration-300"
                                >
                                    Mazgaon, Dockyard, Mumbai, India
                                </a>
                            </div>
                        </div>

                        {/* Divider Line (only visible on desktop) */}
                        <div className="hidden md:block h-[80px] w-[1px] bg-gray-300 opacity-40"></div>

                        {/* Phone */}
                        <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-5 group">
                            <div className="bg-[#F4C2C2]/10 p-6 rounded-full group-hover:bg-[#F4C2C2]/20 transition-all duration-300">
                                <FaPhoneAlt className="text-[#F4C2C2] text-4xl" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-semibold mb-2">Phone</h3>
                                <a href="tel:+917021936869" className="text-gray-700 hover:text-[#F4C2C2] transition-colors duration-300">
                                    +91 70219 36869
                                </a>
                            </div>
                        </div>

                        {/* Divider Line */}
                        <div className="hidden md:block h-[80px] w-[1px] bg-gray-300 opacity-40"></div>

                        {/* Email */}
                        <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-5 group">
                            <div className="bg-[#F4C2C2]/10 p-6 rounded-full group-hover:bg-[#F4C2C2]/20 transition-all duration-300">
                                <FaEnvelope className="text-[#F4C2C2] text-4xl" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-semibold mb-2">Email</h3>
                                <a href="mailto:modestblooming@gmail.com" className="text-gray-700 hover:text-[#F4C2C2] transition-colors duration-300">
                                    modestblooming@gmail.com
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Map Section */}
                <section className="max-w-6xl mx-auto py-20 px-6 lg:px-20 animate-slideUp">
                    <h2 className="text-4xl font-extrabold text-gray-900 text-center mb-12">Find Us Here</h2>
                    <div className="overflow-hidden rounded-3xl shadow-2xl hover:shadow-[#F4C2C2]/40 transition-shadow duration-500">
                        <iframe
                            src="https://www.google.com/maps?q=18.96599221817703,72.84447577556512&hl=es;z=14&output=embed"
                            width="100%"
                            height="450"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </section>

                {/* Social Media Section */}
                <section className="max-w-7xl mx-auto py-20 px-6 lg:px-20 text-center animate-fadeIn">
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-6">Follow Us</h2>
                    <p className="text-gray-700 mb-8">Stay connected for the latest collections, offers, and inspiration.</p>
                    <div className="flex justify-center items-center gap-8 text-[#F4C2C2] text-3xl">
                        <a href="https://instagram.com/modest.blooming" aria-label="Instagram" className="hover:scale-110 hover:text-[#e1306c] transition-all duration-300"><FaInstagram /></a>
                        <a href="https://wa.me/917506799689" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="hover:scale-110 hover:text-[#25D366] transition-all duration-300"><FaWhatsapp /></a>
                        <a href="https://www.facebook.com/share/19x4tNZkyA/" aria-label="Facebook" className="hover:scale-110 hover:text-[#4267B2] transition-all duration-300"><FaFacebookF /></a>
                    </div>
                </section>

                {/* Animations */}
                <style jsx>{`
          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideUp {
            0% { opacity: 0; transform: translateY(30px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes blob {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
          }
          .animate-fadeIn { animation: fadeIn 1s ease-out forwards; }
          .animate-slideUp { animation: slideUp 0.8s ease-out forwards; }
          .animate-blob { animation: blob 8s infinite; }
          .animation-delay-2000 { animation-delay: 2s; }
        `}</style>
            </div>
            <Footer />
        </>
    );
};

export default ContactPage;
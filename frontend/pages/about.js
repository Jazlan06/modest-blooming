import { FaLeaf, FaGem, FaShippingFast, FaHeart } from "react-icons/fa";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AboutPage = () => {
    return (
        <>
            <Navbar />

            <div className="relative min-h-screen mt-[4rem] md:mt-[7rem] bg-gradient-to-b from-white via-[#fff8f8] to-[#fdeef0] overflow-hidden">
                {/* Background Gradient Blobs */}
                <div className="absolute inset-0">
                    <div className="absolute top-[-15rem] left-[-10rem] w-[30rem] h-[30rem] bg-[#F4C2C2]/40 blur-[180px] rounded-full animate-blob"></div>
                    <div className="absolute bottom-[-15rem] right-[-12rem] w-[35rem] h-[35rem] bg-[#F4C2C2]/20 blur-[160px] rounded-full animate-blob animation-delay-2000"></div>
                </div>

                {/* Hero Section */}
                <section className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-20 flex flex-col lg:flex-row items-center gap-12">
                    <div className="lg:w-1/2 space-y-6 animate-fadeIn">
                        <h1 className="text-2xl font-serif sm:text-5xl font-extrabold text-gray-900 drop-shadow-sm">
                            About <span className="text-[#F4C2C2]">Modest Blooming</span>
                        </h1>
                        <p className="text-gray-700 text-lg md:text-xl leading-relaxed">
                            At <span className="font-semibold">Modest Blooming</span>, we celebrate elegance and modesty.
                            From hijabs, abayas, jilbabs, to chic accessories, our collection is designed for confident women who cherish
                            style without compromise.
                        </p>
                        <p className="text-gray-700 text-lg md:text-xl leading-relaxed">
                            Each piece is thoughtfully crafted with premium materials, attention to detail, and a passion for creating
                            timeless fashion that resonates with your individuality.
                        </p>
                    </div>

                    <div className="lg:w-1/2 relative rounded-3xl overflow-hidden shadow-2xl animate-fadeIn">
                        <img
                            src="/about-hero.jpg"
                            alt="Modest Blooming Collection"
                            className="w-full rounded-3xl object-cover transition-transform duration-700 hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#F4C2C2]/20 to-transparent"></div>
                    </div>
                </section>

                {/* Our Values Section */}
                <section className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-20">
                    <h2 className="text-4xl font-bold font-serif text-gray-900 text-center mb-12 animate-fadeIn">
                        Our Core Values
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
                        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl text-center shadow-lg hover:shadow-2xl transition-all duration-500 animate-slideUp">
                            <FaLeaf className="text-[#F4C2C2] text-4xl mx-auto mb-4" />
                            <h3 className="text-2xl font-semibold font-body mb-2">Sustainability</h3>
                            <p className="text-gray-700">We prioritize eco-friendly materials and ethical sourcing in every collection.</p>
                        </div>
                        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl text-center shadow-lg hover:shadow-2xl transition-all duration-500 animate-slideUp animation-delay-200">
                            <FaGem className="text-[#F4C2C2] text-4xl mx-auto mb-4" />
                            <h3 className="text-2xl font-semibold font-body mb-2">Premium Quality</h3>
                            <p className="text-gray-700">Every hijab, abaya, and accessory is crafted with attention to the finest details.</p>
                        </div>
                        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl text-center shadow-lg hover:shadow-2xl transition-all duration-500 animate-slideUp animation-delay-400">
                            <FaShippingFast className="text-[#F4C2C2] text-4xl mx-auto mb-4" />
                            <h3 className="text-2xl font-semibold font-body mb-2">Fast Delivery</h3>
                            <p className="text-gray-700">Reliable shipping ensures your favorite styles arrive safely and on time.</p>
                        </div>
                        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl text-center shadow-lg hover:shadow-2xl transition-all duration-500 animate-slideUp animation-delay-600">
                            <FaHeart className="text-[#F4C2C2] text-4xl mx-auto mb-4" />
                            <h3 className="text-2xl font-semibold font-body mb-2">Customer Love</h3>
                            <p className="text-gray-700">We value our community and craft experiences that make every customer feel special.</p>
                        </div>
                    </div>
                </section>

                {/* Story / Journey Section */}
                <section className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-20 flex flex-col lg:flex-row items-center gap-12">
                    <div className="lg:w-1/2 animate-slideUp">
                        <img
                            src="/about-story.jpg"
                            alt="Our Story"
                            className="w-full rounded-3xl object-cover shadow-2xl transition-transform duration-700 hover:scale-105"
                        />
                    </div>
                    <div className="lg:w-1/2 space-y-6 animate-fadeIn">
                        <h2 className="text-4xl font-bold font-serif text-gray-900">
                            Our Journey
                        </h2>
                        <p className="text-gray-700 text-lg leading-relaxed">
                            Modest Blooming started with a vision to combine style and modesty, creating pieces that empower women worldwide.
                            Our journey began with a small line of hijabs and has blossomed into a full fashion experience with abayas, jilbabs, and accessories.
                        </p>
                        <p className="text-gray-700 text-lg leading-relaxed">
                            Every product we release carries our dedication to quality, elegance, and timeless fashion. We believe in creating
                            collections that reflect your personality, faith, and unique style.
                        </p>
                    </div>
                </section>

                <section className="py-20 px-4 sm:px-6 lg:px-20 animate-fadeIn">
                    <h2 className="text-3xl sm:text-4xl font-bold font-serif text-gray-900 text-center mb-12">Sustainability & Ethics</h2>
                    <p className="text-gray-700 max-w-3xl mx-auto text-center text-lg leading-relaxed mb-8">
                        At Modest Blooming, we believe fashion can be both beautiful and responsible. We source materials ethically, minimize waste, and empower artisans around the world.
                    </p>
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div className="p-6 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
                            <FaLeaf className="text-[#F4C2C2] text-4xl mx-auto mb-4" />
                            <h3 className="font-semibold text-xl mb-2">Eco-Friendly Materials</h3>
                            <p className="text-gray-700">We prioritize sustainable fabrics like organic cotton and bamboo blends.</p>
                        </div>
                        <div className="p-6 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
                            <FaGem className="text-[#F4C2C2] text-4xl mx-auto mb-4" />
                            <h3 className="font-semibold text-xl mb-2">Fair Labor</h3>
                            <p className="text-gray-700">Supporting artisans with fair wages and safe working conditions.</p>
                        </div>
                        <div className="p-6 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
                            <FaHeart className="text-[#F4C2C2] text-4xl mx-auto mb-4" />
                            <h3 className="font-semibold text-xl mb-2">Minimizing Waste</h3>
                            <p className="text-gray-700">Smart cutting, leftover fabric repurposing, and eco-conscious packaging.</p>
                        </div>
                    </div>
                </section>

                {/* Testimonials / Customer Love Section */}
                <section className="bg-[#fdeef0] py-20 px-4 sm:px-6 lg:px-20">
                    <h2 className="text-4xl font-bold font-serif text-gray-900 text-center mb-12 animate-fadeIn">
                        What Our Customers Say
                    </h2>

                    <div className="relative max-w-5xl mx-auto">
                        <div className="flex overflow-x-auto space-x-6 snap-x snap-mandatory scrollbar-hide">
                            {/* Testimonial Card 1 */}
                            <div className="flex-shrink-0 w-80 bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 snap-center animate-slideUp">
                                <p className="text-gray-700 mb-4">
                                    “I absolutely love my new hijab! The fabric is soft, and the colors are gorgeous. Truly a premium experience.”
                                </p>
                                <div className="flex items-center gap-3">
                                    <img
                                        src="/customer.webp"
                                        alt="Customer"
                                        className="w-12 h-12 rounded-full object-cover shadow-sm"
                                    />
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Fatima N.</h4>
                                        <p className="text-sm text-gray-500">Mumbai, India</p>
                                    </div>
                                </div>
                            </div>

                            {/* Testimonial Card 2 */}
                            <div className="flex-shrink-0 w-80 bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 snap-center animate-slideUp animation-delay-200">
                                <p className="text-gray-700 mb-4">
                                    “The abaya I ordered exceeded my expectations! Beautifully crafted and arrived quickly. Highly recommend.”
                                </p>
                                <div className="flex items-center gap-3">
                                    <img
                                        src="/customer2.webp"
                                        alt="Customer"
                                        className="w-12 h-12 rounded-full object-cover shadow-sm"
                                    />
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Sara A.</h4>
                                        <p className="text-sm text-gray-500">Pune, India</p>
                                    </div>
                                </div>
                            </div>

                            {/* Testimonial Card 3 */}
                            <div className="flex-shrink-0 w-80 bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 snap-center animate-slideUp animation-delay-400">
                                <p className="text-gray-700 mb-4">
                                    “The packaging was so thoughtful and beautiful! Makes the unboxing experience special. I’ll definitely buy again.”
                                </p>
                                <div className="flex items-center gap-3">
                                    <img
                                        src="/customer3.webp"
                                        alt="Customer"
                                        className="w-12 h-12 rounded-full object-cover shadow-sm"
                                    />
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Alina B.</h4>
                                        <p className="text-sm text-gray-500">Mumbai, India</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-20 text-center relative z-10">
                    <div className="bg-[#F4C2C2]/20 backdrop-blur-xl rounded-3xl p-12 shadow-xl animate-fadeIn">
                        <h2 className="text-3xl sm:text-4xl font-bold font-serif text-gray-900 mb-6">
                            Join the Modest Blooming Family
                        </h2>
                        <p className="text-gray-700 text-lg mb-8">
                            Explore our collections and find the perfect pieces that speak to your style and values.
                            Be part of a community that celebrates elegance, modesty, and individuality.
                        </p>
                        <a
                            href="/products"
                            className="inline-block font-body px-8 py-4 bg-[#F4C2C2] text-white font-semibold rounded-full shadow-lg hover:bg-[#e39fa0] transition-all duration-300"
                        >
                            Explore Collections
                        </a>
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
          .animation-delay-200 { animation-delay: 0.2s; }
          .animation-delay-400 { animation-delay: 0.4s; }
          .animation-delay-600 { animation-delay: 0.6s; }
          .animation-delay-2000 { animation-delay: 2s; }
            .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
        `}</style>
            </div>
            <Footer />
        </>
    );
};

export default AboutPage;
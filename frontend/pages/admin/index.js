import Link from "next/link";
import {
    FaBoxOpen,
    FaPlusCircle,
    FaTruck,
    FaHome,
    FaClipboardList,
    FaPercentage,
    FaFireAlt,
    FaStar
} from "react-icons/fa";
import Navbar from "@/components/Navbar";
import withAdminAuth from '@/utils/withAdminAuth';


function AdminDashboard() {
    const adminLinks = [
        {
            title: "All Products",
            description: "Manage and edit existing products",
            href: "/admin/products",
            icon: <FaBoxOpen />,
            color: "from-pink-400 to-rose-500",
        },
        {
            title: "Create Product",
            description: "Add new products to the store",
            href: "/admin/products/create",
            icon: <FaPlusCircle />,
            color: "from-green-400 to-emerald-500",
        },
        {
            title: "Delivery Zones",
            description: "Set delivery rates and manage zones",
            href: "/admin/delivery-zones",
            icon: <FaTruck />,
            color: "from-teal-400 to-cyan-500",
        },
        {
            title: "Homepage CMS",
            description: "Control homepage banners and content",
            href: "/admin/homepage-cms",
            icon: <FaHome />,
            color: "from-violet-400 to-purple-500",
        },
        {
            title: "Orders",
            description: "View and manage customer orders",
            href: "/admin/orders",
            icon: <FaClipboardList />,
            color: "from-indigo-400 to-blue-500",
        },
        {
            title: "Feedback",
            description: "View, analyze & manage product feedback",
            href: "/admin/feedback",
            icon: <FaStar />,
            color: "from-yellow-400 to-amber-500",
        },
        {
            title: "Coupons",
            description: "Create and manage discount coupons",
            href: "/admin/coupons",
            icon: <FaPercentage />,
            color: "from-rose-400 to-pink-500",
        },
        {
            title: "Sales",
            description: "Manage current and upcoming sales",
            href: "/admin/sale",
            icon: <FaFireAlt />,
            color: "from-red-400 to-orange-500",
        },
    ];

    return (
        <>
            <Navbar />
            <div className="min-h-screen mt-[5rem] bg-gradient-to-b from-[#fff8f9] to-[#ffeef1] py-20 px-6 relative overflow-hidden">
                {/* ✨ Soft background blobs */}
                <div className="absolute top-[-8rem] left-[-8rem] w-96 h-96 bg-pink-200 rounded-full blur-[120px] opacity-40 animate-pulse" />
                <div className="absolute bottom-[-8rem] right-[-8rem] w-[28rem] h-[28rem] bg-rose-200 rounded-full blur-[140px] opacity-50 animate-pulse" />

                <div className="max-w-7xl mx-auto relative z-10">
                    {/* === Header Section === */}
                    <div className="text-center mb-16">
                        <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-pink-500 via-rose-500 to-red-400 bg-clip-text text-transparent tracking-tight drop-shadow-sm">
                            Admin Dashboard
                        </h1>
                        <p className="text-gray-600 mt-4 text-lg font-medium max-w-2xl mx-auto">
                            Streamline your store management — handle products, orders, sales & more with elegance and ease.
                        </p>
                        <div className="w-28 h-[4px] bg-gradient-to-r from-pink-400 to-rose-500 mx-auto mt-6 rounded-full shadow-md" />
                    </div>

                    {/* === Admin Links Grid === */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                        {adminLinks.map((item, i) => (
                            <Link key={i} href={item.href}>
                                <div
                                    className={`group relative bg-white/70 backdrop-blur-lg rounded-3xl shadow-lg hover:shadow-[0_20px_40px_rgba(255,182,193,0.3)] transition-all duration-300 border border-white/50 hover:-translate-y-3`}
                                >

                                    {/* Gradient Accent Bar */}
                                    <div
                                        className={`absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r ${item.color} rounded-t-3xl opacity-70`}
                                    />

                                    {/* Card Content */}
                                    <div className="relative p-8 flex flex-col items-start gap-6 z-10">
                                        {/* Icon Container */}
                                        <div
                                            className={`text-4xl p-4 rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-md group-hover:scale-110 group-hover:rotate-3 transform transition-transform duration-300`}
                                        >
                                            {item.icon}
                                        </div>

                                        {/* Title + Description */}
                                        <div>
                                            <h3 className="text-2xl font-semibold text-gray-800 group-hover:text-pink-600 transition-colors duration-300">
                                                {item.title}
                                            </h3>
                                            <p className="text-gray-600 mt-2 leading-relaxed text-[15px] font-normal">
                                                {item.description}
                                            </p>
                                        </div>

                                        {/* Manage Link */}
                                        <span className="mt-4 text-pink-600 font-semibold text-sm group-hover:underline flex items-center gap-1 tracking-wide">
                                            Manage <span className="text-lg">→</span>
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
export default withAdminAuth(AdminDashboard);
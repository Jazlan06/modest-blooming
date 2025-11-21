import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { FaArrowLeft } from 'react-icons/fa';
import Stepper from '@/components/Stepper';

export default function AddressPage() {
    const router = useRouter();
    const { redirect } = router.query;
    const isPaymentFlow = redirect === 'payment';
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [token, setToken] = useState('');
    const [newAddress, setNewAddress] = useState({
        label: 'Home',
        fullName: '',
        phone: '',
        street: '',
        apartment: '',
        locality: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false
    });

    const fetchAddresses = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/address', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAddresses(res.data || []);
        } catch (err) {
            console.error("Error fetching addresses:", err);
            setAddresses([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
            setLoading(false);
            return;
        }
        setToken(storedToken);
    }, []);

    useEffect(() => {
        if (token) fetchAddresses();
    }, [token]);

    const handleAddAddress = async (e) => {
        e.preventDefault();
        if (!token) return alert("Please login to add address");

        try {
            await axios.post('http://localhost:5000/api/address', newAddress, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNewAddress({
                label: 'Home',
                fullName: '',
                phone: '',
                street: '',
                apartment: '',
                locality: '',
                city: '',
                state: '',
                pincode: '',
                isDefault: false
            });
            setShowForm(false);
            fetchAddresses();
            if (isPaymentFlow) router.push('/payment');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Something went wrong');
        }
    };

    const handleDelete = async (id) => {
        if (!token) return alert("Please login to delete address");
        if (!confirm("Are you sure you want to delete this address?")) return;

        try {
            await axios.delete(`http://localhost:5000/api/address/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAddresses();
        } catch (err) {
            console.error(err);
            alert('Failed to delete address');
        }
    };

    const handleSetDefault = async (id) => {
        if (!token) return alert("Please login to set default address");

        try {
            await axios.put(`http://localhost:5000/api/address/${id}/default`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAddresses();
            if (isPaymentFlow) router.push('/payment');
        } catch (err) {
            console.error(err);
            alert('Failed to set default address');
        }
    };

    const steps = ['Cart', 'Address', 'Payment'];
    const currentStep = 1;

    if (loading) return <p className="text-center mt-12 text-gray-500">Loading...</p>;

    // ===== Neumorphic shadow styles =====
    const neumorphicShadow = "shadow-neu bg-gray-50 rounded-xl p-6 transition-all hover:shadow-neu-hover";
    const inputShadow = "bg-gray-50 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-inner-neu";

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* ===== Header ===== */}
            <div className="flex items-center gap-3 mb-6">
                <FaArrowLeft
                    size={22}
                    className="cursor-pointer text-gray-600 hover:text-gray-900 transition-colors"
                    onClick={() => router.back()}
                />
                <h1 className="text-2xl sm:text-3xl font-semibold font-display text-gray-800">
                    {isPaymentFlow ? 'Select Shipping Address' : 'Manage Addresses'}
                </h1>
            </div>

            {/* ===== Empty state ===== */}
            {addresses.length === 0 && !showForm && (
                <div className={`${neumorphicShadow} text-center`}>
                    <p className="mb-6 text-gray-600 text-lg">
                        {isPaymentFlow
                            ? 'No addresses found. Please add one to continue to payment.'
                            : 'No addresses saved yet.'}
                    </p>
                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all font-medium shadow-md"
                        onClick={() => setShowForm(true)}
                    >
                        Add Address
                    </button>
                </div>
            )}

            {/* ===== Add/Edit Form ===== */}
            {showForm && (
                <form
                    onSubmit={handleAddAddress}
                    className={`${neumorphicShadow} mb-8`}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <input
                            type="text"
                            placeholder="Full Name"
                            required
                            value={newAddress.fullName}
                            onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                            className={inputShadow}
                        />
                        <input
                            type="text"
                            placeholder="Phone"
                            required
                            value={newAddress.phone}
                            onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                            className={inputShadow}
                        />
                        <select
                            value={newAddress.label}
                            onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                            className={inputShadow}
                        >
                            <option value="Home">Home</option>
                            <option value="Office">Office</option>
                            <option value="Other">Other</option>
                        </select>
                        <label className="flex items-center gap-2 mt-2 md:mt-0">
                            <input
                                type="checkbox"
                                checked={newAddress.isDefault}
                                onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                                className="h-5 w-5 rounded shadow-inner-neu accent-blue-500"
                            />
                            <span className="text-gray-700 font-medium">Set as default</span>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                        <input
                            type="text"
                            placeholder="Apartment / Suite"
                            value={newAddress.apartment}
                            onChange={(e) => setNewAddress({ ...newAddress, apartment: e.target.value })}
                            className={inputShadow}
                        />
                        <input
                            type="text"
                            placeholder="Street"
                            required
                            value={newAddress.street}
                            onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                            className={inputShadow}
                        />
                        <input
                            type="text"
                            placeholder="Locality"
                            value={newAddress.locality}
                            onChange={(e) => setNewAddress({ ...newAddress, locality: e.target.value })}
                            className={inputShadow}
                        />
                        <input
                            type="text"
                            placeholder="City"
                            required
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                            className={inputShadow}
                        />
                        <input
                            type="text"
                            placeholder="State"
                            required
                            value={newAddress.state}
                            onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                            className={inputShadow}
                        />
                        <input
                            type="text"
                            placeholder="Pincode"
                            required
                            value={newAddress.pincode}
                            onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                            className={inputShadow}
                        />
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium shadow-md transition-all">
                            {isPaymentFlow ? 'Continue to Payment' : 'Save Address'}
                        </button>
                        <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium shadow-inner-neu transition-all">
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {isPaymentFlow && <Stepper steps={steps} currentStep={currentStep} />}

            {/* ===== Address List ===== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {addresses.map((addr) => (
                    <div
                        key={addr._id}
                        className={`border ${addr.isDefault ? 'border-blue-400' : 'border-gray-200'} rounded-xl p-5 shadow-neu transition-all hover:shadow-neu-hover bg-gray-50 flex flex-col justify-between`}
                    >
                        <div className="mb-3">
                            <p className="font-semibold font-body text-gray-800 text-lg">
                                {addr.fullName} ({addr.label}){' '}
                                {addr.isDefault && <span className="text-blue-500 font-medium">(Default)</span>}
                            </p>
                            <p className="text-gray-600 mt-1 text-sm font-serif">
                                {addr.street}, {addr.apartment && addr.apartment + ','} {addr.locality}, {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                            <p className="text-gray-600 text-sm mt-1 font-body">Phone: {addr.phone}</p>
                        </div>
                        <div className="flex gap-3 mt-2 font-body">
                            {!addr.isDefault && (
                                <button
                                    onClick={() => handleSetDefault(addr._id)}
                                    className="text-blue-600 font-medium font-body hover:underline text-sm"
                                >
                                    {isPaymentFlow ? 'Deliver Here' : 'Set Default'}
                                </button>
                            )}
                            {!isPaymentFlow && (
                                <button
                                    onClick={() => handleDelete(addr._id)}
                                    className="text-red-600 font-medium font-body hover:underline text-sm"
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {!showForm && addresses.length > 0 && (
                <div className="mt-6 flex justify-center gap-4">
                    {/* Add New Address Button */}
                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-md transition-all"
                        onClick={() => setShowForm(true)}
                    >
                        {isPaymentFlow ? "Add New Address" : "Add Address"}
                    </button>

                    {/* Proceed to Payment only if user has a default address */}
                    {addresses.some((addr) => addr.isDefault) && isPaymentFlow && (
                        <button
                            onClick={() => {
                                // ✅ Retrieve temporary order info (from /cart)
                                const tempOrder = localStorage.getItem("tempOrder");
                                if (!tempOrder) {
                                    alert("No order details found. Please try again.");
                                    router.push("/cart");
                                    return;
                                }

                                // ✅ Parse and attach the selected/default address
                                const parsedOrder = JSON.parse(tempOrder);
                                const defaultAddress = addresses.find((addr) => addr.isDefault);

                                if (!defaultAddress) {
                                    alert("Please select a delivery address.");
                                    return;
                                }

                                // ✅ Store address details into tempOrder for payment page
                                parsedOrder.addressId = defaultAddress._id;
                                parsedOrder.address = defaultAddress;

                                localStorage.setItem("tempOrder", JSON.stringify(parsedOrder));

                                // ✅ Move to payment page
                                router.push("/payment");
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium shadow-md transition-all"
                        >
                            Proceed to Payment
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
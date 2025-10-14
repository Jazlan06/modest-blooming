const DeliveryZone = require('../models/DeliveryZone');

// Async version of getZoneRate
const getZoneRate = async (address) => {
    const fullAddress = `${address.locality} ${address.city} ${address.state}`.toLowerCase();
    const zones = await DeliveryZone.find();

    for (const zone of zones) {
        if (zone.keywords.some(keyword => fullAddress.includes(keyword))) {
            return zone.rate;
        }
    }
    return 100;
};

const calculateTotalWeight = (cartItems, isHamper = false) => {
    let totalWeight = 0;

    for (const item of cartItems) {
        const { product, selectedVariant, quantity } = item;
        const variant = product.colors?.find(c => c.colorName === selectedVariant);
        const weightPerItem = variant?.weight || product.weight || 0;

        totalWeight += weightPerItem * quantity;
    }
    if (isHamper) {
        totalWeight += 0.25;
    }
    return Math.ceil(totalWeight);
};

const calculateDeliveryCharge = async ({ cartItems, address, isHamper = false }) => {
    const totalWeight = calculateTotalWeight(cartItems, isHamper);
    const ratePerKg = await getZoneRate(address);
    const deliveryCharge = totalWeight * ratePerKg;

    return {
        totalWeight,
        ratePerKg,
        deliveryCharge
    };
};

module.exports = {
    getZoneRate,
    calculateDeliveryCharge
};
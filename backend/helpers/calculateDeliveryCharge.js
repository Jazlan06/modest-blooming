const ZONE_RATES = [
  {
    zone: 1,
    keywords: ['mumbai', 'navi mumbai', 'thane', 'mazgaon', 'dockyard'],
    rate: 50,
  },
  {
    zone: 2,
    keywords: ['maharashtra'],
    rate: 60,
  },
  {
    zone: 3,
    keywords: ['gujarat'],
    rate: 70,
  },
  {
    zone: 4,
    keywords: ['goa', 'madhya pradesh', 'chhattisgarh', 'telangana', 'andhra pradesh', 'karnataka'],
    rate: 80,
  },
  {
    zone: 5,
    keywords: [
      'jammu', 'kashmir', 'himachal', 'punjab', 'uttarakhand', 'bihar', 'assam', 'manipur',
      'nagaland', 'meghalaya', 'tripura', 'mizoram', 'arunachal', 'sikkim', 'jharkhand'
    ],
    rate: 140,
  },
  {
    zone: 6,
    keywords: [], // fallback
    rate: 100,
  },
];

const getZoneRate = (address) => {
  const fullAddress = `${address.locality} ${address.city} ${address.state}`.toLowerCase();

  for (const zone of ZONE_RATES) {
    if (zone.keywords.some(keyword => fullAddress.includes(keyword))) {
      return zone.rate;
    }
  }

  return 100; // default DTDC rate
};

const calculateTotalWeight = (cartItems, isHamper = false) => {
  let totalWeight = 0;

  for (const item of cartItems) {
    const { product, selectedVariant, quantity } = item;

    // Variant-specific weight if available
    const variant = product.colors?.find(c => c.colorName === selectedVariant);
    const weightPerItem = variant?.weight || product.weight || 0;

    totalWeight += weightPerItem * quantity;
  }

  if (isHamper) {
    totalWeight += 0.25; // hamper extra weight
  }

  // Round up to next integer
  return Math.ceil(totalWeight);
};

const calculateDeliveryCharge = ({ cartItems, address, isHamper = false }) => {
  const totalWeight = calculateTotalWeight(cartItems, isHamper);
  const ratePerKg = getZoneRate(address);
  const deliveryCharge = totalWeight * ratePerKg;

  return {
    totalWeight,
    ratePerKg,
    deliveryCharge,
  };
};

module.exports = {
  calculateDeliveryCharge,
};

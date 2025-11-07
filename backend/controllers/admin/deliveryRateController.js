const DeliveryZone = require('../../models/DeliveryZone');

exports.getAllZones = async (req, res) => {
  const zones = await DeliveryZone.find().sort('zone');
  res.json({ success: true, data: zones });
};

exports.updateZoneRate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, keywords, rate } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (rate !== undefined) updateData.rate = rate;
    if (keywords !== undefined)
      updateData.keywords = Array.isArray(keywords)
        ? keywords
        : keywords.split(',').map((k) => k.trim());

    const updated = await DeliveryZone.findByIdAndUpdate(id, updateData, { new: true });
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("Error updating zone:", err);
    res.status(500).json({ success: false, message: "Failed to update zone" });
  }
};

exports.createZone = async (req, res) => {
  try {
    const body = req.body;

    const isBulk = Array.isArray(body);

    const createdZones = isBulk
      ? await DeliveryZone.insertMany(body)
      : await DeliveryZone.create(body);

    res.status(201).json({
      success: true,
      data: createdZones,
      message: isBulk ? 'Zones created successfully' : 'Zone created successfully'
    });
  } catch (err) {
    console.error('Error creating zone(s):', err);
    res.status(500).json({ success: false, message: 'Failed to create zone(s)' });
  }
};

exports.deleteZone = async (req, res) => {
  await DeliveryZone.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Zone deleted' });
};